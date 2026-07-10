import datetime
from typing import Any

from django.utils import timezone

from apps.academics.models import (
    Classes,
    ClassSections,
    Sections,
    SubjectGroupClassSections,
    SubjectGroupSubjects,
    Subjects,
    SubjectTimetable,
)
from apps.staff.models import Staff

VALID_DAYS = (
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
)


def legacy_time_display(value: datetime.time) -> str:
    return value.strftime("%I:%M %p")


def parse_time_value(raw) -> datetime.time:
    if isinstance(raw, datetime.time):
        return raw
    text = str(raw or "").strip()
    if not text:
        raise ValueError("Time is required.")
    for fmt in ("%H:%M:%S", "%H:%M"):
        try:
            return datetime.datetime.strptime(text, fmt).time()
        except ValueError:
            continue
    raise ValueError(f"Invalid time format: {text}")


def time_to_minutes(value: datetime.time) -> int:
    return value.hour * 60 + value.minute


def get_period_by_id(period_id: int) -> SubjectTimetable | None:
    try:
        return SubjectTimetable.objects.get(pk=period_id)
    except SubjectTimetable.DoesNotExist:
        return None


def list_periods(session_id: int, class_id: int, section_id: int):
    return SubjectTimetable.objects.filter(
        session_id=session_id, class_id=class_id, section_id=section_id
    ).order_by("day", "start_time", "id")


def list_periods_for_staff(session_id: int, staff_id: int):
    return SubjectTimetable.objects.filter(
        session_id=session_id, staff_id=staff_id
    ).order_by("day", "start_time", "id")


def get_active_class_section(class_id: int, section_id: int) -> ClassSections | None:
    return ClassSections.objects.filter(
        class_id=class_id, section_id=section_id, is_active="yes"
    ).first()


def period_to_dict(period: SubjectTimetable) -> dict[str, Any]:
    class_name = None
    section_name = None
    if period.class_id:
        class_obj = Classes.objects.filter(id=period.class_id).first()
        class_name = class_obj.class_field if class_obj else None
    if period.section_id:
        section_obj = Sections.objects.filter(id=period.section_id).first()
        section_name = section_obj.section if section_obj else None

    subject_id = None
    subject_name = None
    subject_code = None
    if period.subject_group_subject_id:
        sgs = SubjectGroupSubjects.objects.filter(
            id=period.subject_group_subject_id
        ).first()
        if sgs and sgs.subject_id:
            subject_id = sgs.subject_id
            subj = Subjects.objects.filter(id=sgs.subject_id).first()
            if subj:
                subject_name = subj.name
                subject_code = subj.code

    staff_name = None
    if period.staff_id:
        staff = Staff.objects.filter(id=period.staff_id).first()
        if staff:
            staff_name = f"{staff.name} {staff.surname}".strip()

    start = period.start_time
    end = period.end_time
    return {
        "id": period.id,
        "session_id": period.session_id,
        "class_id": period.class_id,
        "section_id": period.section_id,
        "class_name": class_name,
        "section_name": section_name,
        "subject_group_id": period.subject_group_id,
        "subject_group_subject_id": period.subject_group_subject_id,
        "subject_id": subject_id,
        "subject_name": subject_name,
        "subject_code": subject_code,
        "staff_id": period.staff_id,
        "staff_name": staff_name,
        "day": period.day,
        "start_time": start.strftime("%H:%M:%S") if start else None,
        "end_time": end.strftime("%H:%M:%S") if end else None,
        "time_from": period.time_from,
        "time_to": period.time_to,
        "room_no": period.room_no,
        "created_at": (
            period.created_at.strftime("%Y-%m-%d %H:%M:%S")
            if period.created_at
            else None
        ),
    }


def subject_options_for_class_section(
    session_id: int, class_id: int, section_id: int
) -> list[dict[str, Any]]:
    class_section = get_active_class_section(class_id, section_id)
    if class_section is None:
        return []

    group_links = SubjectGroupClassSections.objects.filter(
        session_id=session_id,
        class_section_id=class_section.id,
        is_active=1,
    )
    group_ids = [link.subject_group_id for link in group_links if link.subject_group_id]
    if not group_ids:
        return []

    rows = SubjectGroupSubjects.objects.filter(
        session_id=session_id, subject_group_id__in=group_ids
    )
    subject_ids = {r.subject_id for r in rows if r.subject_id}
    subjects = {s.id: s for s in Subjects.objects.filter(id__in=subject_ids)}

    options: list[dict[str, Any]] = []
    for row in rows:
        subj = subjects.get(row.subject_id)
        if not subj:
            continue
        options.append(
            {
                "subject_group_subject_id": row.id,
                "subject_group_id": row.subject_group_id,
                "subject_id": subj.id,
                "subject_name": subj.name,
                "subject_code": subj.code,
                "subject_type": subj.type,
            }
        )
    options.sort(key=lambda o: (o["subject_name"] or "", o["subject_group_subject_id"]))
    return options


def now_datetime():
    return timezone.now()
