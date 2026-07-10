"""Check whether an academic session is referenced by legacy child tables."""

from django.apps import apps

# (user-facing label, app_label, model_name, field_name)
SESSION_DEPENDENCY_CHECKS: list[tuple[str, str, str, str]] = [
    (
        "Students are enrolled in this session",
        "students",
        "StudentSession",
        "session_id",
    ),
    ("Fee session groups exist", "fees", "FeeSessionGroups", "session_id"),
    ("Fee masters exist", "fees", "Feemasters", "session_id"),
    ("Fee discounts exist", "fees", "FeesDiscounts", "session_id"),
    ("Exam schedules exist", "examinations", "ExamSchedules", "session_id"),
    ("Exam groups exist", "examinations", "ExamGroupClassBatchExams", "session_id"),
    ("Homework exists", "academics", "Homework", "session_id"),
    ("Subject groups exist", "academics", "SubjectGroups", "session_id"),
    ("Class teachers assigned", "academics", "ClassTeacher", "session_id"),
    ("Timetable entries exist", "academics", "SubjectTimetable", "session_id"),
    ("Alumni events exist", "alumni", "AlumniEvents", "session_id"),
    ("Transport fee masters exist", "transport", "TransportFeemaster", "session_id"),
]


def find_session_dependencies(session_id: int) -> list[str]:
    """Return human-readable reasons blocking delete."""
    blockers: list[str] = []
    for label, app_label, model_name, field_name in SESSION_DEPENDENCY_CHECKS:
        try:
            model = apps.get_model(app_label, model_name)
        except LookupError:
            continue
        if model.objects.filter(**{field_name: session_id}).exists():
            blockers.append(label)
    return blockers


def is_session_in_use(session_id: int) -> bool:
    return bool(find_session_dependencies(session_id))
