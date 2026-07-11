"""Dependency checks for subjects."""

from apps.academics.models import Homework, SubjectGroupSubjects, SubjectTimetable


def has_subject_group_reference(subject_id: int) -> bool:
    return SubjectGroupSubjects.objects.filter(subject_id=subject_id).exists()


def has_homework_reference(subject_id: int) -> bool:
    return Homework.objects.filter(subject_id=subject_id).exists()


def has_timetable_reference(subject_id: int) -> bool:
    group_subject_ids = SubjectGroupSubjects.objects.filter(
        subject_id=subject_id
    ).values_list("id", flat=True)
    if not group_subject_ids:
        return False
    return SubjectTimetable.objects.filter(
        subject_group_subject_id__in=list(group_subject_ids)
    ).exists()


def subject_is_in_use(subject_id: int) -> bool:
    return (
        has_subject_group_reference(subject_id)
        or has_homework_reference(subject_id)
        or has_timetable_reference(subject_id)
    )
