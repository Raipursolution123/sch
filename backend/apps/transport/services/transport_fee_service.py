from typing import Any
from django.utils import timezone

from apps.transport.models.transport_feemaster import TransportFeemaster
from apps.transport.domain.transport_exceptions import (
    TransportNotFoundError,
    TransportValidationError,
)


class TransportFeeService:
    def list_fees(self, session_id: int = None):
        qs = TransportFeemaster.objects.all()
        if session_id is not None:
            qs = qs.filter(session_id=session_id)
        return qs.order_by("-id")

    def get_fee(self, fee_id: int) -> TransportFeemaster:
        fee = TransportFeemaster.objects.filter(id=fee_id).first()
        if fee is None:
            raise TransportNotFoundError("Transport fee master record not found.")
        return fee

    def create_fee(self, payload: dict[str, Any]) -> TransportFeemaster:
        session_id = payload.get("session_id")
        if not session_id:
            raise TransportValidationError("Session ID is required.")

        fee = TransportFeemaster.objects.create(
            session_id=session_id,
            month=payload.get("month"),
            due_date=payload.get("due_date"),
            fine_amount=payload.get("fine_amount", 0.00),
            fine_type=payload.get("fine_type"),
            fine_percentage=payload.get("fine_percentage", 0.00),
            created_at=timezone.now(),
        )
        return fee

    def update_fee(self, fee_id: int, payload: dict[str, Any]) -> TransportFeemaster:
        fee = self.get_fee(fee_id)

        if "session_id" in payload:
            fee.session_id = payload["session_id"]
        if "month" in payload:
            fee.month = payload["month"]
        if "due_date" in payload:
            fee.due_date = payload["due_date"]
        if "fine_amount" in payload:
            fee.fine_amount = payload["fine_amount"]
        if "fine_type" in payload:
            fee.fine_type = payload["fine_type"]
        if "fine_percentage" in payload:
            fee.fine_percentage = payload["fine_percentage"]

        fee.save()
        return fee

    def delete_fee(self, fee_id: int) -> None:
        fee = self.get_fee(fee_id)
        fee.delete()
