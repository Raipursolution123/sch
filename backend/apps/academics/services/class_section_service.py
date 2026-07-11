import logging
from typing import Any

from apps.academics.checks.academic_structure_dependencies import (
    has_active_students_for_mapping,
)
from apps.academics.domain.academic_structure_exceptions import (
    AcademicStructureInUseError,
    AcademicStructureNotFoundError,
    AcademicStructureValidationError,
)
from apps.academics.models import Classes, ClassSections, Sections
from apps.academics.selectors import class_section_selectors as selectors

logger = logging.getLogger(__name__)


class ClassSectionService:
    def list_mappings(self, active_only: bool = False):
        return selectors.list_mappings(active_only=active_only)

    def get_mapping(self, mapping_id: int) -> dict[str, Any]:
        mapping = selectors.get_mapping_by_id(mapping_id)
        if mapping is None:
            raise AcademicStructureNotFoundError("Class-Section mapping not found.")
        return selectors.mapping_to_dict(mapping)

    def create_mapping(self, payload: dict[str, Any]) -> dict[str, Any]:
        class_id = self._require_int(payload.get("class_id"), "class_id")
        section_id = self._require_int(payload.get("section_id"), "section_id")
        is_active = self._normalize_active(payload.get("is_active", "yes"))

        if not Classes.objects.filter(id=class_id).exists():
            raise AcademicStructureNotFoundError("Class not found.")
        if not Sections.objects.filter(id=section_id).exists():
            raise AcademicStructureNotFoundError("Section not found.")

        existing = selectors.get_mapping_by_pair(class_id, section_id)
        if existing is not None:
            # Decision D: reactivate soft-inactive pair instead of duplicate error.
            if existing.is_active == "yes":
                raise AcademicStructureValidationError(
                    "This class and section combination already exists."
                )
            existing.is_active = is_active
            existing.updated_at = selectors.today_date()
            existing.save(update_fields=["is_active", "updated_at"])
            return selectors.mapping_to_dict(existing)

        mapping = ClassSections.objects.create(
            class_id=class_id,
            section_id=section_id,
            is_active=is_active,
            created_at=selectors.now_datetime(),
        )
        logger.info(
            "Class-Section mapping created (class=%s section=%s).",
            class_id,
            section_id,
        )
        return selectors.mapping_to_dict(mapping)

    def update_mapping(
        self, mapping_id: int, payload: dict[str, Any]
    ) -> dict[str, Any]:
        mapping = selectors.get_mapping_by_id(mapping_id)
        if mapping is None:
            raise AcademicStructureNotFoundError("Class-Section mapping not found.")

        if "is_active" not in payload:
            raise AcademicStructureValidationError("No updatable fields provided.")

        flag = self._normalize_active(payload["is_active"])
        if flag == "no":
            self._assert_can_deactivate(mapping)
        mapping.is_active = flag
        mapping.updated_at = selectors.today_date()
        mapping.save(update_fields=["is_active", "updated_at"])
        return selectors.mapping_to_dict(mapping)

    def deactivate_mapping(self, mapping_id: int) -> None:
        mapping = selectors.get_mapping_by_id(mapping_id)
        if mapping is None:
            raise AcademicStructureNotFoundError("Class-Section mapping not found.")
        self._assert_can_deactivate(mapping)
        mapping.is_active = "no"
        mapping.updated_at = selectors.today_date()
        mapping.save(update_fields=["is_active", "updated_at"])

    def bulk_assign(self, class_id: int, section_ids: list[int]) -> None:
        try:
            class_obj = Classes.objects.get(pk=class_id)
        except Classes.DoesNotExist as exc:
            raise AcademicStructureNotFoundError("Class not found.") from exc

        section_ids = list({int(sid) for sid in section_ids})
        sections = list(Sections.objects.filter(id__in=section_ids))
        if len(sections) != len(section_ids):
            raise AcademicStructureValidationError(
                "One or more provided section IDs are invalid."
            )

        existing = ClassSections.objects.filter(class_id=class_obj.id)
        mapping_dict = {m.section_id: m for m in existing}

        for sec_id in section_ids:
            if sec_id in mapping_dict:
                m = mapping_dict[sec_id]
                if m.is_active != "yes":
                    m.is_active = "yes"
                    m.updated_at = selectors.today_date()
                    m.save(update_fields=["is_active", "updated_at"])
            else:
                ClassSections.objects.create(
                    class_id=class_obj.id,
                    section_id=sec_id,
                    is_active="yes",
                    created_at=selectors.now_datetime(),
                )

        for sec_id, m in mapping_dict.items():
            if sec_id not in section_ids:
                self._assert_can_deactivate(m)
                if m.is_active != "no":
                    m.is_active = "no"
                    m.updated_at = selectors.today_date()
                    m.save(update_fields=["is_active", "updated_at"])

        logger.info(
            "ClassSections bulk-assigned for class '%s' -> %s.",
            class_obj.class_field,
            section_ids,
        )

    def list_assigned_sections(self, class_id: int) -> list[dict[str, Any]]:
        if not Classes.objects.filter(pk=class_id).exists():
            raise AcademicStructureNotFoundError("Class not found.")
        from apps.academics.selectors import class_selectors as class_sel

        return class_sel.active_sections_for_class(class_id)

    def _assert_can_deactivate(self, mapping: ClassSections) -> None:
        if mapping.class_id and mapping.section_id:
            if has_active_students_for_mapping(mapping.class_id, mapping.section_id):
                raise AcademicStructureInUseError(
                    "Cannot deactivate mapping. Active students are currently assigned to this mapping."
                )

    @staticmethod
    def _require_int(value, field: str) -> int:
        if value is None or value == "":
            raise AcademicStructureValidationError(f"{field} is required.")
        try:
            return int(value)
        except (TypeError, ValueError) as exc:
            raise AcademicStructureValidationError(
                f"{field} must be an integer."
            ) from exc

    @staticmethod
    def _normalize_active(value) -> str:
        flag = str(value).lower()
        if flag not in {"yes", "no"}:
            raise AcademicStructureValidationError("is_active must be 'yes' or 'no'.")
        return flag
