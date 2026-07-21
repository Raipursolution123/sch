from unittest.mock import MagicMock, patch

import pytest

from apps.fees.domain.fee_exceptions import FeeConflictError, FeeValidationError
from apps.fees.services.offline_bank_payment_service import OfflineBankPaymentService


@pytest.fixture
def service():
    return OfflineBankPaymentService()


def test_list_rejects_bad_status(service):
    with pytest.raises(FeeValidationError, match="status must be"):
        service.list_payments(status="nope")


def test_list_rejects_inverted_dates(service):
    from datetime import date

    with pytest.raises(FeeValidationError, match="from_date"):
        service.list_payments(
            from_date=date(2026, 7, 20),
            to_date=date(2026, 7, 1),
        )


def test_approve_rejects_already_approved(service):
    payment = MagicMock(is_active="1")
    with patch.object(service, "get_payment", return_value=payment):
        with pytest.raises(FeeConflictError, match="already approved"):
            service.approve(1, approved_by=9)


def test_reject_rejects_already_approved(service):
    payment = MagicMock(is_active="1")
    with patch.object(service, "get_payment", return_value=payment):
        with pytest.raises(FeeConflictError, match="cannot be rejected"):
            service.reject(1, approved_by=9)
