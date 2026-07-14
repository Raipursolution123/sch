from unittest.mock import MagicMock, patch

import pytest

from apps.fees.domain.fee_exceptions import (
    FeeConflictError,
    FeeNotFoundError,
    FeeValidationError,
)
from apps.fees.services.fee_discount_service import FeeDiscountService
from apps.fees.services.fee_group_service import FeeGroupService
from apps.fees.services.fee_type_service import FeeTypeService


@pytest.fixture
def group_service():
    return FeeGroupService()


@pytest.fixture
def type_service():
    return FeeTypeService()


@pytest.fixture
def discount_service():
    return FeeDiscountService()


def test_create_group_requires_name(group_service):
    with pytest.raises(FeeValidationError, match="name is required"):
        group_service.create_group({})


def test_get_group_not_found(group_service):
    with patch(
        "apps.fees.services.fee_group_service.FeeGroups.objects.filter"
    ) as filter_mock:
        filter_mock.return_value.first.return_value = None
        with pytest.raises(FeeNotFoundError):
            group_service.get_group(999)


def test_create_type_requires_code(type_service):
    with pytest.raises(FeeValidationError, match="code"):
        type_service.create_type({"name": "Tuition"})


def test_create_type_duplicate_code(type_service):
    with patch(
        "apps.fees.services.fee_type_service.Feetype.objects.filter"
    ) as filter_mock:
        filter_mock.return_value.exists.return_value = True
        with pytest.raises(FeeConflictError, match="code"):
            type_service.create_type({"name": "Tuition", "code": "TUI"})


def test_delete_type_requires_inactive(type_service):
    ft = MagicMock(is_active="yes")
    with patch(
        "apps.fees.services.fee_type_service.Feetype.objects.filter"
    ) as filter_mock:
        filter_mock.return_value.first.return_value = ft
        with pytest.raises(FeeValidationError, match="Deactivate"):
            type_service.delete_type(1)


def test_create_discount_requires_session(discount_service):
    with pytest.raises(FeeValidationError, match="Session is required"):
        discount_service.create_discount(
            {
                "name": "Sibling",
                "code": "SIB",
                "type": "percentage",
                "percentage": 10,
            }
        )


def test_create_discount_requires_percentage_for_percentage_type(discount_service):
    with patch(
        "apps.fees.services.fee_discount_service.Sessions.objects.filter"
    ) as sessions_filter:
        sessions_filter.return_value.exists.return_value = True
        with pytest.raises(FeeValidationError, match="Percentage is required"):
            discount_service.create_discount(
                {
                    "name": "Sibling",
                    "code": "SIB",
                    "type": "percentage",
                    "session_id": 1,
                }
            )


def test_delete_discount_requires_inactive(discount_service):
    discount = MagicMock(is_active="yes")
    with patch(
        "apps.fees.services.fee_discount_service.FeesDiscounts.objects.filter"
    ) as filter_mock:
        filter_mock.return_value.first.return_value = discount
        with pytest.raises(FeeValidationError, match="Deactivate"):
            discount_service.delete_discount(1)
