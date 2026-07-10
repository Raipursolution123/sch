"""Dependency checks for subject timetable periods."""

from apps.students.models import StudentSubjectAttendances


def has_attendance_for_period(period_id: int) -> bool:
    return StudentSubjectAttendances.objects.filter(
        subject_timetable_id=period_id
    ).exists()
