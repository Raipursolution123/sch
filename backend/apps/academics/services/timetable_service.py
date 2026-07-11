import logging
from datetime import time
from typing import Any

from apps.academics.checks.timetable_dependencies import has_attendance_for_period
from apps.academics.domain.timetable_exceptions import (
    TimetableConflictError,
    TimetableInUseError,
    TimetableNotFoundError,
    TimetableValidationError,
)
from apps.academics.models import (
    ClassSections,
    SubjectGroupClassSections,
    SubjectGroupSubjects,
    SubjectTimetable,
)
from apps.academics.models.sessions import Sessions
from apps.academics.selectors import timetable_selectors as selectors
from apps.staff.models import Staff

logger = logging.getLogger(__name__)


class TimetableService:
    def list_periods(
        self, session_id: int, class_id: int, section_id: int
    ) -> list[dict[str, Any]]:
        self._require_grid_params(session_id, class_id, section_id)
        qs = selectors.list_periods(session_id, class_id, section_id)
        return [selectors.period_to_dict(p) for p in qs]

    def list_staff_periods(
        self, session_id: int, staff_id: int
    ) -> list[dict[str, Any]]:
        session_id = self._require_int(session_id, "session_id")
        staff_id = self._require_int(staff_id, "staff_id")
        self._ensure_session_exists(session_id)
        self._ensure_active_staff(staff_id)
        qs = selectors.list_periods_for_staff(session_id, staff_id)
        return [selectors.period_to_dict(p) for p in qs]

    def get_period(self, period_id: int) -> dict[str, Any]:
        period = selectors.get_period_by_id(period_id)
        if period is None:
            raise TimetableNotFoundError()
        return selectors.period_to_dict(period)

    def subject_options(
        self, session_id: int, class_id: int, section_id: int
    ) -> list[dict[str, Any]]:
        self._require_grid_params(session_id, class_id, section_id)
        return selectors.subject_options_for_class_section(
            session_id, class_id, section_id
        )

    def create_period(self, payload: dict[str, Any]) -> dict[str, Any]:
        session_id = self._require_int(payload.get("session_id"), "session_id")
        class_id = self._require_int(payload.get("class_id"), "class_id")
        section_id = self._require_int(payload.get("section_id"), "section_id")
        self._ensure_session_exists(session_id)
        self._ensure_active_class_section(class_id, section_id)

        sgs_id = self._require_int(
            payload.get("subject_group_subject_id"), "subject_group_subject_id"
        )
        subject_group_id = self._validate_subject_slot(
            session_id, class_id, section_id, sgs_id
        )

        staff_id = self._require_int(payload.get("staff_id"), "staff_id")
        self._ensure_active_staff(staff_id)

        day = self._normalize_day(payload.get("day"))
        start_time, end_time = self._parse_time_range(
            payload.get("start_time"), payload.get("end_time")
        )
        room_no = self._normalize_room(payload.get("room_no"))

        self._assert_no_class_conflict(
            session_id, class_id, section_id, day, start_time, end_time
        )
        self._assert_no_staff_conflict(session_id, staff_id, day, start_time, end_time)

        period = SubjectTimetable.objects.create(
            session_id=session_id,
            class_id=class_id,
            section_id=section_id,
            subject_group_id=subject_group_id,
            subject_group_subject_id=sgs_id,
            staff_id=staff_id,
            day=day,
            start_time=start_time,
            end_time=end_time,
            time_from=selectors.legacy_time_display(start_time),
            time_to=selectors.legacy_time_display(end_time),
            room_no=room_no,
            created_at=selectors.now_datetime(),
        )
        logger.info("Timetable period created (id=%s).", period.id)
        return selectors.period_to_dict(period)

    def update_period(self, period_id: int, payload: dict[str, Any]) -> dict[str, Any]:
        period = selectors.get_period_by_id(period_id)
        if period is None:
            raise TimetableNotFoundError()

        for field in ("session_id", "class_id", "section_id"):
            if field in payload and self._require_int(payload[field], field) != getattr(
                period, field
            ):
                raise TimetableValidationError(
                    f"{field} cannot be changed after creation."
                )

        session_id = period.session_id
        class_id = period.class_id
        section_id = period.section_id

        update_fields: list[str] = []

        sgs_id = period.subject_group_subject_id
        subject_group_id = period.subject_group_id
        if "subject_group_subject_id" in payload:
            sgs_id = self._require_int(
                payload["subject_group_subject_id"], "subject_group_subject_id"
            )
            subject_group_id = self._validate_subject_slot(
                session_id, class_id, section_id, sgs_id
            )
            period.subject_group_subject_id = sgs_id
            period.subject_group_id = subject_group_id
            update_fields.extend(["subject_group_subject_id", "subject_group_id"])

        if "staff_id" in payload:
            staff_id = self._require_int(payload["staff_id"], "staff_id")
            self._ensure_active_staff(staff_id)
            period.staff_id = staff_id
            update_fields.append("staff_id")

        day = period.day
        start_time = period.start_time
        end_time = period.end_time

        if "day" in payload:
            day = self._normalize_day(payload["day"])
            period.day = day
            update_fields.append("day")

        if "start_time" in payload or "end_time" in payload:
            start_raw = payload.get("start_time", period.start_time)
            end_raw = payload.get("end_time", period.end_time)
            start_time, end_time = self._parse_time_range(start_raw, end_raw)
            period.start_time = start_time
            period.end_time = end_time
            period.time_from = selectors.legacy_time_display(start_time)
            period.time_to = selectors.legacy_time_display(end_time)
            update_fields.extend(["start_time", "end_time", "time_from", "time_to"])

        if "room_no" in payload:
            period.room_no = self._normalize_room(payload["room_no"])
            update_fields.append("room_no")

        if not update_fields:
            raise TimetableValidationError("No updatable fields provided.")

        staff_id = period.staff_id
        self._assert_no_class_conflict(
            session_id,
            class_id,
            section_id,
            day,
            start_time,
            end_time,
            exclude_id=period_id,
        )
        self._assert_no_staff_conflict(
            session_id,
            staff_id,
            day,
            start_time,
            end_time,
            exclude_id=period_id,
        )

        period.save(update_fields=list(set(update_fields)))
        return selectors.period_to_dict(period)

    def delete_period(self, period_id: int) -> None:
        period = selectors.get_period_by_id(period_id)
        if period is None:
            raise TimetableNotFoundError()
        if has_attendance_for_period(period_id):
            raise TimetableInUseError(
                "Cannot delete period. Subject attendance records reference it."
            )
        period.delete()
        logger.info("Timetable period id=%s deleted.", period_id)

    def _validate_subject_slot(
        self, session_id: int, class_id: int, section_id: int, sgs_id: int
    ) -> int:
        sgs = SubjectGroupSubjects.objects.filter(id=sgs_id).first()
        if sgs is None:
            raise TimetableValidationError("Invalid subject_group_subject_id.")
        if sgs.session_id != session_id:
            raise TimetableValidationError(
                "Subject does not belong to the selected session."
            )

        class_section = selectors.get_active_class_section(class_id, section_id)
        if class_section is None:
            raise TimetableValidationError(
                "No active class-section mapping exists for this class and section."
            )

        linked = SubjectGroupClassSections.objects.filter(
            subject_group_id=sgs.subject_group_id,
            class_section_id=class_section.id,
            session_id=session_id,
            is_active=1,
        ).exists()
        if not linked:
            raise TimetableValidationError(
                "Subject is not assigned to this class-section via a subject group."
            )
        return sgs.subject_group_id

    def _assert_no_class_conflict(
        self,
        session_id: int,
        class_id: int,
        section_id: int,
        day: str,
        start: time,
        end: time,
        exclude_id: int | None = None,
    ) -> None:
        qs = SubjectTimetable.objects.filter(
            session_id=session_id,
            class_id=class_id,
            section_id=section_id,
            day=day,
        )
        if exclude_id is not None:
            qs = qs.exclude(pk=exclude_id)
        for other in qs:
            if (
                other.start_time
                and other.end_time
                and self._ranges_overlap(start, end, other.start_time, other.end_time)
            ):
                raise TimetableConflictError(
                    "This class-section already has a period overlapping that time."
                )

    def _assert_no_staff_conflict(
        self,
        session_id: int,
        staff_id: int,
        day: str,
        start: time,
        end: time,
        exclude_id: int | None = None,
    ) -> None:
        qs = SubjectTimetable.objects.filter(
            session_id=session_id, staff_id=staff_id, day=day
        )
        if exclude_id is not None:
            qs = qs.exclude(pk=exclude_id)
        for other in qs:
            if (
                other.start_time
                and other.end_time
                and self._ranges_overlap(start, end, other.start_time, other.end_time)
            ):
                raise TimetableConflictError(
                    "This teacher is already assigned to another class at that time."
                )

    @staticmethod
    def _ranges_overlap(s1: time, e1: time, s2: time, e2: time) -> bool:
        a1, b1 = selectors.time_to_minutes(s1), selectors.time_to_minutes(e1)
        a2, b2 = selectors.time_to_minutes(s2), selectors.time_to_minutes(e2)
        return a1 < b2 and a2 < b1

    @staticmethod
    def _require_grid_params(session_id, class_id, section_id) -> None:
        TimetableService._require_int(session_id, "session_id")
        TimetableService._require_int(class_id, "class_id")
        TimetableService._require_int(section_id, "section_id")

    @staticmethod
    def _require_int(value, field: str) -> int:
        if value is None or value == "":
            raise TimetableValidationError(f"{field} is required.")
        try:
            return int(value)
        except (TypeError, ValueError) as exc:
            raise TimetableValidationError(f"{field} must be an integer.") from exc

    @staticmethod
    def _ensure_session_exists(session_id: int) -> None:
        if not Sessions.objects.filter(pk=session_id).exists():
            raise TimetableNotFoundError("Academic session not found.")

    @staticmethod
    def _ensure_active_class_section(class_id: int, section_id: int) -> None:
        if not ClassSections.objects.filter(
            class_id=class_id, section_id=section_id, is_active="yes"
        ).exists():
            raise TimetableValidationError(
                "No active class-section mapping exists for this class and section."
            )

    @staticmethod
    def _ensure_active_staff(staff_id: int) -> None:
        staff = Staff.objects.filter(id=staff_id).first()
        if staff is None:
            raise TimetableValidationError("Staff member not found.")
        if staff.is_active not in (1, "1", True):
            raise TimetableValidationError("Staff member is not active.")

    @staticmethod
    def _normalize_day(raw) -> str:
        day = str(raw or "").strip()
        if day not in selectors.VALID_DAYS:
            raise TimetableValidationError(
                "day must be a valid weekday (Monday–Sunday)."
            )
        return day

    @staticmethod
    def _parse_time_range(start_raw, end_raw) -> tuple[time, time]:
        try:
            start = selectors.parse_time_value(start_raw)
            end = selectors.parse_time_value(end_raw)
        except ValueError as exc:
            raise TimetableValidationError(str(exc)) from exc
        if selectors.time_to_minutes(end) <= selectors.time_to_minutes(start):
            raise TimetableValidationError("end_time must be after start_time.")
        return start, end

    @staticmethod
    def _normalize_room(raw) -> str | None:
        if raw is None:
            return None
        text = str(raw).strip()
        if not text:
            return None
        if len(text) > 20:
            raise TimetableValidationError("room_no must be at most 20 characters.")
        return text
