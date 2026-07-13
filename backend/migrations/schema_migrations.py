from sqlalchemy import inspect, text

from database import db


def ensure_donation_history_columns():
    """Idempotent compatibility migration for existing MySQL installations."""
    inspector = inspect(db.engine)
    if 'donation_history' not in inspector.get_table_names():
        return
    existing = {column['name'] for column in inspector.get_columns('donation_history')}
    additions = {
        'request_id': 'INTEGER NULL',
        'hospital_id': 'INTEGER NULL',
        'status': "VARCHAR(20) NOT NULL DEFAULT 'completed'",
        'location': 'VARCHAR(200) NULL',
    }
    for name, definition in additions.items():
        if name not in existing:
            db.session.execute(text(
                f'ALTER TABLE donation_history ADD COLUMN {name} {definition}'
            ))
    db.session.commit()

    indexes = {index['name'] for index in inspect(db.engine).get_indexes('donation_history')}
    if 'uq_donation_history_request_id' not in indexes:
        db.session.execute(text(
            'CREATE UNIQUE INDEX uq_donation_history_request_id '
            'ON donation_history (request_id)'
        ))
        db.session.commit()


def ensure_inventory_ownership_schema():
    """Add Hospital ownership while preserving existing Blood Bank rows."""
    inspector = inspect(db.engine)
    if 'blood_inventory' not in inspector.get_table_names():
        return

    existing = {
        column['name']: column for column in inspector.get_columns('blood_inventory')
    }
    if 'hospital_id' not in existing:
        db.session.execute(text(
            'ALTER TABLE blood_inventory ADD COLUMN hospital_id INTEGER NULL'
        ))
        db.session.commit()

    inspector = inspect(db.engine)
    existing = {
        column['name']: column for column in inspector.get_columns('blood_inventory')
    }
    check_names = {
        check.get('name')
        for check in inspector.get_check_constraints('blood_inventory')
    }

    # SQLite cannot alter nullability or add table constraints in place. Rebuild
    # only legacy tables; freshly-created databases already have the new schema.
    if db.engine.dialect.name == 'sqlite' and (
        not existing['blood_bank_id']['nullable']
        or 'ck_blood_inventory_exactly_one_owner' not in check_names
    ):
        db.session.execute(text('PRAGMA foreign_keys=OFF'))
        db.session.execute(text(
            'CREATE TABLE blood_inventory_new ('
            'id INTEGER NOT NULL PRIMARY KEY, '
            'hospital_id INTEGER NULL, '
            'blood_bank_id INTEGER NULL, '
            'blood_type VARCHAR(10) NOT NULL, '
            'quantity INTEGER NOT NULL, '
            'CONSTRAINT ck_blood_inventory_exactly_one_owner CHECK ('
            '(hospital_id IS NOT NULL AND blood_bank_id IS NULL) OR '
            '(hospital_id IS NULL AND blood_bank_id IS NOT NULL)), '
            'FOREIGN KEY(hospital_id) REFERENCES hospitals (id), '
            'FOREIGN KEY(blood_bank_id) REFERENCES blood_banks (id))'
        ))
        db.session.execute(text(
            'INSERT INTO blood_inventory_new '
            '(id, hospital_id, blood_bank_id, blood_type, quantity) '
            'SELECT id, hospital_id, blood_bank_id, blood_type, quantity '
            'FROM blood_inventory'
        ))
        db.session.execute(text('DROP TABLE blood_inventory'))
        db.session.execute(text(
            'ALTER TABLE blood_inventory_new RENAME TO blood_inventory'
        ))
        db.session.commit()
        db.session.execute(text('PRAGMA foreign_keys=ON'))
        return

    # The deployed application uses MySQL. Existing blood_bank_id columns were
    # NOT NULL, so make that owner optional before Hospital inventory is written.
    if db.engine.dialect.name == 'mysql' and not existing['blood_bank_id']['nullable']:
        db.session.execute(text(
            'ALTER TABLE blood_inventory MODIFY COLUMN blood_bank_id INTEGER NULL'
        ))
        db.session.commit()

    inspector = inspect(db.engine)
    foreign_key_columns = {
        column
        for foreign_key in inspector.get_foreign_keys('blood_inventory')
        for column in foreign_key.get('constrained_columns', [])
    }
    if db.engine.dialect.name == 'mysql' and 'hospital_id' not in foreign_key_columns:
        db.session.execute(text(
            'ALTER TABLE blood_inventory '
            'ADD CONSTRAINT fk_blood_inventory_hospital '
            'FOREIGN KEY (hospital_id) REFERENCES hospitals (id)'
        ))
        db.session.commit()

    check_names = {
        check.get('name')
        for check in inspect(db.engine).get_check_constraints('blood_inventory')
    }
    if (
        db.engine.dialect.name == 'mysql'
        and 'ck_blood_inventory_exactly_one_owner' not in check_names
    ):
        db.session.execute(text(
            'ALTER TABLE blood_inventory '
            'ADD CONSTRAINT ck_blood_inventory_exactly_one_owner CHECK ('
            '(hospital_id IS NOT NULL AND blood_bank_id IS NULL) OR '
            '(hospital_id IS NULL AND blood_bank_id IS NOT NULL))'
        ))
        db.session.commit()

def backfill_accepted_donations():
    """Repair responses written before donor acceptance became atomic completion."""
    from models.donation_history import DonationHistory
    from models.donor_response import DonorResponse
    from services.blood_request_workflow import transition_response

    legacy = DonorResponse.query.filter(
        DonorResponse.status.in_(('pending', 'accepted'))
    ).order_by(DonorResponse.created_at.asc(), DonorResponse.id.asc()).all()
    changed = False
    for response in legacy:
        if not response.blood_request:
            continue
        existing = DonationHistory.query.filter_by(
            request_id=response.blood_request_id
        ).first()
        if existing:
            response.status = (
                'completed' if existing.donor_id == response.donor_id else 'rejected'
            )
            response.blood_request.status = 'completed'
        else:
            # Old "accepted" means the donor already performed the action that
            # now directly completes the donation.
            response.status = 'pending'
            transition_response(response, 'completed')
        changed = True
    if changed:
        db.session.commit()
