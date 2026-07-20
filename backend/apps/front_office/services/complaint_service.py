from typing import Any

from django.utils import timezone

from apps.front_office.domain.front_office_exceptions import (
    FrontOfficeNotFoundError,
    FrontOfficeValidationError,
)
from apps.front_office.models.complaint import Complaint


class ComplaintService:
    def list_complaints(self):
        return Complaint.objects.all().order_by("-id")

    def get_complaint(self, complaint_id: int) -> Complaint:
        complaint = Complaint.objects.filter(id=complaint_id).first()
        if complaint is None:
            raise FrontOfficeNotFoundError("Complaint not found.")
        return complaint

    def create_complaint(self, payload: dict[str, Any]) -> Complaint:
        name = str(payload.get("name", "")).strip()
        if not name:
            raise FrontOfficeValidationError("Complainant name is required.")
        date = payload.get("date") or timezone.now().date()

        return Complaint.objects.create(
            name=name,
            complaint_type=str(payload.get("complaint_type", "")).strip(),
            source=str(payload.get("source", "")).strip(),
            contact=str(payload.get("contact", "")).strip(),
            email=str(payload.get("email", "")).strip(),
            date=date,
            description=str(payload.get("description", "")).strip(),
            action_taken=str(payload.get("action_taken", "")).strip(),
            assigned=str(payload.get("assigned", "")).strip(),
            note=str(payload.get("note", "")).strip(),
            image=str(payload.get("image", "")).strip() or None,
        )

    def update_complaint(self, complaint_id: int, payload: dict[str, Any]) -> Complaint:
        complaint = self.get_complaint(complaint_id)

        if "name" in payload:
            name = str(payload["name"]).strip()
            if not name:
                raise FrontOfficeValidationError("Complainant name cannot be empty.")
            complaint.name = name
        if "complaint_type" in payload:
            complaint.complaint_type = str(payload["complaint_type"]).strip()
        if "source" in payload:
            complaint.source = str(payload["source"]).strip()
        if "contact" in payload:
            complaint.contact = str(payload["contact"]).strip()
        if "email" in payload:
            complaint.email = str(payload["email"]).strip()
        if "date" in payload:
            complaint.date = payload["date"]
        if "description" in payload:
            complaint.description = str(payload["description"]).strip()
        if "action_taken" in payload:
            complaint.action_taken = str(payload["action_taken"]).strip()
        if "assigned" in payload:
            complaint.assigned = str(payload["assigned"]).strip()
        if "note" in payload:
            complaint.note = str(payload["note"]).strip()
        if "image" in payload:
            complaint.image = str(payload["image"]).strip() or None

        complaint.save()
        return complaint

    def delete_complaint(self, complaint_id: int) -> None:
        complaint = self.get_complaint(complaint_id)
        complaint.delete()
