from typing import Any

from django.utils import timezone

from apps.front_office.domain.front_office_exceptions import (
    FrontOfficeNotFoundError,
    FrontOfficeValidationError,
)
from apps.front_office.models.complaint_type import ComplaintType


class ComplaintTypeService:
    def list_complaint_types(self):
        return ComplaintType.objects.all().order_by("-id")

    def get_complaint_type(self, pk: int) -> ComplaintType:
        item = ComplaintType.objects.filter(id=pk).first()
        if item is None:
            raise FrontOfficeNotFoundError("Complaint type not found.")
        return item

    def create_complaint_type(self, data: dict[str, Any]) -> ComplaintType:
        complaint_type = str(data.get("complaint_type", "")).strip()
        if not complaint_type:
            raise FrontOfficeValidationError("Complaint type is required.")

        return ComplaintType.objects.create(
            complaint_type=complaint_type,
            description=str(data.get("description", "")).strip(),
            created_at=timezone.now(),
        )

    def update_complaint_type(self, pk: int, data: dict[str, Any]) -> ComplaintType:
        item = self.get_complaint_type(pk)
        if "complaint_type" in data:
            val = str(data["complaint_type"]).strip()
            if not val:
                raise FrontOfficeValidationError("Complaint type cannot be empty.")
            item.complaint_type = val
        if "description" in data:
            item.description = str(data["description"]).strip()

        item.save()
        return item

    def delete_complaint_type(self, pk: int) -> None:
        item = self.get_complaint_type(pk)
        item.delete()
