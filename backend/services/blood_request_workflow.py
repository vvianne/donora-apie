from datetime import datetime

from database import db
from models.donation_history import DonationHistory


ALLOWED_TRANSITIONS = {
    'pending': {'approved', 'completed', 'rejected', 'cancelled'},
    'approved': {'transporting', 'completed', 'cancelled'},
    'transporting': {'completed', 'cancelled'},
    'rejected': set(),
    'completed': set(),
    'cancelled': set(),
}


def transition_response(response, status):
    """Apply the canonical response/request/history transition atomically."""
    target = (status or '').strip().lower()
    previous = (response.status or 'pending').strip().lower()
    if target == previous:
        return response.blood_request
    if target not in ALLOWED_TRANSITIONS.get(previous, set()):
        raise ValueError(f'Cannot change response from {previous} to {target}.')

    blood_request = response.blood_request
    response.status = target

    if target == 'approved':
        blood_request.status = 'in_progress'
    elif target == 'transporting':
        blood_request.status = 'in_progress'
    elif target == 'completed':
        blood_request.status = 'completed'
        history = DonationHistory.query.filter_by(request_id=blood_request.id).first()
        if not history:
            hospital = blood_request.hospital
            db.session.add(DonationHistory(
                donor_id=response.donor_id,
                request_id=blood_request.id,
                hospital_id=blood_request.hospital_id,
                donation_date=datetime.utcnow().date().isoformat(),
                blood_type=blood_request.blood_type,
                status='completed',
                location=hospital.location if hospital else None,
            ))
    elif target == 'rejected':
        # A rejected donor must not close the request for other donors.
        other_active = response.__class__.query.filter(
            response.__class__.blood_request_id == blood_request.id,
            response.__class__.id != response.id,
            response.__class__.status.in_(('approved', 'transporting', 'completed')),
        ).first()
        if not other_active:
            blood_request.status = 'pending'
    elif target == 'cancelled':
        blood_request.status = 'cancelled'

    return blood_request
