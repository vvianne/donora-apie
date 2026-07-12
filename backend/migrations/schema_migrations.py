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
