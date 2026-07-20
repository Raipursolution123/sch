from typing import Any

from django.utils import timezone

from apps.front_office.domain.front_office_exceptions import (
    FrontOfficeNotFoundError,
    FrontOfficeValidationError,
)
from apps.front_office.models.visitors_book import VisitorsBook


class VisitorsBookService:
    def list_visitors(self):
        return VisitorsBook.objects.all().order_by("-id")

    def get_visitor(self, visitor_id: int) -> VisitorsBook:
        visitor = VisitorsBook.objects.filter(id=visitor_id).first()
        if visitor is None:
            raise FrontOfficeNotFoundError("Visitor record not found.")
        return visitor

    def create_visitor(self, payload: dict[str, Any]) -> VisitorsBook:
        name = str(payload.get("name", "")).strip()
        contact = str(payload.get("contact", "")).strip()
        purpose = str(payload.get("purpose", "")).strip()
        if not name:
            raise FrontOfficeValidationError("Visitor name is required.")
        if not contact:
            raise FrontOfficeValidationError("Contact is required.")
        if not purpose:
            raise FrontOfficeValidationError("Purpose is required.")

        return VisitorsBook.objects.create(
            name=name,
            contact=contact,
            purpose=purpose,
            staff_id=payload.get("staff_id"),
            student_session_id=payload.get("student_session_id"),
            source=str(payload.get("source", "")).strip() or None,
            email=str(payload.get("email", "")).strip() or None,
            id_proof=str(payload.get("id_proof", "")).strip(),
            no_of_people=int(payload.get("no_of_people", 1) or 1),
            date=payload.get("date") or timezone.now().date(),
            in_time=str(payload.get("in_time", "")).strip(),
            out_time=str(payload.get("out_time", "")).strip(),
            note=str(payload.get("note", "")).strip(),
            image=str(payload.get("image", "")).strip() or None,
            meeting_with=str(payload.get("meeting_with", "")).strip(),
            created_at=timezone.now(),
        )

    def update_visitor(self, visitor_id: int, payload: dict[str, Any]) -> VisitorsBook:
        visitor = self.get_visitor(visitor_id)

        if "name" in payload:
            name = str(payload["name"]).strip()
            if not name:
                raise FrontOfficeValidationError("Visitor name cannot be empty.")
            visitor.name = name
        if "contact" in payload:
            contact = str(payload["contact"]).strip()
            if not contact:
                raise FrontOfficeValidationError("Contact cannot be empty.")
            visitor.contact = contact
        if "purpose" in payload:
            visitor.purpose = str(payload["purpose"]).strip()
        if "staff_id" in payload:
            visitor.staff_id = payload["staff_id"]
        if "student_session_id" in payload:
            visitor.student_session_id = payload["student_session_id"]
        if "source" in payload:
            visitor.source = str(payload["source"]).strip() or None
        if "email" in payload:
            visitor.email = str(payload["email"]).strip() or None
        if "id_proof" in payload:
            visitor.id_proof = str(payload["id_proof"]).strip()
        if "no_of_people" in payload:
            visitor.no_of_people = int(payload["no_of_people"] or 1)
        if "date" in payload:
            visitor.date = payload["date"]
        if "in_time" in payload:
            visitor.in_time = str(payload["in_time"]).strip()
        if "out_time" in payload:
            visitor.out_time = str(payload["out_time"]).strip()
        if "note" in payload:
            visitor.note = str(payload["note"]).strip()
        if "image" in payload:
            visitor.image = str(payload["image"]).strip() or None
        if "meeting_with" in payload:
            visitor.meeting_with = str(payload["meeting_with"]).strip()

        visitor.save()
        return visitor

    def delete_visitor(self, visitor_id: int) -> None:
        visitor = self.get_visitor(visitor_id)
        visitor.delete()
