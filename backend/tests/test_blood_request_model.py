from models.blood_request import BloodRequest


def test_blood_request_serialize_includes_expected_fields():
    request = BloodRequest(
        id=1,
        hospital_id=2,
        blood_type="A+",
        quantity=3,
        status="Pending",
    )

    payload = request.serialize()

    assert payload["id"] == 1
    assert payload["hospital_id"] == 2
    assert payload["blood_type"] == "A+"
    assert payload["quantity"] == 3
    assert payload["status"] == "Pending"
