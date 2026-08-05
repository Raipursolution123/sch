import json
import logging
from typing import Any

from django.db import connection, transaction
from django.utils import timezone

from apps.students.domain.student_exceptions import (
    StudentNotFoundError,
    StudentValidationError,
)
from apps.students.domain.student_fee_exceptions import (
    StudentEnrollmentError,
    StudentFeeNotFoundError,
    StudentFeeValidationError,
)
from apps.fees.models.fee_receipt_no import FeeReceiptNo
from apps.students.models.student_fees_deposite import StudentFeesDeposite
from apps.students.models.student_fees_master import StudentFeesMaster
from apps.students.selectors import student_fee_selectors as fee_selectors
from apps.students.selectors import student_selectors as selectors

logger = logging.getLogger(__name__)


class StudentFeeService:
    def get_fee_summary(self, student_id: int) -> dict[str, Any]:
        student = selectors.get_student_by_id(student_id)
        if not student:
            raise StudentNotFoundError()

        active_session = selectors.get_active_session()
        if not active_session:
            raise StudentValidationError("No active academic session found.")

        student_session = fee_selectors.get_active_student_session(student_id)
        if not student_session or not student_session.class_id:
            raise StudentEnrollmentError(
                "Student is not enrolled in a class for the active session."
            )

        class_name, section_name = fee_selectors.resolve_class_section_names(
            student_session
        )
        assigned_lines = fee_selectors.fetch_assigned_fee_lines(student_session.id)
        payments = fee_selectors.fetch_deposite_payments(student_session.id)
        lines = fee_selectors.build_fee_lines(assigned_lines, payments)

        total_due = sum(line["amount"] for line in lines)
        total_paid = sum(line["amount_paid"] for line in lines)

        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT fd.amount
                FROM student_fees_discounts sfd
                JOIN fees_discounts fd ON sfd.fees_discount_id = fd.id
                WHERE sfd.student_session_id = %s
                  AND sfd.status = 'assigned'
                  AND sfd.is_active = 'yes'
                """,
                [student_session.id],
            )
            discounts = cursor.fetchall()
        total_discount = sum(float(row[0] or 0) for row in discounts)

        return {
            "student_id": student.id,
            "admission_no": student.admission_no or "",
            "full_name": selectors.format_student_name(
                student.firstname, student.middlename, student.lastname
            ),
            "session_name": active_session.session,
            "class_name": class_name,
            "section_name": section_name,
            "total_due": total_due,
            "total_paid": total_paid,
            "total_discount": total_discount,
            "total_balance": max(0, total_due - total_paid - total_discount),
            "lines": lines,
            "payments": [
                {
                    "id": payment["id"],
                    "receipt_no": payment.get("receipt_no"),
                    "date": payment["date"],
                    "amount": payment["amount"],
                    "payment_mode": payment["payment_mode"],
                    "description": payment.get("description") or None,
                    "feetype_name": payment.get("feetype_name"),
                    "feetype_id": payment.get("feetype_id"),
                    "collected_by": payment.get("collected_by"),
                }
                for payment in payments
            ],
        }

    @staticmethod
    def _allocate_receipt_no() -> int:
        """Allocate next school-wide fee receipt number from fee_receipt_no."""
        row = FeeReceiptNo.objects.select_for_update().order_by("id").first()
        if row is None:
            row = FeeReceiptNo.objects.create(payment=1)
            return 1
        next_no = int(row.payment or 0) + 1
        row.payment = next_no
        row.save(update_fields=["payment"])
        return next_no

    def record_payment(
        self,
        student_id: int,
        payload: dict[str, Any],
        *,
        collected_by: str,
    ) -> dict[str, Any]:
        amount = payload.get("amount")
        feetype_id = payload.get("feetype_id")
        payment_mode = payload.get("payment_mode", "Cash")
        description = payload.get("description", "")
        payment_date = payload.get("date") or timezone.now().date()

        if not amount or not feetype_id:
            raise StudentFeeValidationError("Amount and fee type are required.")

        student = selectors.get_student_by_id(student_id)
        if not student:
            raise StudentNotFoundError()

        active_session = selectors.get_active_session()
        if not active_session:
            raise StudentValidationError("No active academic session found.")

        student_session = fee_selectors.get_active_student_session(student_id)
        if not student_session:
            raise StudentEnrollmentError(
                "Student is not enrolled in a class for the active session."
            )

        resolved = fee_selectors.resolve_fee_master_for_payment(
            student_session.id,
            student_session.class_id,
            int(feetype_id),
            student_session.session_id,
        )
        if not resolved:
            raise StudentFeeValidationError(
                "Fee group configuration not found for this class and fee type."
            )

        payment_amount = float(amount)
        assigned_lines = fee_selectors.fetch_assigned_fee_lines(student_session.id)
        payments = fee_selectors.fetch_deposite_payments(student_session.id)
        fee_lines = fee_selectors.build_fee_lines(assigned_lines, payments)
        fee_line = next(
            (line for line in fee_lines if line["feetype_id"] == int(feetype_id)),
            None,
        )
        if not fee_line:
            raise StudentFeeValidationError(
                "Fee line not found for this student and fee type."
            )
        if payment_amount > fee_line["balance"]:
            raise StudentFeeValidationError(
                f"Payment amount cannot exceed outstanding balance of "
                f"{fee_line['balance']:.2f}."
            )

        fgft_id, fsg_id, sfm_id = resolved
        class_name, section_name = fee_selectors.resolve_class_section_names(
            student_session
        )
        with transaction.atomic():
            receipt_no = self._allocate_receipt_no()

            if sfm_id:
                sfm = StudentFeesMaster.objects.get(id=sfm_id)
            else:
                sfm, _created = StudentFeesMaster.objects.get_or_create(
                    student_session_id=student_session.id,
                    fee_session_group_id=fsg_id,
                    defaults={
                        "is_system": 0,
                        "amount": 0.0,
                        "is_active": "yes",
                        "created_at": timezone.now(),
                    },
                )

            sfd = StudentFeesDeposite.objects.filter(
                student_fees_master_id=sfm.id, fee_groups_feetype_id=fgft_id
            ).first()

            payment_date_str = selectors.safe_date_str(payment_date)
            new_payment = {
                "amount": float(amount),
                "amount_discount": 0.0,
                "amount_fine": 0.0,
                "date": payment_date_str,
                "description": description,
                "collected_by": collected_by,
                "payment_mode": str(payment_mode).lower(),
                "received_by": "1",
                "inv_no": receipt_no,
                "receipt_no": receipt_no,
            }

            if sfd:
                try:
                    detail_dict = (
                        json.loads(sfd.amount_detail) if sfd.amount_detail else {}
                    )
                except (json.JSONDecodeError, TypeError):
                    detail_dict = {}

                existing_keys = [int(k) for k in detail_dict if str(k).isdigit()]
                next_key = str(max(existing_keys) + 1) if existing_keys else "1"
                detail_dict[next_key] = new_payment
                sfd.amount_detail = json.dumps(detail_dict)
                sfd.save()
                deposit_id = sfd.id
                trans_id = next_key
            else:
                created = StudentFeesDeposite.objects.create(
                    student_fees_master_id=sfm.id,
                    fee_groups_feetype_id=fgft_id,
                    student_transport_fee_id=None,
                    amount_detail=json.dumps({"1": new_payment}),
                    file="",
                    is_active="yes",
                    created_at=timezone.now(),
                )
                deposit_id = created.id
                trans_id = "1"

        payment_id = f"dep-{deposit_id}-{trans_id}"
        logger.info(
            "Recorded fee payment student_id=%s feetype_id=%s amount=%s receipt_no=%s",
            student_id,
            feetype_id,
            amount,
            receipt_no,
        )
        return {
            "payment_id": payment_id,
            "receipt_no": receipt_no,
            "date": payment_date_str,
            "amount": float(amount),
            "payment_mode": str(payment_mode).lower(),
            "description": description or None,
            "feetype_id": int(feetype_id),
            "feetype_name": fee_line.get("feetype_name"),
            "student_id": student.id,
            "admission_no": student.admission_no or "",
            "full_name": selectors.format_student_name(
                student.firstname, student.middlename, student.lastname
            ),
            "class_name": class_name,
            "section_name": section_name,
            "collected_by": collected_by,
        }

    def delete_payment(self, payment_id: str) -> None:
        if not payment_id.startswith("dep-"):
            self._delete_legacy_payment(payment_id)
            return

        parts = payment_id.split("-")
        if len(parts) != 3:
            raise StudentFeeValidationError("Invalid payment id.")

        dep_id = int(parts[1])
        trans_id = parts[2]

        with transaction.atomic():
            sfd = StudentFeesDeposite.objects.filter(id=dep_id).first()
            if not sfd:
                raise StudentFeeNotFoundError("Payment record not found.")

            try:
                detail_dict = json.loads(sfd.amount_detail) if sfd.amount_detail else {}
            except (json.JSONDecodeError, TypeError):
                detail_dict = {}

            if trans_id not in detail_dict:
                raise StudentFeeNotFoundError("Payment record not found.")

            del detail_dict[trans_id]
            if detail_dict:
                sfd.amount_detail = json.dumps(detail_dict)
                sfd.save()
            else:
                sfd.delete()

    def revert_fee(self, student_id: int, feetype_id: int) -> None:
        student = selectors.get_student_by_id(student_id)
        if not student:
            raise StudentNotFoundError()

        active_session = selectors.get_active_session()
        if not active_session:
            raise StudentValidationError("No active academic session found.")

        student_session = fee_selectors.get_active_student_session(student_id)
        if not student_session:
            raise StudentEnrollmentError(
                "Student is not enrolled in a class for the active session."
            )

        with transaction.atomic():
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    DELETE FROM student_fees_deposite
                    WHERE student_fees_master_id IN (
                        SELECT id FROM student_fees_master
                        WHERE student_session_id = %s
                    ) AND fee_groups_feetype_id IN (
                        SELECT id FROM fee_groups_feetype
                        WHERE feetype_id = %s
                    )
                    """,
                    [student_session.id, feetype_id],
                )

        logger.info(
            "Reverted fee payments student_id=%s feetype_id=%s", student_id, feetype_id
        )

    def _delete_legacy_payment(self, payment_id: str) -> None:
        try:
            with connection.cursor() as cursor:
                cursor.execute("DELETE FROM student_fees WHERE id = %s", [payment_id])
        except Exception as exc:
            logger.error("Error deleting legacy payment %s: %s", payment_id, exc)
            raise StudentFeeValidationError(f"Failed to delete payment: {exc}") from exc
