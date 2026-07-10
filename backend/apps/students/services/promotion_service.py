import logging
from typing import Any

from django.db import transaction
from django.utils import timezone

from apps.academics.models import Classes, ClassSections, Sections
from apps.academics.models.sessions import Sessions
from apps.academics.selectors.session_selectors import get_current_session_id
from apps.students.domain.promotion_exceptions import (
    PromotionNotFoundError,
    PromotionValidationError,
)
from apps.students.models.student_session import StudentSession
from apps.students.selectors import promotion_selectors as selectors

logger = logging.getLogger(__name__)


class PromotionService:
    def preview(
        self,
        from_session_id: int,
        from_class_id: int,
        from_section_id: int,
        to_session_id: int,
        to_class_id: int,
        to_section_id: int,
    ) -> dict[str, Any]:
        self._validate_scope(
            from_session_id,
            from_class_id,
            from_section_id,
            to_session_id,
            to_class_id,
            to_section_id,
        )

        enrollments = selectors.list_source_enrollments(
            from_session_id, from_class_id, from_section_id
        )
        student_map = selectors.students_by_ids(
            [e.student_id for e in enrollments if e.student_id]
        )
        target_ids = selectors.target_student_ids(to_session_id)

        class_name = selectors.class_label(from_class_id)
        section_name = selectors.section_label(from_section_id)

        students: list[dict[str, Any]] = []
        eligible_count = 0
        already_in_target_count = 0
        inactive_skipped_count = 0

        for enrollment in enrollments:
            student = student_map.get(enrollment.student_id)
            in_target = enrollment.student_id in target_ids
            fee_warning = selectors.has_active_fees(enrollment.id)
            row = selectors.enrollment_preview_row(
                enrollment,
                student,
                in_target=in_target,
                class_name=class_name,
                section_name=section_name,
                fee_warning=fee_warning,
            )
            students.append(row)

            if student and student.is_active != "yes":
                inactive_skipped_count += 1
            elif in_target:
                already_in_target_count += 1
            elif row["eligible"]:
                eligible_count += 1

        warnings: list[str] = []
        if already_in_target_count:
            warnings.append(
                f"{already_in_target_count} student(s) already enrolled in target "
                "session will be skipped."
            )
        fee_warn_count = sum(1 for row in students if row.get("fee_warning"))
        if fee_warn_count:
            warnings.append(
                f"{fee_warn_count} student(s) have active fee assignments on the "
                "source enrollment."
            )

        return {
            "eligible_count": eligible_count,
            "already_in_target_count": already_in_target_count,
            "inactive_skipped_count": inactive_skipped_count,
            "students": students,
            "warnings": warnings,
        }

    def execute(self, payload: dict[str, Any]) -> dict[str, Any]:
        from_session_id = self._require_int(payload.get("from_session_id"), "from_session_id")
        from_class_id = self._require_int(payload.get("from_class_id"), "from_class_id")
        from_section_id = self._require_int(payload.get("from_section_id"), "from_section_id")
        to_session_id = self._require_int(payload.get("to_session_id"), "to_session_id")
        to_class_id = self._require_int(payload.get("to_class_id"), "to_class_id")
        to_section_id = self._require_int(payload.get("to_section_id"), "to_section_id")

        to_subject_group_id = payload.get("to_subject_group_id")
        if to_subject_group_id not in (None, ""):
            to_subject_group_id = self._require_int(
                to_subject_group_id, "to_subject_group_id"
            )
        else:
            to_subject_group_id = None

        deactivate_source = bool(payload.get("deactivate_source", True))
        mark_alumni = bool(payload.get("mark_alumni", False))
        student_ids_filter = payload.get("student_ids")

        target_cs_id = self._validate_scope(
            from_session_id,
            from_class_id,
            from_section_id,
            to_session_id,
            to_class_id,
            to_section_id,
            to_subject_group_id=to_subject_group_id,
        )

        enrollments = selectors.list_source_enrollments(
            from_session_id, from_class_id, from_section_id
        )
        if student_ids_filter:
            allowed = {self._require_int(sid, "student_ids") for sid in student_ids_filter}
            enrollments = [e for e in enrollments if e.student_id in allowed]

        student_map = selectors.students_by_ids(
            [e.student_id for e in enrollments if e.student_id]
        )
        target_ids = selectors.target_student_ids(to_session_id)
        current_session_id = get_current_session_id()

        promoted: list[dict[str, Any]] = []
        skipped_count = 0

        with transaction.atomic():
            for source in enrollments:
                student = student_map.get(source.student_id)
                if student is None or student.is_active != "yes":
                    skipped_count += 1
                    continue
                if source.student_id in target_ids:
                    skipped_count += 1
                    continue

                default_login = 0
                if (
                    current_session_id == to_session_id
                    and source.default_login == 1
                ):
                    default_login = 1
                    source.default_login = 0
                    source.save(update_fields=["default_login"])

                created = StudentSession.objects.create(
                    session_id=to_session_id,
                    student_id=source.student_id,
                    class_id=to_class_id,
                    section_id=to_section_id,
                    subject_group_id=to_subject_group_id,
                    vehroute_id=source.vehroute_id,
                    route_pickup_point_id=source.route_pickup_point_id,
                    hostel_room_id=source.hostel_room_id,
                    transport_fees=source.transport_fees,
                    fees_discount=source.fees_discount,
                    is_active="yes",
                    is_alumni=0,
                    default_login=default_login,
                    created_at=timezone.now(),
                    updated_at=timezone.now().date(),
                )
                target_ids.add(source.student_id)

                if deactivate_source:
                    source.is_active = "no"
                    source.default_login = 0
                    if mark_alumni:
                        source.is_alumni = 1
                    source.updated_at = timezone.now().date()
                    source.save(
                        update_fields=["is_active", "is_alumni", "default_login", "updated_at"]
                    )

                promoted.append(
                    {
                        "student_id": source.student_id,
                        "new_student_session_id": created.id,
                    }
                )

        logger.info(
            "Promoted %s student(s) from session %s to %s (skipped %s).",
            len(promoted),
            from_session_id,
            to_session_id,
            skipped_count,
        )
        return {
            "promoted_count": len(promoted),
            "skipped_count": skipped_count,
            "promoted": promoted,
        }

    def _validate_scope(
        self,
        from_session_id: int,
        from_class_id: int,
        from_section_id: int,
        to_session_id: int,
        to_class_id: int,
        to_section_id: int,
        *,
        to_subject_group_id: int | None = None,
    ) -> int:
        if from_session_id == to_session_id:
            raise PromotionValidationError(
                "Source and target sessions must be different."
            )

        self._ensure_session(from_session_id, "from_session_id")
        self._ensure_session(to_session_id, "to_session_id")
        self._ensure_active_class(from_class_id, "from_class_id")
        self._ensure_active_class(to_class_id, "to_class_id")
        self._ensure_active_section(from_section_id, "from_section_id")
        self._ensure_active_section(to_section_id, "to_section_id")
        self._ensure_class_section(from_class_id, from_section_id)
        target_cs_id = self._ensure_class_section(to_class_id, to_section_id)

        if to_subject_group_id is not None:
            if not selectors.subject_group_valid_for_target(
                to_subject_group_id, to_session_id, target_cs_id
            ):
                raise PromotionValidationError(
                    "Subject group is not linked to the target class-section."
                )
        return target_cs_id

    @staticmethod
    def _require_int(value, field_name: str) -> int:
        if value in (None, ""):
            raise PromotionValidationError(f"{field_name} is required.")
        try:
            return int(value)
        except (TypeError, ValueError) as exc:
            raise PromotionValidationError(
                f"{field_name} must be an integer."
            ) from exc

    @staticmethod
    def _ensure_session(session_id: int, label: str) -> None:
        if not Sessions.objects.filter(id=session_id).exists():
            raise PromotionNotFoundError(f"{label} session not found.")

    @staticmethod
    def _ensure_active_class(class_id: int, label: str) -> None:
        row = Classes.objects.filter(id=class_id).first()
        if row is None:
            raise PromotionNotFoundError(f"{label} class not found.")
        if row.is_active != "yes":
            raise PromotionValidationError(f"{label} class is not active.")

    @staticmethod
    def _ensure_active_section(section_id: int, label: str) -> None:
        row = Sections.objects.filter(id=section_id).first()
        if row is None:
            raise PromotionNotFoundError(f"{label} section not found.")
        if row.is_active != "yes":
            raise PromotionValidationError(f"{label} section is not active.")

    @staticmethod
    def _ensure_class_section(class_id: int, section_id: int) -> int:
        mapping = ClassSections.objects.filter(
            class_id=class_id, section_id=section_id, is_active="yes"
        ).first()
        if mapping is None:
            raise PromotionValidationError(
                "No active class-section mapping exists for the given class and section."
            )
        return mapping.id
