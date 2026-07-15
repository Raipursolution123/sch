from typing import Any

from django.utils import timezone

from apps.examinations.models.exam_group_class_batch_exam_subjects import (
    ExamGroupClassBatchExamSubjects,
)
from apps.examinations.models.exam_group_class_batch_exams import (
    ExamGroupClassBatchExams,
)
from apps.examinations.models.exam_groups import ExamGroups


def now_datetime():
    return timezone.now()


def today_date():
    return timezone.now().date()


def safe_date_str(value, fmt="%Y-%m-%d"):
    if value is None:
        return None
    if isinstance(value, str):
        return value
    try:
        return value.strftime(fmt)
    except Exception:
        return str(value)


def parse_is_active(value, *, default: int = 1) -> int:
    if value is None:
        return default
    if isinstance(value, str):
        return 1 if value.lower() == "yes" else 0
    return 1 if value else 0


def active_flag(value: int | None) -> str:
    return "yes" if value == 1 else "no"


def format_time(value) -> str | None:
    if isinstance(value, str):
        return value[:5] if value else None
    if value:
        return value.strftime("%H:%M")
    return None


def exam_group_to_dict(group: ExamGroups) -> dict[str, Any]:
    return {
        "id": group.id,
        "name": group.name,
        "exam_type": group.exam_type,
        "description": group.description,
        "is_active": active_flag(group.is_active),
        "created_at": safe_date_str(group.created_at, "%Y-%m-%dT%H:%M:%SZ"),
        "updated_at": safe_date_str(group.updated_at),
    }


def exam_to_dict(exam: ExamGroupClassBatchExams) -> dict[str, Any]:
    return {
        "id": exam.id,
        "name": exam.exam,
        "exam_group_id": exam.exam_group_id,
        "session_id": exam.session_id,
        "date_from": safe_date_str(exam.date_from),
        "date_to": safe_date_str(exam.date_to),
        "passing_percentage": exam.passing_percentage,
        "is_published": bool(exam.is_publish == 1),
        "is_active": active_flag(exam.is_active),
        "description": exam.description,
        "created_at": safe_date_str(exam.created_at, "%Y-%m-%dT%H:%M:%SZ"),
        "updated_at": safe_date_str(exam.updated_at),
    }


def schedule_to_dict(schedule: ExamGroupClassBatchExamSubjects) -> dict[str, Any]:
    parent_exam = ExamGroupClassBatchExams.objects.filter(
        id=schedule.exam_group_class_batch_exams_id
    ).first()
    session_id = parent_exam.session_id if parent_exam else None

    return {
        "id": schedule.id,
        "exam_id": schedule.exam_group_class_batch_exams_id,
        "subject_id": schedule.subject_id,
        "session_id": session_id,
        "date_of_exam": safe_date_str(schedule.date_from),
        "start_time": format_time(schedule.time_from),
        "end_time": schedule.duration,
        "room_no": schedule.room_no,
        "full_marks": schedule.max_marks,
        "passing_marks": schedule.min_marks,
        "note": None,
        "is_active": active_flag(schedule.is_active),
        "created_at": (
            safe_date_str(schedule.created_at, "%Y-%m-%dT%H:%M:%SZ")
            if schedule.created_at
            else None
        ),
        "updated_at": safe_date_str(schedule.updated_at),
    }


def get_exam_group(group_id: int) -> ExamGroups | None:
    return ExamGroups.objects.filter(id=group_id).first()


def get_exam(exam_id: int) -> ExamGroupClassBatchExams | None:
    return ExamGroupClassBatchExams.objects.filter(id=exam_id).first()


def get_schedule(schedule_id: int) -> ExamGroupClassBatchExamSubjects | None:
    return ExamGroupClassBatchExamSubjects.objects.filter(id=schedule_id).first()


def list_exam_groups():
    return ExamGroups.objects.all().order_by("-id")


def list_exams():
    return ExamGroupClassBatchExams.objects.all().order_by("-id")


def list_schedules():
    return ExamGroupClassBatchExamSubjects.objects.all().order_by("-id")
