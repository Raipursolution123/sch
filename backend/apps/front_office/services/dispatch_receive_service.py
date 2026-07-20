from typing import Any

from django.utils import timezone

from apps.front_office.domain.front_office_exceptions import (
    FrontOfficeNotFoundError,
    FrontOfficeValidationError,
)
from apps.front_office.models.dispatch_receive import DispatchReceive


class DispatchReceiveService:
    def list_dispatches(self):
        return DispatchReceive.objects.all().order_by("-id")

    def get_dispatch(self, dispatch_id: int) -> DispatchReceive:
        record = DispatchReceive.objects.filter(id=dispatch_id).first()
        if record is None:
            raise FrontOfficeNotFoundError("Postal dispatch/receive record not found.")
        return record

    def create_dispatch(self, payload: dict[str, Any]) -> DispatchReceive:
        reference_no = str(payload.get("reference_no", "")).strip()
        to_title = str(payload.get("to_title", "")).strip()
        type_ = str(payload.get("type", "")).strip()
        if not reference_no:
            raise FrontOfficeValidationError("Reference number is required.")
        if not to_title:
            raise FrontOfficeValidationError("To title is required.")
        if type_ not in ("dispatch", "receive"):
            raise FrontOfficeValidationError("Type must be 'dispatch' or 'receive'.")

        return DispatchReceive.objects.create(
            reference_no=reference_no,
            to_title=to_title,
            type=type_,
            address=str(payload.get("address", "")).strip(),
            note=str(payload.get("note", "")).strip(),
            from_title=str(payload.get("from_title", "")).strip(),
            date=payload.get("date"),
            image=str(payload.get("image", "")).strip() or None,
            created_at=timezone.now(),
        )

    def update_dispatch(self, dispatch_id: int, payload: dict[str, Any]) -> DispatchReceive:
        record = self.get_dispatch(dispatch_id)

        if "reference_no" in payload:
            reference_no = str(payload["reference_no"]).strip()
            if not reference_no:
                raise FrontOfficeValidationError("Reference number cannot be empty.")
            record.reference_no = reference_no
        if "to_title" in payload:
            record.to_title = str(payload["to_title"]).strip()
        if "type" in payload:
            type_ = str(payload["type"]).strip()
            if type_ not in ("dispatch", "receive"):
                raise FrontOfficeValidationError("Type must be 'dispatch' or 'receive'.")
            record.type = type_
        if "address" in payload:
            record.address = str(payload["address"]).strip()
        if "note" in payload:
            record.note = str(payload["note"]).strip()
        if "from_title" in payload:
            record.from_title = str(payload["from_title"]).strip()
        if "date" in payload:
            record.date = payload["date"]
        if "image" in payload:
            record.image = str(payload["image"]).strip() or None

        record.save()
        return record

    def delete_dispatch(self, dispatch_id: int) -> None:
        record = self.get_dispatch(dispatch_id)
        record.delete()
