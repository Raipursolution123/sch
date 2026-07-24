"""Offline bank payment review (list / approve / reject)."""

from __future__ import annotations

import json
import logging
from datetime import date
from typing import Any

from django.db import transaction
from django.utils import timezone

from apps.fees.domain.fee_exceptions import (
    FeeConflictError,
    FeeNotFoundError,
    FeeValidationError,
)
from apps.fees.models.offline_fees_payments import OfflineFeesPayments
from apps.fees.selectors import offline_bank_payment_selectors as selectors
from apps.students.models.student_fees_deposite import StudentFeesDeposite
from apps.students.selectors.student_selectors import safe_date_str

logger = logging.getLogger(__name__)

STATUS_PENDING = "0"
STATUS_APPROVED = "1"
STATUS_REJECTED = "2"


class OfflineBankPaymentService:
    def list_payments(
        self,
        *,
        status: str | None = None,
        from_date: date | None = None,
        to_date: date | None = None,
        query: str | None = None,
    ) -> list[dict[str, Any]]:
        if status and status not in {"pending", "approved", "rejected", "all"}:
            raise FeeValidationError(
                "status must be pending, approved, rejected, or all."
            )
        if from_date and to_date and from_date > to_date:
            raise FeeValidationError("from_date cannot be after to_date.")
        effective_status = None if status in (None, "", "all") else status
        return selectors.list_offline_payments(
            status=effective_status,
            from_date=from_date,
            to_date=to_date,
            query=query,
        )

    def get_payment(self, payment_id: int) -> OfflineFeesPayments:
        payment = OfflineFeesPayments.objects.filter(pk=payment_id).first()
        if payment is None:
            raise FeeNotFoundError("Offline bank payment not found.")
        return payment

    def get_payment_detail(self, payment_id: int) -> dict[str, Any]:
        row = selectors.get_offline_payment(payment_id)
        if row is None:
            raise FeeNotFoundError("Offline bank payment not found.")
        return row

    def approve(
        self,
        payment_id: int,
        *,
        approved_by: int | None,
        reply: str = "",
    ) -> dict[str, Any]:
        payment = self.get_payment(payment_id)
        current = str(payment.is_active or STATUS_PENDING).strip() or STATUS_PENDING
        if current == STATUS_APPROVED:
            raise FeeConflictError("Payment is already approved.")
        if current == STATUS_REJECTED:
            raise FeeConflictError("Rejected payments cannot be approved.")

        with transaction.atomic():
            self._post_fee_deposit(payment, approved_by=approved_by)
            payment.is_active = STATUS_APPROVED
            payment.approve_date = timezone.now()
            payment.approved_by = approved_by
            if reply.strip():
                payment.reply = reply.strip()
            payment.save(
                update_fields=["is_active", "approve_date", "approved_by", "reply"]
            )

        logger.info(
            "Approved offline bank payment id=%s by staff_id=%s",
            payment_id,
            approved_by,
        )
        return self.get_payment_detail(payment_id)

    def reject(
        self,
        payment_id: int,
        *,
        approved_by: int | None,
        reply: str = "",
    ) -> dict[str, Any]:
        payment = self.get_payment(payment_id)
        current = str(payment.is_active or STATUS_PENDING).strip() or STATUS_PENDING
        if current == STATUS_APPROVED:
            raise FeeConflictError("Approved payments cannot be rejected.")
        if current == STATUS_REJECTED:
            raise FeeConflictError("Payment is already rejected.")

        with transaction.atomic():
            payment.is_active = STATUS_REJECTED
            payment.approve_date = timezone.now()
            payment.approved_by = approved_by
            payment.reply = reply.strip() or "Rejected"
            payment.save(
                update_fields=["is_active", "approve_date", "approved_by", "reply"]
            )

        logger.info(
            "Rejected offline bank payment id=%s by staff_id=%s",
            payment_id,
            approved_by,
        )
        return self.get_payment_detail(payment_id)

    def _post_fee_deposit(
        self, payment: OfflineFeesPayments, *, approved_by: int | None
    ) -> None:
        sfm_id = payment.student_fees_master_id
        fgft_id = payment.fee_groups_feetype_id
        amount = float(payment.amount or 0)
        if not sfm_id or not fgft_id or amount <= 0:
            logger.warning(
                "Skipping deposit post for offline payment id=%s "
                "(missing master/feetype or amount).",
                payment.id,
            )
            return

        payment_date = payment.payment_date or timezone.now().date()
        description = (
            f"Offline bank payment"
            f"{f' ref {payment.reference}' if payment.reference else ''}"
            f"{f' from {payment.bank_from}' if payment.bank_from else ''}"
        ).strip()

        new_payment = {
            "amount": amount,
            "amount_discount": 0.0,
            "amount_fine": 0.0,
            "date": safe_date_str(payment_date),
            "description": description,
            "collected_by": str(approved_by or ""),
            "payment_mode": "bank transfer",
            "received_by": "1",
            "offline_payment_id": payment.id,
        }

        sfd = StudentFeesDeposite.objects.filter(
            student_fees_master_id=sfm_id,
            fee_groups_feetype_id=fgft_id,
        ).first()

        if sfd:
            try:
                detail_dict = json.loads(sfd.amount_detail) if sfd.amount_detail else {}
            except (json.JSONDecodeError, TypeError):
                detail_dict = {}

            # Idempotent: skip if this offline payment was already posted.
            for entry in detail_dict.values():
                if (
                    isinstance(entry, dict)
                    and entry.get("offline_payment_id") == payment.id
                ):
                    return

            existing_keys = [int(k) for k in detail_dict if str(k).isdigit()]
            next_key = str(max(existing_keys) + 1) if existing_keys else "1"
            new_payment["inv_no"] = int(next_key)
            detail_dict[next_key] = new_payment
            sfd.amount_detail = json.dumps(detail_dict)
            sfd.is_active = "yes"
            sfd.save(update_fields=["amount_detail", "is_active"])
            return

        new_payment["inv_no"] = 1
        StudentFeesDeposite.objects.create(
            student_fees_master_id=sfm_id,
            fee_groups_feetype_id=fgft_id,
            student_transport_fee_id=payment.student_transport_fee_id,
            amount_detail=json.dumps({"1": new_payment}),
            file=payment.attachment or "",
            is_active="yes",
            created_at=timezone.now(),
        )
