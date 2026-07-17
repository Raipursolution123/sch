from typing import Any

from django.utils import timezone

from apps.front_office.domain.front_office_exceptions import (
    FrontOfficeNotFoundError,
    FrontOfficeValidationError,
)
from apps.front_office.models.enquiry import Enquiry


class EnquiryService:
    def list_enquiries(self):
        return Enquiry.objects.all().order_by("-id")

    def get_enquiry(self, enquiry_id: int) -> Enquiry:
        enquiry = Enquiry.objects.filter(id=enquiry_id).first()
        if enquiry is None:
            raise FrontOfficeNotFoundError("Enquiry not found.")
        return enquiry

    def create_enquiry(self, payload: dict[str, Any], *, created_by: int) -> Enquiry:
        name = str(payload.get("name", "")).strip()
        contact = str(payload.get("contact", "")).strip()
        if not name:
            raise FrontOfficeValidationError("Name is required.")
        if not contact:
            raise FrontOfficeValidationError("Contact is required.")

        return Enquiry.objects.create(
            name=name,
            contact=contact,
            address=str(payload.get("address", "")).strip(),
            reference=str(payload.get("reference", "")).strip(),
            date=payload.get("date") or timezone.now().date(),
            description=str(payload.get("description", "")).strip(),
            follow_up_date=payload.get("follow_up_date") or timezone.now().date(),
            note=str(payload.get("note", "")).strip(),
            source=str(payload.get("source", "")).strip(),
            email=str(payload.get("email", "")).strip() or None,
            assigned=payload.get("assigned"),
            class_id=payload.get("class_id"),
            no_of_child=str(payload.get("no_of_child", "")).strip() or None,
            status=str(payload.get("status", "active")).strip(),
            created_by=created_by,
            created_at=timezone.now(),
            referral_staff=str(payload.get("referral_staff", "")).strip() or None,
            is_converted_to_admission=int(
                payload.get("is_converted_to_admission", 0) or 0
            ),
        )

    def update_enquiry(self, enquiry_id: int, payload: dict[str, Any]) -> Enquiry:
        enquiry = self.get_enquiry(enquiry_id)

        if "name" in payload:
            name = str(payload.get("name", "")).strip()
            if not name:
                raise FrontOfficeValidationError("Name is required.")
            enquiry.name = name
        if "contact" in payload:
            contact = str(payload.get("contact", "")).strip()
            if not contact:
                raise FrontOfficeValidationError("Contact is required.")
            enquiry.contact = contact
        if "address" in payload:
            enquiry.address = str(payload.get("address", "")).strip()
        if "reference" in payload:
            enquiry.reference = str(payload.get("reference", "")).strip()
        if "date" in payload:
            enquiry.date = payload["date"]
        if "description" in payload:
            enquiry.description = str(payload.get("description", "")).strip()
        if "follow_up_date" in payload:
            enquiry.follow_up_date = payload["follow_up_date"]
        if "note" in payload:
            enquiry.note = str(payload.get("note", "")).strip()
        if "source" in payload:
            enquiry.source = str(payload.get("source", "")).strip()
        if "email" in payload:
            enquiry.email = str(payload.get("email", "")).strip() or None
        if "assigned" in payload:
            enquiry.assigned = payload.get("assigned")
        if "class_id" in payload:
            enquiry.class_id = payload.get("class_id")
        if "no_of_child" in payload:
            enquiry.no_of_child = str(payload.get("no_of_child", "")).strip() or None
        if "status" in payload:
            enquiry.status = str(payload.get("status", "")).strip()
        if "referral_staff" in payload:
            enquiry.referral_staff = (
                str(payload.get("referral_staff", "")).strip() or None
            )
        if "is_converted_to_admission" in payload:
            enquiry.is_converted_to_admission = int(
                payload.get("is_converted_to_admission", 0) or 0
            )

        enquiry.save()
        return enquiry

    def delete_enquiry(self, enquiry_id: int) -> None:
        enquiry = self.get_enquiry(enquiry_id)
        enquiry.delete()
