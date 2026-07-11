from datetime import date
from typing import Any

from apps.fees.domain.fee_exceptions import FeeValidationError
from apps.fees.selectors import fee_search_selectors as search_selectors
from apps.students.selectors import student_selectors as selectors


class FeePaymentSearchService:
    def search_payments(
        self,
        *,
        from_date: date,
        to_date: date,
        class_id: int | None = None,
        section_id: int | None = None,
        query: str | None = None,
        payment_mode: str | None = None,
    ) -> dict[str, Any]:
        active_session = selectors.get_active_session()
        if not active_session:
            raise FeeValidationError("No active academic session found.")

        if from_date > to_date:
            raise FeeValidationError("from_date cannot be after to_date.")

        if (
            class_id
            and section_id
            and not selectors.class_section_mapping_active(class_id, section_id)
        ):
            raise FeeValidationError(
                "Class and section are not assigned to each other."
            )

        payments = search_selectors.search_payment_rows(
            session_id=active_session.id,
            from_date=from_date,
            to_date=to_date,
            class_id=class_id,
            section_id=section_id,
            query=query,
            payment_mode=payment_mode,
        )

        return {
            "session_name": active_session.session,
            "from_date": from_date.isoformat(),
            "to_date": to_date.isoformat(),
            "total_payments": len(payments),
            "total_amount": sum(row["amount"] for row in payments),
            "payments": payments,
        }
