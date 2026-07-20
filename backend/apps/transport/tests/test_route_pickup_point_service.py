"""
Tests for RoutePickupPointService — no database required (all mocked).
"""
from unittest.mock import MagicMock, patch

import pytest

from apps.transport.domain.transport_exceptions import (
    TransportNotFoundError,
    TransportValidationError,
)
from apps.transport.services.route_pickup_point_service import RoutePickupPointService


@pytest.fixture
def service():
    return RoutePickupPointService()


# ── create ─────────────────────────────────────────────────────────────────────

def test_create_requires_route_id(service):
    with pytest.raises(TransportValidationError, match="transport_route_id is required"):
        service.create({"pickup_point_id": 1})


def test_create_requires_pickup_id(service):
    with pytest.raises(TransportValidationError, match="pickup_point_id is required"):
        service.create({"transport_route_id": 1})


def test_create_prevents_duplicate(service):
    mock_existing = MagicMock(id=99)
    with patch(
        "apps.transport.services.route_pickup_point_service.RoutePickupPoint.objects"
    ) as mock_mgr:
        mock_mgr.filter.return_value.first.return_value = mock_existing
        with pytest.raises(TransportValidationError, match="already assigned"):
            service.create({"transport_route_id": 1, "pickup_point_id": 2})


def test_create_success(service):
    mock_obj = MagicMock(id=1)
    with patch(
        "apps.transport.services.route_pickup_point_service.RoutePickupPoint.objects"
    ) as mock_mgr:
        mock_mgr.filter.return_value.first.return_value = None
        mock_mgr.create.return_value = mock_obj
        result = service.create({"transport_route_id": 1, "pickup_point_id": 2})
        assert result == mock_obj
        mock_mgr.create.assert_called_once()


# ── get / not found ────────────────────────────────────────────────────────────

def test_get_not_found(service):
    with patch(
        "apps.transport.services.route_pickup_point_service.RoutePickupPoint.objects"
    ) as mock_mgr:
        mock_mgr.filter.return_value.first.return_value = None
        with pytest.raises(TransportNotFoundError, match="not found"):
            service.get(999)


# ── update ─────────────────────────────────────────────────────────────────────

def test_update_fees(service):
    mock_obj = MagicMock(id=1, fees=0.0)
    with patch(
        "apps.transport.services.route_pickup_point_service.RoutePickupPoint.objects"
    ) as mock_mgr:
        mock_mgr.filter.return_value.first.return_value = mock_obj
        result = service.update(1, {"fees": 150.0})
        assert result.fees == 150.0
        mock_obj.save.assert_called_once()


# ── delete ─────────────────────────────────────────────────────────────────────

def test_delete_success(service):
    mock_obj = MagicMock(id=1)
    with patch(
        "apps.transport.services.route_pickup_point_service.RoutePickupPoint.objects"
    ) as mock_mgr:
        mock_mgr.filter.return_value.first.return_value = mock_obj
        service.delete(1)
        mock_obj.delete.assert_called_once()


def test_delete_not_found(service):
    with patch(
        "apps.transport.services.route_pickup_point_service.RoutePickupPoint.objects"
    ) as mock_mgr:
        mock_mgr.filter.return_value.first.return_value = None
        with pytest.raises(TransportNotFoundError):
            service.delete(999)
