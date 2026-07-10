import logging
from typing import Any

from apps.academics.checks.academic_structure_dependencies import (
    has_active_class_section_for_class,
    has_active_students_for_class,
    has_active_students_for_mapping,
)
from apps.academics.domain.academic_structure_exceptions import (
    AcademicStructureInUseError,
    AcademicStructureNotFoundError,
    AcademicStructureValidationError,
)
from apps.academics.models import Classes, ClassSections, Sections
from apps.academics.selectors import class_selectors as selectors

logger = logging.getLogger(__name__)


class ClassService:
    def list_classes(self, active_only: bool = False):
        return selectors.list_classes(active_only=active_only)

    def get_class(self, class_id: int) -> dict[str, Any]:
        class_obj = selectors.get_class_by_id(class_id)
        if class_obj is None:
            raise AcademicStructureNotFoundError("Class not found.")
        sections = selectors.active_sections_for_class(class_id)
        return selectors.class_to_dict(class_obj, sections)

    def create_class(self, payload: dict[str, Any]) -> dict[str, Any]:
        name = self._normalize_name(payload.get("class_name"))
        self._ensure_unique(name)
        sort_order = self._normalize_sort_order(payload.get("sort_order", 9999))
        is_hedu = self._normalize_hedu(payload.get("is_hedu_program", False))
        section_ids = self._normalize_section_ids(payload.get("sections", []))

        class_obj = Classes.objects.create(
            class_field=name,
            sort_order=sort_order,
            is_hedu_program=is_hedu,
            is_active="yes",
            created_at=selectors.now_datetime(),
            updated_at=None,
        )
        for sec_id in section_ids:
            ClassSections.objects.create(
                class_id=class_obj.id,
                section_id=sec_id,
                is_active="yes",
                created_at=selectors.now_datetime(),
            )

        logger.info(
            "Class '%s' created (id=%s) with sections %s.",
            name,
            class_obj.id,
            section_ids,
        )
        return self.get_class(class_obj.id)

    def update_class(self, class_id: int, payload: dict[str, Any]) -> dict[str, Any]:
        class_obj = selectors.get_class_by_id(class_id)
        if class_obj is None:
            raise AcademicStructureNotFoundError("Class not found.")

        update_fields: list[str] = []
        if "class_name" in payload:
            name = self._normalize_name(payload["class_name"])
            self._ensure_unique(name, exclude_id=class_id)
            class_obj.class_field = name
            update_fields.append("class_field")

        if "is_active" in payload:
            flag = self._normalize_active(payload["is_active"])
            if flag == "no":
                self._assert_can_deactivate(class_id)
            class_obj.is_active = flag
            update_fields.append("is_active")

        if "sort_order" in payload:
            class_obj.sort_order = self._normalize_sort_order(payload["sort_order"])
            update_fields.append("sort_order")

        if "is_hedu_program" in payload:
            class_obj.is_hedu_program = self._normalize_hedu(payload["is_hedu_program"])
            update_fields.append("is_hedu_program")

        section_ids = None
        if "sections" in payload:
            section_ids = self._normalize_section_ids(payload["sections"])

        if not update_fields and section_ids is None:
            raise AcademicStructureValidationError("No updatable fields provided.")

        class_obj.updated_at = selectors.today_date()
        update_fields.append("updated_at")
        class_obj.save(update_fields=list(set(update_fields)))

        if section_ids is not None:
            self._sync_section_mappings(class_obj, section_ids)

        return self.get_class(class_id)

    def deactivate_class(self, class_id: int) -> None:
        class_obj = selectors.get_class_by_id(class_id)
        if class_obj is None:
            raise AcademicStructureNotFoundError("Class not found.")
        self._assert_can_deactivate(class_id)
        class_obj.is_active = "no"
        class_obj.updated_at = selectors.today_date()
        class_obj.save(update_fields=["is_active", "updated_at"])
        logger.info("Class id=%s deactivated.", class_id)

    def _sync_section_mappings(
        self, class_obj: Classes, section_ids: list[int]
    ) -> None:
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
                if has_active_students_for_mapping(class_obj.id, m.section_id):
                    sec = Sections.objects.filter(id=m.section_id).first()
                    sec_name = sec.section if sec else str(m.section_id)
                    raise AcademicStructureInUseError(
                        f"Cannot remove section '{sec_name}' from class "
                        f"'{class_obj.class_field}' because active students are assigned "
                        "to this specific mapping."
                    )
                if m.is_active != "no":
                    m.is_active = "no"
                    m.updated_at = selectors.today_date()
                    m.save(update_fields=["is_active", "updated_at"])

    def _assert_can_deactivate(self, class_id: int) -> None:
        if has_active_class_section_for_class(class_id):
            raise AcademicStructureInUseError(
                "Cannot deactivate class. It is currently assigned to one or more active sections."
            )
        if has_active_students_for_class(class_id):
            raise AcademicStructureInUseError(
                "Cannot deactivate class. Active students are enrolled in this class."
            )

    @staticmethod
    def _normalize_name(raw) -> str:
        name = str(raw or "").strip()
        if not name:
            raise AcademicStructureValidationError("Class name is required.")
        if len(name) > 60:
            raise AcademicStructureValidationError(
                "Class name must be at most 60 characters."
            )
        return name

    @staticmethod
    def _ensure_unique(name: str, exclude_id: int | None = None) -> None:
        qs = Classes.objects.filter(class_field__iexact=name)
        if exclude_id is not None:
            qs = qs.exclude(pk=exclude_id)
        if qs.exists():
            raise AcademicStructureValidationError(f"Class '{name}' already exists.")

    @staticmethod
    def _normalize_sort_order(value) -> int:
        if value in (None, ""):
            return 9999
        try:
            return int(value)
        except (TypeError, ValueError) as exc:
            raise AcademicStructureValidationError(
                "sort_order must be an integer."
            ) from exc

    @staticmethod
    def _normalize_hedu(value) -> str:
        if value is True or str(value).lower() in {"yes", "true", "1"}:
            return "yes"
        return "no"

    @staticmethod
    def _normalize_active(value) -> str:
        flag = str(value).lower()
        if flag not in {"yes", "no"}:
            raise AcademicStructureValidationError("is_active must be 'yes' or 'no'.")
        return flag

    @staticmethod
    def _normalize_section_ids(raw) -> list[int]:
        if raw is None:
            return []
        if isinstance(raw, str):
            import json

            try:
                raw = json.loads(raw)
            except ValueError as exc:
                raise AcademicStructureValidationError(
                    "sections must be a list."
                ) from exc
        if not isinstance(raw, list):
            raise AcademicStructureValidationError("sections must be a list.")
        try:
            section_ids = list({int(sid) for sid in raw})
        except (TypeError, ValueError) as exc:
            raise AcademicStructureValidationError(
                "sections must contain valid integers."
            ) from exc
        if section_ids:
            valid = Sections.objects.filter(id__in=section_ids).count()
            if valid != len(section_ids):
                raise AcademicStructureValidationError(
                    "One or more provided section IDs are invalid."
                )
        return section_ids
