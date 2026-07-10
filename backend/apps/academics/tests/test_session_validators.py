import pytest

from apps.academics.domain.session_exceptions import SessionValidationError
from apps.academics.domain.session_validators import validate_session_name


@pytest.mark.parametrize(
    "raw,expected",
    [
        ("2026-27", "2026-27"),
        (" 2026-27 ", "2026-27"),
        ("2020-21", "2020-21"),
    ],
)
def test_validate_session_name_accepts_valid_formats(raw, expected):
    assert validate_session_name(raw) == expected


@pytest.mark.parametrize(
    "raw",
    [
        "",
        "   ",
        "2026-2027",
        "2026-28",
        "abcd-ef",
        "26-27",
    ],
)
def test_validate_session_name_rejects_invalid_formats(raw):
    with pytest.raises(SessionValidationError):
        validate_session_name(raw)
