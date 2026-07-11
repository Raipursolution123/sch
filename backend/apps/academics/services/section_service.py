import logging
from typing import Any

from apps.academics.checks.academic_structure_dependencies import (
    has_active_class_section_for_section,
    has_active_students_for_section,
)
from apps.academics.domain.academic_structure_exceptions import (
    AcademicStructureInUseError,
    AcademicStructureNotFoundError,
    AcademicStructureValidationError,
)
from apps.academics.models import Sections
from apps.academics.selectors import section_selectors as selectors

logger = logging.getLogger(__name__)


class SectionService:
    def list_sections(self, active_only: bool = False):
        return selectors.list_sections(active_only=active_only)

    def get_section(self, section_id: int) -> dict[str, Any]:
        section = selectors.get_section_by_id(section_id)
        if section is None:
            raise AcademicStructureNotFoundError("Section not found.")
        return selectors.section_to_dict(section)

    def create_section(self, section_name: str) -> dict[str, Any]:
        name = self._normalize_name(section_name)
        self._ensure_unique(name)
        section = Sections.objects.create(
            section=name,
            is_active="yes",
            created_at=selectors.now_datetime(),
            updated_at=None,
        )
        logger.info("Section '%s' created (id=%s).", name, section.id)
        return selectors.section_to_dict(section)

    def update_section(
        self, section_id: int, payload: dict[str, Any]
    ) -> dict[str, Any]:
        section = selectors.get_section_by_id(section_id)
        if section is None:
            raise AcademicStructureNotFoundError("Section not found.")

        update_fields: list[str] = []
        if "section_name" in payload:
            name = self._normalize_name(payload["section_name"])
            self._ensure_unique(name, exclude_id=section_id)
            section.section = name
            update_fields.append("section")

        if "is_active" in payload:
            flag = self._normalize_active(payload["is_active"])
            if flag == "no":
                self._assert_can_deactivate(section_id)
            section.is_active = flag
            update_fields.append("is_active")

        if not update_fields:
            raise AcademicStructureValidationError("No updatable fields provided.")

        section.updated_at = selectors.today_date()
        update_fields.append("updated_at")
        section.save(update_fields=update_fields)
        return selectors.section_to_dict(section)

    def deactivate_section(self, section_id: int) -> None:
        section = selectors.get_section_by_id(section_id)
        if section is None:
            raise AcademicStructureNotFoundError("Section not found.")
        self._assert_can_deactivate(section_id)
        section.is_active = "no"
        section.updated_at = selectors.today_date()
        section.save(update_fields=["is_active", "updated_at"])
        logger.info("Section id=%s deactivated.", section_id)

    def _assert_can_deactivate(self, section_id: int) -> None:
        if has_active_class_section_for_section(section_id):
            raise AcademicStructureInUseError(
                "Cannot deactivate section. It is currently assigned to one or more active class mappings."
            )
        if has_active_students_for_section(section_id):
            raise AcademicStructureInUseError(
                "Cannot deactivate section. Active students are enrolled in this section."
            )

    @staticmethod
    def _normalize_name(raw: str) -> str:
        name = str(raw or "").strip()
        if not name:
            raise AcademicStructureValidationError("Section name is required.")
        if len(name) > 60:
            raise AcademicStructureValidationError(
                "Section name must be at most 60 characters."
            )
        return name

    @staticmethod
    def _ensure_unique(name: str, exclude_id: int | None = None) -> None:
        qs = Sections.objects.filter(section__iexact=name)
        if exclude_id is not None:
            qs = qs.exclude(pk=exclude_id)
        if qs.exists():
            raise AcademicStructureValidationError(f"Section '{name}' already exists.")

    @staticmethod
    def _normalize_active(value) -> str:
        flag = str(value).lower()
        if flag not in {"yes", "no"}:
            raise AcademicStructureValidationError("is_active must be 'yes' or 'no'.")
        return flag
