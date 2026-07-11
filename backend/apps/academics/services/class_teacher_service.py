import logging
from typing import Any

from apps.academics.domain.class_teacher_exceptions import (
    ClassTeacherNotFoundError,
    ClassTeacherValidationError,
)
from apps.academics.models import Classes, ClassSections, Sections
from apps.academics.models.class_teacher import ClassTeacher
from apps.academics.models.sessions import Sessions
from apps.academics.selectors import class_teacher_selectors as selectors
from apps.staff.models import Staff

logger = logging.getLogger(__name__)


class ClassTeacherService:
    def list_assignments(
        self,
        session_id: int,
        class_id: int | None = None,
        section_id: int | None = None,
    ) -> list[dict[str, Any]]:
        self._ensure_session_exists(session_id)
        session = Sessions.objects.filter(id=session_id).first()
        session_label = session.session if session else None

        mappings = ClassSections.objects.filter(is_active="yes").order_by(
            "class_id", "section_id"
        )
        if class_id is not None:
            mappings = mappings.filter(class_id=class_id)
        if section_id is not None:
            mappings = mappings.filter(section_id=section_id)

        active_class_ids = set(
            Classes.objects.filter(is_active="yes").values_list("id", flat=True)
        )
        active_section_ids = set(
            Sections.objects.filter(is_active="yes").values_list("id", flat=True)
        )

        assignment_map: dict[tuple[int, int], ClassTeacher] = {}
        for row in selectors.list_assignments_for_session(
            session_id, class_id, section_id
        ):
            assignment_map[(row.class_id, row.section_id)] = row

        rows: list[dict[str, Any]] = []
        for mapping in mappings:
            if mapping.class_id not in active_class_ids:
                continue
            if mapping.section_id not in active_section_ids:
                continue
            assignment = assignment_map.get((mapping.class_id, mapping.section_id))
            if assignment is None:
                rows.append(
                    selectors.unassigned_row_dict(
                        session_id=session_id,
                        session_label=session_label,
                        mapping=mapping,
                    )
                )
            else:
                rows.append(
                    selectors.assignment_to_dict(
                        assignment,
                        session_label=session_label,
                        class_section_id=mapping.id,
                    )
                )
        return rows

    def get_assignment(self, assignment_id: int) -> dict[str, Any]:
        assignment = selectors.get_assignment_by_id(assignment_id)
        if assignment is None:
            raise ClassTeacherNotFoundError()
        return selectors.assignment_to_dict(assignment)

    def assign_teacher(self, payload: dict[str, Any]) -> dict[str, Any]:
        session_id = self._require_int(payload.get("session_id"), "session_id")
        class_id = self._require_int(payload.get("class_id"), "class_id")
        section_id = self._require_int(payload.get("section_id"), "section_id")
        staff_id = self._require_int(payload.get("staff_id"), "staff_id")

        self._ensure_session_exists(session_id)
        self._ensure_active_class(class_id)
        self._ensure_active_section(section_id)
        self._ensure_active_class_section(class_id, section_id)
        self._ensure_active_staff(staff_id)

        existing = selectors.get_assignment_by_scope(session_id, class_id, section_id)
        if existing is not None:
            existing.staff_id = staff_id
            existing.save(update_fields=["staff_id"])
            logger.info("Class teacher updated via upsert (id=%s).", existing.id)
            return selectors.assignment_to_dict(existing)

        assignment = ClassTeacher.objects.create(
            session_id=session_id,
            class_id=class_id,
            section_id=section_id,
            staff_id=staff_id,
        )
        logger.info("Class teacher assigned (id=%s).", assignment.id)
        return selectors.assignment_to_dict(assignment)

    def update_assignment(
        self, assignment_id: int, payload: dict[str, Any]
    ) -> dict[str, Any]:
        assignment = selectors.get_assignment_by_id(assignment_id)
        if assignment is None:
            raise ClassTeacherNotFoundError()

        for field in ("session_id", "class_id", "section_id"):
            if field in payload and self._require_int(payload[field], field) != getattr(
                assignment, field
            ):
                raise ClassTeacherValidationError(
                    f"{field} cannot be changed after creation."
                )

        if "staff_id" not in payload:
            raise ClassTeacherValidationError("staff_id is required.")

        staff_id = self._require_int(payload["staff_id"], "staff_id")
        self._ensure_active_staff(staff_id)
        assignment.staff_id = staff_id
        assignment.save(update_fields=["staff_id"])
        logger.info("Class teacher assignment updated (id=%s).", assignment.id)
        return selectors.assignment_to_dict(assignment)

    def delete_assignment(self, assignment_id: int) -> None:
        assignment = selectors.get_assignment_by_id(assignment_id)
        if assignment is None:
            raise ClassTeacherNotFoundError()
        assignment.delete()
        logger.info("Class teacher assignment removed (id=%s).", assignment_id)

    @staticmethod
    def _require_int(value, field_name: str) -> int:
        if value in (None, ""):
            raise ClassTeacherValidationError(f"{field_name} is required.")
        try:
            return int(value)
        except (TypeError, ValueError) as exc:
            raise ClassTeacherValidationError(
                f"{field_name} must be an integer."
            ) from exc

    @staticmethod
    def _ensure_session_exists(session_id: int) -> None:
        if not Sessions.objects.filter(id=session_id).exists():
            raise ClassTeacherNotFoundError("Academic session not found.")

    @staticmethod
    def _ensure_active_class(class_id: int) -> None:
        class_obj = Classes.objects.filter(id=class_id).first()
        if class_obj is None:
            raise ClassTeacherNotFoundError("Class not found.")
        if class_obj.is_active != "yes":
            raise ClassTeacherValidationError("Class is not active.")

    @staticmethod
    def _ensure_active_section(section_id: int) -> None:
        section = Sections.objects.filter(id=section_id).first()
        if section is None:
            raise ClassTeacherNotFoundError("Section not found.")
        if section.is_active != "yes":
            raise ClassTeacherValidationError("Section is not active.")

    @staticmethod
    def _ensure_active_class_section(class_id: int, section_id: int) -> None:
        exists = ClassSections.objects.filter(
            class_id=class_id, section_id=section_id, is_active="yes"
        ).exists()
        if not exists:
            raise ClassTeacherValidationError(
                "No active class-section mapping exists for this class and section."
            )

    @staticmethod
    def _ensure_active_staff(staff_id: int) -> None:
        staff = Staff.objects.filter(id=staff_id).first()
        if staff is None:
            raise ClassTeacherNotFoundError("Staff member not found.")
        if staff.is_active not in (1, "1", True):
            raise ClassTeacherValidationError("Staff member is not active.")
