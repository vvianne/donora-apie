from models.user import User


def normalize_location(value):
    return ' '.join((value or '').strip().lower().split())


def matching_donors(blood_request):
    if (blood_request.status or '').strip().lower() != 'pending':
        return []
    hospital_location = normalize_location(
        blood_request.hospital.location if blood_request.hospital else None
    )
    requested_type = (blood_request.blood_type or '').strip().upper()
    if not hospital_location or not requested_type:
        return []
    donors = User.query.filter_by(role='donor', available=True).all()
    return [
        donor for donor in donors
        if (donor.blood_type or '').strip().upper() == requested_type
        and normalize_location(donor.location) == hospital_location
    ]


def rank_donors(blood_request):
    # Exact location matching is the current project requirement; no GPS rank yet.
    return [donor.serialize() for donor in matching_donors(blood_request)]
