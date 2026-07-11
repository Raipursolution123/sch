import logging
from typing import Any

from apps.academics.checks.subject_group_dependencies import subject_group_is_in_use
from apps.academics.domain.subject_group_exceptions import (
    SubjectGroupInUseError,
    SubjectGroupNotFoundError,
    SubjectGroupValidationError,
)
from apps.academics.models import (
    ClassSections,
    SubjectGroupClassSections,
    SubjectGroups,
    SubjectGroupSubjects,
    Subjects,
)
from apps.academics.models.sessions import Sessions
from apps.academics.selectors import subject_group_selectors as selectors

logger = logging.getLogger(__name__)


class SubjectGroupService:
    def list_groups(self, session_id: int | None = None):
        return selectors.list_groups(session_id=session_id)

    def get_group(self, group_id: int) -> dict[str, Any]:
        group = selectors.get_group_by_id(group_id)
        if group is None:
            raise SubjectGroupNotFoundError()
        return selectors.group_detail_dict(group)

    def create_group(self, payload: dict[str, Any]) -> dict[str, Any]:
        name = self._normalize_name(payload.get("name"))
        session_id = self._require_session_id(payload.get("session_id"))
        self._ensure_session_exists(session_id)
        self._ensure_unique_name(name, session_id)
        description = self._normalize_description(payload.get("description"))

        group = SubjectGroups.objects.create(
            name=name,
            session_id=session_id,
            description=description,
            parent_subject_group_id=None,
            created_at=selectors.now_datetime(),
        )
        logger.info("Subject group '%s' created (id=%s).", name, group.id)
        return selectors.group_detail_dict(group)

    def update_group(self, group_id: int, payload: dict[str, Any]) -> dict[str, Any]:
        group = selectors.get_group_by_id(group_id)
        if group is None:
            raise SubjectGroupNotFoundError()

        update_fields: list[str] = []
        if "name" in payload:
            name = self._normalize_name(payload["name"])
            self._ensure_unique_name(name, group.session_id, exclude_id=group_id)
            group.name = name
            update_fields.append("name")

        if "description" in payload:
            group.description = self._normalize_description(payload["description"])
            update_fields.append("description")

        if not update_fields:
            raise SubjectGroupValidationError("No updatable fields provided.")

        group.save(update_fields=update_fields)
        return selectors.group_detail_dict(group)

    def delete_group(self, group_id: int) -> None:
        group = selectors.get_group_by_id(group_id)
        if group is None:
            raise SubjectGroupNotFoundError()
        self._assert_can_delete(group_id)
        SubjectGroupSubjects.objects.filter(subject_group_id=group_id).delete()
        SubjectGroupClassSections.objects.filter(subject_group_id=group_id).delete()
        group.delete()
        logger.info("Subject group id=%s deleted.", group_id)

    def sync_subjects(self, group_id: int, subject_ids: list[int]) -> dict[str, Any]:
        group = selectors.get_group_by_id(group_id)
        if group is None:
            raise SubjectGroupNotFoundError()

        subject_ids = list({int(sid) for sid in subject_ids})
        if subject_ids:
            valid = Subjects.objects.filter(id__in=subject_ids, is_active="yes").count()
            if valid != len(subject_ids):
                raise SubjectGroupValidationError(
                    "One or more subject IDs are invalid or inactive."
                )

        existing = SubjectGroupSubjects.objects.filter(subject_group_id=group_id)
        existing_ids = {r.subject_id for r in existing if r.subject_id}

        for sid in subject_ids:
            if sid not in existing_ids:
                SubjectGroupSubjects.objects.create(
                    subject_group_id=group_id,
                    session_id=group.session_id,
                    subject_id=sid,
                    created_at=selectors.now_datetime(),
                )

        for sid in existing_ids - set(subject_ids):
            SubjectGroupSubjects.objects.filter(
                subject_group_id=group_id, subject_id=sid
            ).delete()

        return selectors.group_detail_dict(group)

    def sync_class_sections(
        self, group_id: int, class_section_ids: list[int]
    ) -> dict[str, Any]:
        group = selectors.get_group_by_id(group_id)
        if group is None:
            raise SubjectGroupNotFoundError()

        class_section_ids = list({int(cid) for cid in class_section_ids})
        if class_section_ids:
            valid = ClassSections.objects.filter(
                id__in=class_section_ids, is_active="yes"
            ).count()
            if valid != len(class_section_ids):
                raise SubjectGroupValidationError(
                    "One or more class-section IDs are invalid or inactive."
                )

        existing = SubjectGroupClassSections.objects.filter(subject_group_id=group_id)
        mapping_dict = {m.class_section_id: m for m in existing}

        for cs_id in class_section_ids:
            if cs_id in mapping_dict:
                row = mapping_dict[cs_id]
                if row.is_active != 1:
                    row.is_active = 1
                    row.updated_at = selectors.today_date()
                    row.save(update_fields=["is_active", "updated_at"])
            else:
                SubjectGroupClassSections.objects.create(
                    subject_group_id=group_id,
                    class_section_id=cs_id,
                    session_id=group.session_id,
                    is_active=1,
                    description=None,
                    created_at=selectors.now_datetime(),
                    updated_at=None,
                )

        for cs_id, row in mapping_dict.items():
            if cs_id not in class_section_ids and row.is_active != 0:
                row.is_active = 0
                row.updated_at = selectors.today_date()
                row.save(update_fields=["is_active", "updated_at"])

        return selectors.group_detail_dict(group)

    def _assert_can_delete(self, group_id: int) -> None:
        if subject_group_is_in_use(group_id):
            raise SubjectGroupInUseError(
                "Cannot delete subject group. Active students or timetable "
                "entries reference this group."
            )

    @staticmethod
    def _normalize_name(raw) -> str:
        name = str(raw or "").strip()
        if not name:
            raise SubjectGroupValidationError("Group name is required.")
        if len(name) > 250:
            raise SubjectGroupValidationError(
                "Group name must be at most 250 characters."
            )
        return name

    @staticmethod
    def _normalize_description(raw) -> str | None:
        if raw is None:
            return None
        text = str(raw).strip()
        return text or None

    @staticmethod
    def _require_session_id(value) -> int:
        if value is None or value == "":
            raise SubjectGroupValidationError("session_id is required.")
        try:
            return int(value)
        except (TypeError, ValueError) as exc:
            raise SubjectGroupValidationError("session_id must be an integer.") from exc

    @staticmethod
    def _ensure_session_exists(session_id: int) -> None:
        if not Sessions.objects.filter(pk=session_id).exists():
            raise SubjectGroupNotFoundError("Academic session not found.")

    @staticmethod
    def _ensure_unique_name(
        name: str, session_id: int, exclude_id: int | None = None
    ) -> None:
        qs = SubjectGroups.objects.filter(session_id=session_id, name__iexact=name)
        if exclude_id is not None:
            qs = qs.exclude(pk=exclude_id)
        if qs.exists():
            raise SubjectGroupValidationError(
                f"Subject group '{name}' already exists for this session."
            )
