import pytest

from apps.settings.domain.general_settings_exceptions import (
    GeneralSettingsReadOnlyError,
    GeneralSettingsValidationError,
)
from apps.settings.domain.general_settings_validators import validate_and_normalize


def test_validate_school_profile():
    result = validate_and_normalize(
        {
            "name": "  Demo School ",
            "email": "admin@school.edu",
            "phone": "9876543210",
            "address": "Raipur",
            "dise_code": "CG-1",
        }
    )
    assert result["name"] == "Demo School"
    assert result["email"] == "admin@school.edu"


def test_validate_rejects_empty_name():
    with pytest.raises(GeneralSettingsValidationError):
        validate_and_normalize({"name": "   "})


def test_validate_rejects_bad_email():
    with pytest.raises(GeneralSettingsValidationError):
        validate_and_normalize({"email": "not-an-email"})


def test_validate_rejects_bad_timezone():
    with pytest.raises(GeneralSettingsValidationError):
        validate_and_normalize({"timezone": "Mars/Phobos"})


def test_validate_rejects_readonly():
    with pytest.raises(GeneralSettingsReadOnlyError):
        validate_and_normalize({"session_id": 1})


def test_validate_rejects_unknown():
    with pytest.raises(GeneralSettingsValidationError):
        validate_and_normalize({"adm_prefix": "x"})


def test_validate_fees_flags():
    result = validate_and_normalize(
        {
            "currency": "INR",
            "currency_symbol": "₹",
            "currency_place": "before_number",
            "collect_back_date_fees": 1,
            "fee_due_days": 30,
            "is_duplicate_fees_invoice": "1",
        }
    )
    assert result["is_duplicate_fees_invoice"] == "1"
    assert result["fee_due_days"] == 30
