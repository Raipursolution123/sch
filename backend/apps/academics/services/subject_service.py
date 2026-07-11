import logging
from typing import Any

from apps.academics.checks.subject_dependencies import subject_is_in_use
from apps.academics.domain.subject_exceptions import (
    SubjectInUseError,
    SubjectNotFoundError,
    SubjectValidationError,
)
from apps.academics.models import Classes, Subjects
from apps.academics.selectors import subject_selectors as selectors

logger = logging.getLogger(__name__)


class SubjectService:
    def list_subjects(self, active_only: bool = False):
        return selectors.list_subjects(active_only=active_only)

    def get_subject(self, subject_id: int) -> dict[str, Any]:
        subject = selectors.get_subject_by_id(subject_id)
        if subject is None:
            raise SubjectNotFoundError()
        return selectors.subject_to_dict(subject)

    def create_subject(self, payload: dict[str, Any]) -> dict[str, Any]:
        name = self._normalize_name(payload.get("name"))
        code = self._normalize_code(payload.get("code"))
        subject_type = self._normalize_type(payload.get("type"))
        linked_class = self._normalize_linked_class(payload)
        is_active = self._normalize_active(payload.get("is_active", "yes"))

        subject = Subjects.objects.create(
            name=name,
            code=code,
            type=subject_type,
            linked_class=linked_class,
            is_active=is_active,
            created_at=selectors.now_datetime(),
            updated_at=None,
        )
        logger.info("Subject '%s' created (id=%s).", name, subject.id)
        return selectors.subject_to_dict(subject)

    def update_subject(
        self, subject_id: int, payload: dict[str, Any]
    ) -> dict[str, Any]:
        subject = selectors.get_subject_by_id(subject_id)
        if subject is None:
            raise SubjectNotFoundError()

        update_fields: list[str] = []

        if "name" in payload:
            subject.name = self._normalize_name(payload["name"])
            update_fields.append("name")

        if "code" in payload:
            code = self._normalize_code(payload["code"])
            subject.code = code
            update_fields.append("code")

        if "type" in payload:
            subject.type = self._normalize_type(payload["type"])
            update_fields.append("type")

        if "linked_class_ids" in payload or "linked_class" in payload:
            subject.linked_class = self._normalize_linked_class(payload)
            update_fields.append("linked_class")

        if "is_active" in payload:
            flag = self._normalize_active(payload["is_active"])
            if flag == "no":
                self._assert_can_deactivate(subject_id)
            subject.is_active = flag
            update_fields.append("is_active")

        if not update_fields:
            raise SubjectValidationError("No updatable fields provided.")

        subject.updated_at = selectors.today_date()
        update_fields.append("updated_at")
        subject.save(update_fields=update_fields)
        return selectors.subject_to_dict(subject)

    def deactivate_subject(self, subject_id: int) -> None:
        subject = selectors.get_subject_by_id(subject_id)
        if subject is None:
            raise SubjectNotFoundError()
        self._assert_can_deactivate(subject_id)
        subject.is_active = "no"
        subject.updated_at = selectors.today_date()
        subject.save(update_fields=["is_active", "updated_at"])
        logger.info("Subject id=%s deactivated.", subject_id)

    def _assert_can_deactivate(self, subject_id: int) -> None:
        if subject_is_in_use(subject_id):
            raise SubjectInUseError(
                "Cannot deactivate subject. It is referenced by subject groups, "
                "homework, or timetable entries."
            )

    @staticmethod
    def _normalize_name(raw) -> str:
        name = str(raw or "").strip()
        if not name:
            raise SubjectValidationError("Subject name is required.")
        if len(name) > 100:
            raise SubjectValidationError("Subject name must be at most 100 characters.")
        return name

    @staticmethod
    def _normalize_code(raw) -> str:
        code = str(raw or "").strip().upper()
        if not code:
            raise SubjectValidationError("Subject code is required.")
        if len(code) > 100:
            raise SubjectValidationError("Subject code must be at most 100 characters.")
        return code

    @staticmethod
    def _normalize_type(raw) -> str:
        value = str(raw or "").strip().lower()
        if value not in selectors.ALLOWED_SUBJECT_TYPES:
            raise SubjectValidationError("type must be 'theory' or 'practical'.")
        return value

    @staticmethod
    def _normalize_active(value) -> str:
        flag = str(value).lower()
        if flag not in {"yes", "no"}:
            raise SubjectValidationError("is_active must be 'yes' or 'no'.")
        return flag

    @staticmethod
    def _normalize_linked_class(payload: dict[str, Any]) -> str | None:
        if "linked_class_ids" in payload:
            raw_ids = payload.get("linked_class_ids") or []
            if not isinstance(raw_ids, list):
                raise SubjectValidationError("linked_class_ids must be a list.")
            try:
                ids = [int(x) for x in raw_ids]
            except (TypeError, ValueError) as exc:
                raise SubjectValidationError(
                    "linked_class_ids must contain valid integers."
                ) from exc
            ids = [i for i in ids if i > 0]
            if ids:
                valid = Classes.objects.filter(id__in=ids).count()
                if valid != len(set(ids)):
                    raise SubjectValidationError(
                        "One or more linked class IDs are invalid."
                    )
            return selectors.format_linked_class(ids)

        if "linked_class" in payload:
            raw = payload.get("linked_class")
            if raw in (None, ""):
                return None
            ids = selectors.parse_linked_class_ids(str(raw))
            if ids:
                valid = Classes.objects.filter(id__in=ids).count()
                if valid != len(ids):
                    raise SubjectValidationError(
                        "One or more linked class IDs are invalid."
                    )
            return selectors.format_linked_class(ids)

        return None
