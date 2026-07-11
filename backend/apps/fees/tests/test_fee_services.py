from unittest.mock import MagicMock, patch

import pytest

from apps.fees.domain.fee_exceptions import (
    FeeConflictError,
    FeeNotFoundError,
    FeeValidationError,
)
from apps.fees.services.fee_group_service import FeeGroupService
from apps.fees.services.fee_type_service import FeeTypeService


@pytest.fixture
def group_service():
    return FeeGroupService()


@pytest.fixture
def type_service():
    return FeeTypeService()


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
