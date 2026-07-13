import os
import sys
import unittest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from flask import Flask
from flask_jwt_extended import JWTManager, create_access_token
from sqlalchemy import inspect, text
from sqlalchemy.exc import IntegrityError

from database import db
from controllers.blood_bank_controller import blood_bank_bp
from models.blood_bank import BloodBank
from models.blood_inventory import BloodInventory
from models.hospital import Hospital
from models.user import User
from migrations.schema_migrations import ensure_inventory_ownership_schema


class InventoryAuthorizationTestCase(unittest.TestCase):
    def setUp(self):
        self.app = Flask(__name__)
        self.app.config.update(
            TESTING=True,
            SQLALCHEMY_DATABASE_URI='sqlite:///:memory:',
            SQLALCHEMY_TRACK_MODIFICATIONS=False,
            JWT_SECRET_KEY='inventory-test-secret-at-least-32-bytes',
        )
        db.init_app(self.app)
        JWTManager(self.app)
        self.app.register_blueprint(blood_bank_bp, url_prefix='/blood_bank')

        with self.app.app_context():
            db.create_all()

            hospital_a = Hospital(name='Hospital A', location='Jakarta')
            hospital_b = Hospital(name='Hospital B', location=' JAKARTA ')
            hospital_c = Hospital(name='Hospital C', location='Tokyo')
            bank_a = BloodBank(name='Blood Bank A', location=' jakarta ')
            db.session.add_all([hospital_a, hospital_b, hospital_c, bank_a])
            db.session.flush()

            inventory = {
                'hospital_a': BloodInventory(
                    hospital_id=hospital_a.id, blood_type='A+', quantity=3
                ),
                'hospital_b': BloodInventory(
                    hospital_id=hospital_b.id, blood_type='A+', quantity=2
                ),
                'hospital_c': BloodInventory(
                    hospital_id=hospital_c.id, blood_type='A+', quantity=4
                ),
                'bank_a': BloodInventory(
                    blood_bank_id=bank_a.id, blood_type='A+', quantity=2
                ),
            }
            db.session.add_all(inventory.values())

            users = {
                'hospital_a': User(
                    username='hospital_a', password_hash='hash', role='hospital',
                    full_name='Hospital A', location=' jakarta '
                ),
                'hospital_b': User(
                    username='hospital_b', password_hash='hash', role='hospital',
                    full_name='Hospital B', location=' JAKARTA '
                ),
                'hospital_c': User(
                    username='hospital_c', password_hash='hash', role='hospital',
                    full_name='Hospital C', location='Tokyo'
                ),
                'bank_a': User(
                    username='bank_a', password_hash='hash', role='blood_bank',
                    full_name='Blood Bank A', location=' jakarta '
                ),
                'donor': User(
                    username='donor', password_hash='hash', role='donor',
                    location='Jakarta'
                ),
                'transportation': User(
                    username='transport', password_hash='hash',
                    role='transportation', location='Jakarta'
                ),
            }
            db.session.add_all(users.values())
            db.session.commit()

            self.facility_ids = {
                'hospital_a': hospital_a.id,
                'hospital_b': hospital_b.id,
                'hospital_c': hospital_c.id,
                'bank_a': bank_a.id,
            }
            self.inventory_ids = {
                name: item.id for name, item in inventory.items()
            }
            self.tokens = {
                name: create_access_token(identity=str(user.id))
                for name, user in users.items()
            }

        self.client = self.app.test_client()

    def tearDown(self):
        with self.app.app_context():
            db.session.remove()
            db.drop_all()

    def headers(self, user):
        return {'Authorization': f'Bearer {self.tokens[user]}'}

    def test_jakarta_inventory_and_totals_are_location_scoped(self):
        response = self.client.get(
            '/blood_bank/inventory', headers=self.headers('hospital_a')
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json['location'], 'jakarta')
        self.assertEqual(response.json['totals'], {'A+': 7})
        self.assertEqual(len(response.json['data']), 3)
        self.assertEqual(
            {item['facility_name'] for item in response.json['data']},
            {'Hospital A', 'Hospital B', 'Blood Bank A'},
        )
        self.assertTrue(all(
            item['owner_type'] in ('hospital', 'blood_bank')
            and item['location'].strip().lower() == 'jakarta'
            for item in response.json['data']
        ))
        owned = [
            item for item in response.json['data']
            if item['is_owned_by_current_user']
        ]
        self.assertEqual([item['facility_name'] for item in owned], ['Hospital A'])

    def test_tokyo_users_do_not_see_jakarta_inventory_or_totals(self):
        response = self.client.get(
            '/blood_bank/inventory', headers=self.headers('hospital_c')
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json['totals'], {'A+': 4})
        self.assertEqual(
            [item['facility_name'] for item in response.json['data']],
            ['Hospital C'],
        )

    def test_hospital_and_blood_bank_create_their_own_inventory(self):
        response = self.client.post(
            '/blood_bank/inventory',
            json={'blood_type': 'B+', 'quantity': 3, 'blood_bank_id': 999},
            headers=self.headers('hospital_a'),
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json['data']['owner_type'], 'hospital')
        self.assertEqual(
            response.json['data']['hospital_id'], self.facility_ids['hospital_a']
        )
        self.assertIsNone(response.json['data']['blood_bank_id'])

        response = self.client.post(
            '/blood_bank/inventory',
            json={'blood_type': 'O+', 'quantity': 2, 'hospital_id': 999},
            headers=self.headers('bank_a'),
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json['data']['owner_type'], 'blood_bank')
        self.assertEqual(
            response.json['data']['blood_bank_id'], self.facility_ids['bank_a']
        )
        self.assertIsNone(response.json['data']['hospital_id'])

        response = self.client.get(
            '/blood_bank/inventory', headers=self.headers('hospital_b')
        )
        self.assertEqual(
            response.json['totals'], {'A+': 7, 'B+': 3, 'O+': 2}
        )

    def test_facilities_cannot_modify_other_facilities_inventory(self):
        forbidden_cases = (
            ('hospital_a', 'hospital_b'),
            ('hospital_a', 'bank_a'),
            ('bank_a', 'hospital_a'),
        )
        for user, inventory_owner in forbidden_cases:
            inventory_id = self.inventory_ids[inventory_owner]
            response = self.client.put(
                f'/blood_bank/inventory/{inventory_id}',
                json={'quantity': 9},
                headers=self.headers(user),
            )
            self.assertEqual(response.status_code, 403)

            response = self.client.delete(
                f'/blood_bank/inventory/{inventory_id}',
                headers=self.headers(user),
            )
            self.assertEqual(response.status_code, 403)

    def test_each_facility_can_update_and_delete_its_own_inventory(self):
        for user in ('hospital_a', 'bank_a'):
            inventory_id = self.inventory_ids[user]
            response = self.client.put(
                f'/blood_bank/inventory/{inventory_id}',
                json={'blood_type': 'AB+', 'quantity': 6},
                headers=self.headers(user),
            )
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.json['data']['quantity'], 6)

            response = self.client.delete(
                f'/blood_bank/inventory/{inventory_id}',
                headers=self.headers(user),
            )
            self.assertEqual(response.status_code, 200)

    def test_invalid_quantities_missing_records_and_other_roles(self):
        response = self.client.put(
            f"/blood_bank/inventory/{self.inventory_ids['hospital_a']}",
            json={'quantity': -1},
            headers=self.headers('hospital_a'),
        )
        self.assertEqual(response.status_code, 400)

        response = self.client.post(
            '/blood_bank/inventory',
            json={'blood_type': 'A+', 'quantity': '3'},
            headers=self.headers('hospital_a'),
        )
        self.assertEqual(response.status_code, 400)

        response = self.client.put(
            '/blood_bank/inventory/999999',
            json={'quantity': 1},
            headers=self.headers('hospital_a'),
        )
        self.assertEqual(response.status_code, 404)

        for role in ('donor', 'transportation'):
            response = self.client.get(
                '/blood_bank/inventory', headers=self.headers(role)
            )
            self.assertEqual(response.status_code, 403)
            response = self.client.post(
                '/blood_bank/inventory',
                json={'blood_type': 'A+', 'quantity': 1},
                headers=self.headers(role),
            )
            self.assertEqual(response.status_code, 403)

    def test_model_requires_exactly_one_owner(self):
        with self.app.app_context():
            db.session.add(BloodInventory(blood_type='O-', quantity=1))
            with self.assertRaises(IntegrityError):
                db.session.commit()
            db.session.rollback()

            db.session.add(BloodInventory(
                hospital_id=self.facility_ids['hospital_a'],
                blood_bank_id=self.facility_ids['bank_a'],
                blood_type='O-',
                quantity=1,
            ))
            with self.assertRaises(IntegrityError):
                db.session.commit()
            db.session.rollback()

    def test_legacy_inventory_schema_is_migrated_without_losing_rows(self):
        with self.app.app_context():
            db.session.execute(text('DROP TABLE blood_inventory'))
            db.session.execute(text(
                'CREATE TABLE blood_inventory ('
                'id INTEGER NOT NULL PRIMARY KEY, '
                'blood_bank_id INTEGER NOT NULL, '
                'blood_type VARCHAR(10) NOT NULL, '
                'quantity INTEGER NOT NULL)'
            ))
            db.session.execute(text(
                'INSERT INTO blood_inventory '
                '(id, blood_bank_id, blood_type, quantity) '
                'VALUES (100, :bank_id, :blood_type, :quantity)'
            ), {
                'bank_id': self.facility_ids['bank_a'],
                'blood_type': 'B-',
                'quantity': 5,
            })
            db.session.commit()

            ensure_inventory_ownership_schema()

            columns = {
                column['name']: column
                for column in inspect(db.engine).get_columns('blood_inventory')
            }
            self.assertIn('hospital_id', columns)
            self.assertTrue(columns['blood_bank_id']['nullable'])
            legacy = BloodInventory.query.get(100)
            self.assertEqual(legacy.blood_bank_id, self.facility_ids['bank_a'])
            self.assertIsNone(legacy.hospital_id)

            hospital_inventory = BloodInventory(
                hospital_id=self.facility_ids['hospital_a'],
                blood_type='B-',
                quantity=1,
            )
            db.session.add(hospital_inventory)
            db.session.commit()


if __name__ == '__main__':
    unittest.main()
