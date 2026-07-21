from __future__ import annotations

from typing import Any

from django.db.models import Q
from django.utils import timezone

from apps.library.domain.library_exceptions import (
    LibraryNotFoundError,
    LibraryValidationError,
)
from apps.library.models.books import Books


class BooksService:
    def list_books(self, *, query: str | None = None):
        qs = Books.objects.all().order_by("book_title", "id")
        term = (query or "").strip()
        if term:
            qs = qs.filter(
                Q(book_title__icontains=term)
                | Q(book_no__icontains=term)
                | Q(isbn_no__icontains=term)
                | Q(author__icontains=term)
                | Q(category__icontains=term)
            )
        return qs

    def get_book(self, book_id: int) -> Books:
        book = Books.objects.filter(id=book_id).first()
        if book is None:
            raise LibraryNotFoundError("Book not found.")
        return book

    def create_book(self, payload: dict[str, Any]) -> Books:
        title = str(payload.get("book_title", "")).strip()
        book_no = str(payload.get("book_no", "")).strip()
        isbn_no = str(payload.get("isbn_no", "")).strip()
        rack_no = str(payload.get("rack_no", "")).strip()
        if not title:
            raise LibraryValidationError("Book title is required.")
        if not book_no:
            raise LibraryValidationError("Book number is required.")
        if not isbn_no:
            raise LibraryValidationError("ISBN is required.")
        if not rack_no:
            raise LibraryValidationError("Rack number is required.")

        qty = payload.get("qty")
        qty_val = int(qty) if qty is not None else 1
        if qty_val < 1:
            raise LibraryValidationError("Quantity must be at least 1.")

        return Books.objects.create(
            book_title=title,
            book_no=book_no,
            isbn_no=isbn_no,
            rack_no=rack_no,
            subject=str(payload.get("subject", "")).strip() or None,
            claases=str(payload.get("claases", "")).strip() or None,
            category=str(payload.get("category", "")).strip() or None,
            publish=str(payload.get("publish", "")).strip() or None,
            author=str(payload.get("author", "")).strip() or None,
            qty=qty_val,
            perunitcost=payload.get("perunitcost"),
            postdate=payload.get("postdate") or timezone.now().date(),
            description=str(payload.get("description", "")).strip() or None,
            available=str(payload.get("available") or "yes").strip() or "yes",
            is_active=str(payload.get("is_active") or "yes").strip() or "yes",
            created_at=timezone.now(),
            updated_at=timezone.now().date(),
        )

    def update_book(self, book_id: int, payload: dict[str, Any]) -> Books:
        book = self.get_book(book_id)

        if "book_title" in payload:
            title = str(payload["book_title"]).strip()
            if not title:
                raise LibraryValidationError("Book title cannot be empty.")
            book.book_title = title
        if "book_no" in payload:
            book_no = str(payload["book_no"]).strip()
            if not book_no:
                raise LibraryValidationError("Book number cannot be empty.")
            book.book_no = book_no
        if "isbn_no" in payload:
            isbn_no = str(payload["isbn_no"]).strip()
            if not isbn_no:
                raise LibraryValidationError("ISBN cannot be empty.")
            book.isbn_no = isbn_no
        if "rack_no" in payload:
            rack_no = str(payload["rack_no"]).strip()
            if not rack_no:
                raise LibraryValidationError("Rack number cannot be empty.")
            book.rack_no = rack_no
        if "subject" in payload:
            book.subject = str(payload["subject"]).strip() or None
        if "claases" in payload:
            book.claases = str(payload["claases"]).strip() or None
        if "category" in payload:
            book.category = str(payload["category"]).strip() or None
        if "publish" in payload:
            book.publish = str(payload["publish"]).strip() or None
        if "author" in payload:
            book.author = str(payload["author"]).strip() or None
        if "qty" in payload:
            qty_val = int(payload["qty"] or 0)
            if qty_val < 1:
                raise LibraryValidationError("Quantity must be at least 1.")
            book.qty = qty_val
        if "perunitcost" in payload:
            book.perunitcost = payload["perunitcost"]
        if "postdate" in payload:
            book.postdate = payload["postdate"]
        if "description" in payload:
            book.description = str(payload["description"]).strip() or None
        if "available" in payload:
            book.available = str(payload["available"]).strip() or "yes"
        if "is_active" in payload:
            book.is_active = str(payload["is_active"]).strip() or "yes"

        book.updated_at = timezone.now().date()
        book.save()
        return book

    def delete_book(self, book_id: int) -> None:
        book = self.get_book(book_id)
        book.delete()
