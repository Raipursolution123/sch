from decimal import Decimal, InvalidOperation
from typing import Any

from apps.academics.models import Sessions
from apps.fees.domain.fee_exceptions import (
    FeeConflictError,
    FeeNotFoundError,
    FeeValidationError,
)
from apps.fees.models.fees_discounts import FeesDiscounts
from apps.fees.selectors import fee_selectors as selectors
from apps.students.models.student_fees_discounts import StudentFeesDiscounts

PERCENTAGE_TYPE = "percentage"
FIXED_TYPE = "fixed"
ALLOWED_TYPES = {PERCENTAGE_TYPE, FIXED_TYPE, "amount"}


class FeeDiscountService:
    def list_discounts(self):
        return FeesDiscounts.objects.all().order_by("name")

    def get_discount(self, discount_id: int) -> dict[str, Any]:
        discount = FeesDiscounts.objects.filter(id=discount_id).first()
        if discount is None:
            raise FeeNotFoundError("Fee discount not found.")
        return self._to_dict(discount)

    def create_discount(self, payload: dict[str, Any]) -> dict[str, Any]:
        cleaned = self._validate_payload(payload)
        if FeesDiscounts.objects.filter(code__iexact=cleaned["code"]).exists():
            raise FeeConflictError("A fee discount with this code already exists.")

        discount = FeesDiscounts.objects.create(
            session_id=cleaned["session_id"],
            name=cleaned["name"],
            code=cleaned["code"],
            type=cleaned["type"],
            percentage=cleaned.get("percentage"),
            amount=cleaned.get("amount"),
            description=cleaned.get("description"),
            is_active=cleaned.get("is_active", "no"),
            created_at=selectors.now_datetime(),
        )
        return self._to_dict(discount)

    def update_discount(
        self, discount_id: int, payload: dict[str, Any]
    ) -> dict[str, Any]:
        discount = FeesDiscounts.objects.filter(id=discount_id).first()
        if discount is None:
            raise FeeNotFoundError("Fee discount not found.")

        current = {
            "session_id": discount.session_id,
            "name": discount.name,
            "code": discount.code,
            "type": discount.type,
            "percentage": discount.percentage,
            "amount": discount.amount,
            "description": discount.description,
            "is_active": discount.is_active,
        }
        merged = {**current, **payload}
        cleaned = self._validate_payload(merged)

        if (
            FeesDiscounts.objects.exclude(id=discount_id)
            .filter(code__iexact=cleaned["code"])
            .exists()
        ):
            raise FeeConflictError("A fee discount with this code already exists.")

        discount.session_id = cleaned["session_id"]
        discount.name = cleaned["name"]
        discount.code = cleaned["code"]
        discount.type = cleaned["type"]
        discount.percentage = cleaned.get("percentage")
        discount.amount = cleaned.get("amount")
        discount.description = cleaned.get("description")
        discount.is_active = cleaned.get("is_active", discount.is_active)
        discount.save()
        return self._to_dict(discount)

    def delete_discount(self, discount_id: int) -> None:
        discount = FeesDiscounts.objects.filter(id=discount_id).first()
        if discount is None:
            raise FeeNotFoundError("Fee discount not found.")
        if discount.is_active == "yes":
            raise FeeValidationError("Deactivate the fee discount before deleting.")
        if StudentFeesDiscounts.objects.filter(
            fees_discount_id=discount_id, is_active="yes"
        ).exists():
            raise FeeValidationError(
                "Cannot delete a discount that is assigned to students."
            )
        discount.delete()

    def enrich_list(self, rows) -> list[dict[str, Any]]:
        session_ids = {row.session_id for row in rows if row.session_id}
        session_map = {
            session.id: session.session
            for session in Sessions.objects.filter(id__in=session_ids)
        }
        return [
            selectors.fee_discount_to_dict(
                row, session_map.get(row.session_id) if row.session_id else None
            )
            for row in rows
        ]

    def _to_dict(self, discount: FeesDiscounts) -> dict[str, Any]:
        session_name = None
        if discount.session_id:
            session = Sessions.objects.filter(id=discount.session_id).first()
            session_name = session.session if session else None
        return selectors.fee_discount_to_dict(discount, session_name)

    def _validate_payload(self, payload: dict[str, Any]) -> dict[str, Any]:
        name = str(payload.get("name") or "").strip()
        code = str(payload.get("code") or "").strip().upper()
        discount_type = str(payload.get("type") or "").strip().lower()
        session_id = payload.get("session_id")

        if not name:
            raise FeeValidationError("Discount name is required.")
        if not code:
            raise FeeValidationError("Discount code is required.")
        if not session_id:
            raise FeeValidationError("Session is required.")
        try:
            session_id = int(session_id)
        except (TypeError, ValueError) as exc:
            raise FeeValidationError("Session is required.") from exc
        if not Sessions.objects.filter(id=session_id).exists():
            raise FeeValidationError("Selected session was not found.")

        if discount_type not in ALLOWED_TYPES:
            raise FeeValidationError("Discount type must be 'percentage' or 'fixed'.")
        if discount_type == "amount":
            discount_type = FIXED_TYPE

        cleaned: dict[str, Any] = {
            "name": name,
            "code": code,
            "type": discount_type,
            "session_id": session_id,
            "description": (
                str(payload.get("description")).strip()
                if payload.get("description")
                else None
            ),
            "is_active": payload.get("is_active", "no"),
            "percentage": None,
            "amount": None,
        }

        if discount_type == PERCENTAGE_TYPE:
            percentage = payload.get("percentage")
            if percentage in (None, ""):
                raise FeeValidationError(
                    "Percentage is required for percentage discounts."
                )
            try:
                percentage_value = float(percentage)
            except (TypeError, ValueError) as exc:
                raise FeeValidationError("Percentage must be a number.") from exc
            if percentage_value <= 0 or percentage_value > 100:
                raise FeeValidationError("Percentage must be between 0 and 100.")
            cleaned["percentage"] = percentage_value
        else:
            amount = payload.get("amount")
            if amount in (None, ""):
                raise FeeValidationError("Amount is required for fixed discounts.")
            try:
                amount_value = Decimal(str(amount))
            except (InvalidOperation, TypeError, ValueError) as exc:
                raise FeeValidationError("Amount must be a number.") from exc
            if amount_value <= 0:
                raise FeeValidationError("Amount must be greater than zero.")
            cleaned["amount"] = amount_value

        if cleaned["is_active"] not in {"yes", "no"}:
            raise FeeValidationError("is_active must be 'yes' or 'no'.")

        return cleaned
