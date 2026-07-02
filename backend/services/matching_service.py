from models.user import User
from math import radians, sin, cos, sqrt, atan2

# Blood compatibility check
def is_compatible(donor_blood_type, request_blood_type):
    compatible_types = {
        'A+': ['A+', 'A-', 'O+', 'O-'],
        'A-': ['A-', 'O-'],
        'B+': ['B+', 'B-', 'O+', 'O-'],
        'B-': ['B-','O-'],
        'AB+': ['AB+', 'AB-', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-'],
        'AB-': ['AB-', 'A-', 'B-', 'O-'],
        'O+': ['O+', 'O-'],
        'O-': ['O-']
    }
    return request_blood_type in compatible_types.get(donor_blood_type, [])

# Haversine formula to calculate distance
def haversine(lat1, lon1, lat2, lon2):
    R = 6371.0  # Earth radius in kilometers
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat / 2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2)**2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return R * c

# Function to rank donors based on compatibility and distance
def rank_donors(blood_request):
    donors = User.query.filter_by(role='DONOR', available=True).all()
    matched_donors = []
    for donor in donors:
        if is_compatible(donor.blood_type, blood_request.blood_type):
            distance = haversine(blood_request.hospital_lat, blood_request.hospital_lon, donor.location_lat, donor.location_lon)
            matched_donors.append((donor, distance))
    # Sort donors by distance
    matched_donors.sort(key=lambda x: x[1])
    return matched_donors
