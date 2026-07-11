from unittest.mock import MagicMock, patch

import pytest

from apps.fees.domain.fee_exceptions import FeeValidationError
from apps.fees.services.fee_collect_service import FeeCollectService


@pytest.fixture
def collect_service():
    return FeeCollectService()


def test_get_roster_requires_active_session(collect_service):
    with patch(
        "apps.fees.services.fee_collect_service.selectors.get_active_session",
        return_value=None,
    ):
        with pytest.raises(FeeValidationError, match="active academic session"):
            collect_service.get_roster(1, 2)


def test_get_roster_requires_class_section_mapping(collect_service):
    session = MagicMock(session="2025-26")
    with (
        patch(
            "apps.fees.services.fee_collect_service.selectors.get_active_session",
            return_value=session,
        ),
        patch(
            "apps.fees.services.fee_collect_service.selectors.class_section_mapping_active",
            return_value=False,
        ),
    ):
        with pytest.raises(FeeValidationError, match="not assigned"):
            collect_service.get_roster(1, 2)
