from datetime import date
from unittest.mock import MagicMock, patch

import pytest

from apps.library.domain.library_exceptions import (
    LibraryConflictError,
    LibraryValidationError,
)
from apps.library.services.book_issues_service import BookIssuesService
from apps.library.services.books_service import BooksService
from apps.library.services.library_members_service import LibraryMembersService


@pytest.fixture
def books_service():
    return BooksService()


@pytest.fixture
def issues_service():
    return BookIssuesService()


@pytest.fixture
def members_service():
    return LibraryMembersService()


def test_create_book_requires_title(books_service):
    with pytest.raises(LibraryValidationError, match="Book title"):
        books_service.create_book(
            {
                "book_title": "  ",
                "book_no": "B1",
                "isbn_no": "123",
                "rack_no": "R1",
            }
        )


def test_create_member_rejects_bad_type(members_service):
    with pytest.raises(LibraryValidationError, match="member_type"):
        members_service.create_member(
            {"member_type": "parent", "member_id": 1}
        )


def test_list_issues_rejects_bad_status(issues_service):
    with pytest.raises(LibraryValidationError, match="status must be"):
        issues_service.list_issues(status="nope")


def test_issue_book_rejects_unavailable(issues_service):
    book = MagicMock(id=1, qty=1)
    member = MagicMock(id=9, library_card_no="C1", member_type="student", member_id=3)

    with patch(
        "apps.library.services.book_issues_service.BooksService.get_book",
        return_value=book,
    ), patch(
        "apps.library.services.book_issues_service.LibararyMembers.objects.filter"
    ) as member_filter, patch(
        "apps.library.services.book_issues_service.BookIssues.objects.filter"
    ) as issue_filter:
        member_filter.return_value.first.return_value = member
        issue_filter.return_value.count.return_value = 1
        with pytest.raises(LibraryConflictError, match="No copies available"):
            issues_service.issue_book({"book_id": 1, "member_id": 9})


def test_return_rejects_already_returned(issues_service):
    issue = MagicMock(is_returned=1)
    with patch.object(issues_service, "get_issue", return_value=issue):
        with pytest.raises(LibraryConflictError, match="already returned"):
            issues_service.return_book(1, return_date=date(2026, 7, 21))
