from typing import Any

from django.db import transaction

from apps.fees.domain.fee_exceptions import FeeNotFoundError, FeeValidationError
from apps.fees.models.fee_groups_feetype import FeeGroupsFeetype
from apps.fees.models.fee_session_groups import FeeSessionGroups
from apps.fees.selectors import fee_selectors as selectors


class FeeAssignmentService:
    def list_assignments(self):
        return FeeSessionGroups.objects.all().order_by("id")

    def get_assignment(self, assignment_id: int) -> dict[str, Any]:
        fsg = FeeSessionGroups.objects.filter(id=assignment_id).first()
        if fsg is None:
            raise FeeNotFoundError("Fee assignment not found.")
        return selectors.assignment_to_dict(fsg)

    def create_assignment(self, payload: dict[str, Any]) -> dict[str, Any]:
        class_id = payload.get("class_id")
        fee_group_id = payload.get("fee_group_id")
        session_id = payload.get("session_id")
        lines = payload.get("lines", [])
        is_active = payload.get("is_active", "no")

        if not class_id or not fee_group_id or not session_id:
            raise FeeValidationError("Class, fee group, and session are required.")
        if not lines:
            raise FeeValidationError("Add at least one fee line.")

        with transaction.atomic():
            fsg = FeeSessionGroups.objects.create(
                fee_groups_id=fee_group_id,
                class_id=class_id,
                session_id=session_id,
                is_active=is_active,
                created_at=selectors.now_datetime(),
            )
            self._create_lines(fsg, lines, fee_group_id, session_id, class_id, is_active)
        return selectors.assignment_to_dict(fsg)

    def update_assignment(self, assignment_id: int, payload: dict[str, Any]) -> dict[str, Any]:
        fsg = FeeSessionGroups.objects.filter(id=assignment_id).first()
        if fsg is None:
            raise FeeNotFoundError("Fee assignment not found.")

        class_id = payload.get("class_id", fsg.class_id)
        fee_group_id = payload.get("fee_group_id", fsg.fee_groups_id)
        session_id = payload.get("session_id", fsg.session_id)
        lines = payload.get("lines")
        is_active = payload.get("is_active", fsg.is_active)

        with transaction.atomic():
            fsg.class_id = class_id
            fsg.fee_groups_id = fee_group_id
            fsg.session_id = session_id
            fsg.is_active = is_active
            fsg.save()

            if lines is not None:
                FeeGroupsFeetype.objects.filter(fee_session_group_id=fsg.id).delete()
                self._create_lines(fsg, lines, fee_group_id, session_id, class_id, is_active)

        return selectors.assignment_to_dict(fsg)

    def delete_assignment(self, assignment_id: int) -> None:
        fsg = FeeSessionGroups.objects.filter(id=assignment_id).first()
        if fsg is None:
            raise FeeNotFoundError("Fee assignment not found.")
        if fsg.is_active == "yes":
            raise FeeValidationError("Deactivate the assignment before deleting.")

        with transaction.atomic():
            FeeGroupsFeetype.objects.filter(fee_session_group_id=fsg.id).delete()
            fsg.delete()

    def enrich_list(self, rows) -> list[dict[str, Any]]:
        return [selectors.assignment_to_dict(fsg) for fsg in rows]

    @staticmethod
    def _create_lines(fsg, lines, fee_group_id, session_id, class_id, is_active):
        for line in lines:
            FeeGroupsFeetype.objects.create(
                parent_id=0,
                fee_session_group_id=fsg.id,
                fee_groups_id=fee_group_id,
                feetype_id=line.get("feetype_id"),
                session_id=session_id,
                class_id=class_id,
                amount=line.get("amount", 0),
                due_date=line.get("due_date") if line.get("due_date") else None,
                fine_type="none",
                fine_percentage=0,
                fine_amount=0,
                collection_type=0,
                is_active=is_active,
                created_at=selectors.now_datetime(),
            )
