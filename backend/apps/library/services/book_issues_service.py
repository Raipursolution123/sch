from __future__ import annotations

from datetime import date
from typing import Any

from django.db import transaction
from django.utils import timezone

from apps.library.domain.library_exceptions import (
    LibraryConflictError,
    LibraryNotFoundError,
    LibraryValidationError,
)
from apps.library.models.book_issues import BookIssues
from apps.library.models.books import Books
from apps.library.models.libarary_members import LibararyMembers
from apps.library.services.books_service import BooksService


class BookIssuesService:
    def list_issues(
        self,
        *,
        status: str | None = None,
        query: str | None = None,
    ) -> list[dict[str, Any]]:
        if status and status not in {"open", "returned", "all", None, ""}:
            raise LibraryValidationError("status must be open, returned, or all.")

        qs = BookIssues.objects.all().order_by("-id")
        if status == "open":
            qs = qs.filter(is_returned=0)
        elif status == "returned":
            qs = qs.exclude(is_returned=0)

        issues = list(qs)
        book_ids = {i.book_id for i in issues if i.book_id}
        member_ids = {i.member_id for i in issues if i.member_id}
        books = {
            b.id: b for b in Books.objects.filter(id__in=book_ids)
        } if book_ids else {}
        members = {
            m.id: m for m in LibararyMembers.objects.filter(id__in=member_ids)
        } if member_ids else {}

        term = (query or "").strip().lower()
        rows: list[dict[str, Any]] = []
        for issue in issues:
            book = books.get(issue.book_id)
            member = members.get(issue.member_id) if issue.member_id else None
            row = self._serialize_issue(issue, book=book, member=member)
            if term:
                hay = " ".join(
                    [
                        row.get("book_title") or "",
                        row.get("book_no") or "",
                        row.get("library_card_no") or "",
                        str(row.get("member_id") or ""),
                    ]
                ).lower()
                if term not in hay:
                    continue
            rows.append(row)
        return rows

    def get_issue(self, issue_id: int) -> BookIssues:
        issue = BookIssues.objects.filter(id=issue_id).first()
        if issue is None:
            raise LibraryNotFoundError("Book issue not found.")
        return issue

    def get_issue_detail(self, issue_id: int) -> dict[str, Any]:
        issue = self.get_issue(issue_id)
        book = Books.objects.filter(id=issue.book_id).first()
        member = (
            LibararyMembers.objects.filter(id=issue.member_id).first()
            if issue.member_id
            else None
        )
        return self._serialize_issue(issue, book=book, member=member)

    def issue_book(self, payload: dict[str, Any]) -> dict[str, Any]:
        book_id = payload.get("book_id")
        member_id = payload.get("member_id")
        if not book_id:
            raise LibraryValidationError("book_id is required.")
        if not member_id:
            raise LibraryValidationError("member_id is required.")

        book = BooksService().get_book(int(book_id))
        member = LibararyMembers.objects.filter(id=int(member_id)).first()
        if member is None:
            raise LibraryNotFoundError("Library member not found.")

        issue_date = payload.get("issue_date") or timezone.now().date()
        due_date = payload.get("duereturn_date")
        if due_date and issue_date and due_date < issue_date:
            raise LibraryValidationError("Due date cannot be before issue date.")

        qty = int(book.qty or 1)
        open_count = BookIssues.objects.filter(
            book_id=book.id, is_returned=0
        ).count()
        if open_count >= qty:
            raise LibraryConflictError("No copies available to issue.")

        with transaction.atomic():
            issue = BookIssues.objects.create(
                book_id=book.id,
                member_id=member.id,
                issue_date=issue_date,
                duereturn_date=due_date,
                return_date=None,
                is_returned=0,
                is_active="yes",
                created_at=timezone.now(),
            )
            remaining = qty - (open_count + 1)
            book.available = "yes" if remaining > 0 else "no"
            book.updated_at = timezone.now().date()
            book.save(update_fields=["available", "updated_at"])

        return self._serialize_issue(issue, book=book, member=member)

    def return_book(
        self,
        issue_id: int,
        *,
        return_date: date | None = None,
    ) -> dict[str, Any]:
        issue = self.get_issue(issue_id)
        if int(issue.is_returned or 0) != 0:
            raise LibraryConflictError("Book is already returned.")

        effective_return = return_date or timezone.now().date()
        book = BooksService().get_book(issue.book_id)
        member = (
            LibararyMembers.objects.filter(id=issue.member_id).first()
            if issue.member_id
            else None
        )

        with transaction.atomic():
            issue.is_returned = 1
            issue.return_date = effective_return
            issue.save(update_fields=["is_returned", "return_date"])

            qty = int(book.qty or 1)
            open_count = BookIssues.objects.filter(
                book_id=book.id, is_returned=0
            ).count()
            book.available = "yes" if open_count < qty else "no"
            book.updated_at = timezone.now().date()
            book.save(update_fields=["available", "updated_at"])

        return self._serialize_issue(issue, book=book, member=member)

    @staticmethod
    def _serialize_issue(
        issue: BookIssues,
        *,
        book: Books | None,
        member: LibararyMembers | None,
    ) -> dict[str, Any]:
        return {
            "id": issue.id,
            "book_id": issue.book_id,
            "member_id": issue.member_id,
            "issue_date": issue.issue_date,
            "duereturn_date": issue.duereturn_date,
            "return_date": issue.return_date,
            "is_returned": int(issue.is_returned or 0),
            "is_active": issue.is_active,
            "created_at": issue.created_at,
            "book_title": book.book_title if book else None,
            "book_no": book.book_no if book else None,
            "library_card_no": member.library_card_no if member else None,
            "member_type": member.member_type if member else None,
            "member_ref_id": member.member_id if member else None,
        }
