"""
Tests for VisitorsBookService, ComplaintService, DispatchReceiveService.

All tests use mocking — no database required.
"""
from unittest.mock import MagicMock, patch

import pytest

from apps.front_office.domain.front_office_exceptions import (
    FrontOfficeNotFoundError,
    FrontOfficeValidationError,
)
from apps.front_office.services.complaint_service import ComplaintService
from apps.front_office.services.dispatch_receive_service import DispatchReceiveService
from apps.front_office.services.visitors_book_service import VisitorsBookService


# ── Visitors Book ──────────────────────────────────────────────────────────────

@pytest.fixture
def visitor_service():
    return VisitorsBookService()


def test_create_visitor_requires_name(visitor_service):
    with pytest.raises(FrontOfficeValidationError, match="Visitor name is required"):
        visitor_service.create_visitor({"contact": "9999999999", "purpose": "Meeting"})


def test_create_visitor_requires_contact(visitor_service):
    with pytest.raises(FrontOfficeValidationError, match="Contact is required"):
        visitor_service.create_visitor({"name": "Jane", "purpose": "Meeting"})


def test_create_visitor_requires_purpose(visitor_service):
    with pytest.raises(FrontOfficeValidationError, match="Purpose is required"):
        visitor_service.create_visitor({"name": "Jane", "contact": "9999999999"})


def test_get_visitor_not_found(visitor_service):
    with patch(
        "apps.front_office.services.visitors_book_service.VisitorsBook.objects"
    ) as mock_mgr:
        mock_mgr.filter.return_value.first.return_value = None
        with pytest.raises(FrontOfficeNotFoundError, match="Visitor record not found"):
            visitor_service.get_visitor(999)


def test_create_visitor_success(visitor_service):
    import datetime
    mock_visitor = MagicMock(id=1)
    with patch(
        "apps.front_office.services.visitors_book_service.VisitorsBook.objects"
    ) as mock_mgr:
        mock_mgr.create.return_value = mock_visitor
        result = visitor_service.create_visitor(
            {
                "name": "Alice",
                "contact": "9876543210",
                "purpose": "Enquiry",
                "date": datetime.date.today(),
            }
        )
        assert result == mock_visitor
        mock_mgr.create.assert_called_once()


# ── Complaint ──────────────────────────────────────────────────────────────────

@pytest.fixture
def complaint_service():
    return ComplaintService()


def test_create_complaint_requires_name(complaint_service):
    with pytest.raises(FrontOfficeValidationError, match="Complainant name is required"):
        complaint_service.create_complaint({"date": "2024-01-01"})


def test_get_complaint_not_found(complaint_service):
    with patch(
        "apps.front_office.services.complaint_service.Complaint.objects"
    ) as mock_mgr:
        mock_mgr.filter.return_value.first.return_value = None
        with pytest.raises(FrontOfficeNotFoundError, match="Complaint not found"):
            complaint_service.get_complaint(99)


def test_create_complaint_success(complaint_service):
    import datetime
    mock_obj = MagicMock(id=2)
    with patch(
        "apps.front_office.services.complaint_service.Complaint.objects"
    ) as mock_mgr:
        mock_mgr.create.return_value = mock_obj
        result = complaint_service.create_complaint(
            {"name": "Bob", "date": datetime.date.today()}
        )
        assert result == mock_obj
        mock_mgr.create.assert_called_once()


def test_update_complaint_empty_name_raises(complaint_service):
    mock_obj = MagicMock(id=3)
    with patch(
        "apps.front_office.services.complaint_service.Complaint.objects"
    ) as mock_mgr:
        mock_mgr.filter.return_value.first.return_value = mock_obj
        with pytest.raises(FrontOfficeValidationError, match="Complainant name cannot be empty"):
            complaint_service.update_complaint(3, {"name": "   "})


# ── Dispatch / Receive ─────────────────────────────────────────────────────────

@pytest.fixture
def dispatch_service():
    return DispatchReceiveService()


def test_create_dispatch_requires_reference_no(dispatch_service):
    with pytest.raises(FrontOfficeValidationError, match="Reference number is required"):
        dispatch_service.create_dispatch({"to_title": "Principal", "type": "dispatch"})


def test_create_dispatch_requires_to_title(dispatch_service):
    with pytest.raises(FrontOfficeValidationError, match="To title is required"):
        dispatch_service.create_dispatch({"reference_no": "REF001", "type": "dispatch"})


def test_create_dispatch_invalid_type(dispatch_service):
    with pytest.raises(FrontOfficeValidationError, match="Type must be"):
        dispatch_service.create_dispatch(
            {"reference_no": "REF001", "to_title": "Principal", "type": "fax"}
        )


def test_get_dispatch_not_found(dispatch_service):
    with patch(
        "apps.front_office.services.dispatch_receive_service.DispatchReceive.objects"
    ) as mock_mgr:
        mock_mgr.filter.return_value.first.return_value = None
        with pytest.raises(FrontOfficeNotFoundError, match="Postal dispatch"):
            dispatch_service.get_dispatch(999)


def test_create_dispatch_success(dispatch_service):
    mock_obj = MagicMock(id=4)
    with patch(
        "apps.front_office.services.dispatch_receive_service.DispatchReceive.objects"
    ) as mock_mgr:
        mock_mgr.create.return_value = mock_obj
        result = dispatch_service.create_dispatch(
            {"reference_no": "REF001", "to_title": "Principal", "type": "dispatch"}
        )
        assert result == mock_obj
        mock_mgr.create.assert_called_once()
