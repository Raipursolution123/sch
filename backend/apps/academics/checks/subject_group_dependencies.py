"""Dependency checks for subject groups."""

from apps.academics.models import SubjectTimetable
from apps.students.models import StudentSession


def has_active_students_for_group(subject_group_id: int) -> bool:
    return StudentSession.objects.filter(
        subject_group_id=subject_group_id, is_active="yes"
    ).exists()


def has_timetable_for_group(subject_group_id: int) -> bool:
    return SubjectTimetable.objects.filter(subject_group_id=subject_group_id).exists()


def subject_group_is_in_use(subject_group_id: int) -> bool:
    return has_active_students_for_group(subject_group_id) or has_timetable_for_group(
        subject_group_id
    )
