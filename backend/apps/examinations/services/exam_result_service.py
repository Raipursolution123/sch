import logging
from typing import Any

from django.db import transaction

from apps.academics.models.subjects import Subjects
from apps.examinations.domain.examination_exceptions import (
    ExaminationNotFoundError,
    ExaminationValidationError,
)
from apps.examinations.models.exam_group_class_batch_exam_students import (
    ExamGroupClassBatchExamStudents,
)
from apps.examinations.models.exam_group_exam_results import ExamGroupExamResults
from apps.examinations.models.exam_group_students import ExamGroupStudents
from apps.examinations.selectors import examination_selectors as selectors
from apps.students.selectors import promotion_selectors
from apps.students.selectors import student_selectors as student_sel

logger = logging.getLogger(__name__)

ALLOWED_ATTENDENCE = {"present", "absent"}


class ExamResultService:
    def get_roster(self, exam_id: int, schedule_id: int) -> dict[str, Any]:
        exam = selectors.get_exam(exam_id)
        if exam is None:
            raise ExaminationNotFoundError("Exam not found.")

        schedule = selectors.get_schedule(schedule_id)
        if schedule is None:
            raise ExaminationNotFoundError("Exam schedule not found.")
        if schedule.exam_group_class_batch_exams_id != exam_id:
            raise ExaminationValidationError(
                "Selected schedule does not belong to this exam."
            )

        enrollments = list(
            ExamGroupClassBatchExamStudents.objects.filter(
                exam_group_class_batch_exam_id=exam_id,
                is_active=1,
            ).order_by("roll_no", "id")
        )
        student_ids = [row.student_id for row in enrollments if row.student_id]
        student_map = promotion_selectors.students_by_ids(student_ids)

        group_student_map = {
            row.student_session_id: row.id
            for row in ExamGroupStudents.objects.filter(
                exam_group_id=exam.exam_group_id,
                student_session_id__in=[
                    row.student_session_id
                    for row in enrollments
                    if row.student_session_id
                ],
            )
        }

        enrollment_ids = [row.id for row in enrollments]
        result_map = {
            row.exam_group_class_batch_exam_student_id: row
            for row in ExamGroupExamResults.objects.filter(
                exam_group_class_batch_exam_subject_id=schedule_id,
                exam_group_class_batch_exam_student_id__in=enrollment_ids,
                is_active=1,
            )
        }

        subject = (
            Subjects.objects.filter(id=schedule.subject_id).first()
            if schedule.subject_id
            else None
        )

        students: list[dict[str, Any]] = []
        for enrollment in enrollments:
            student = student_map.get(enrollment.student_id)
            if not student or getattr(student, "is_active", "yes") != "yes":
                continue

            result = result_map.get(enrollment.id)
            students.append(
                {
                    "exam_group_class_batch_exam_student_id": enrollment.id,
                    "exam_group_student_id": group_student_map.get(
                        enrollment.student_session_id
                    ),
                    "student_id": student.id,
                    "student_session_id": enrollment.student_session_id,
                    "admission_no": student.admission_no,
                    "roll_no": (
                        enrollment.roll_no
                        if enrollment.roll_no is not None
                        else student.roll_no
                    ),
                    "full_name": student_sel.format_student_name(
                        student.firstname, student.middlename, student.lastname
                    ),
                    "result_id": result.id if result else None,
                    "get_marks": (
                        float(result.get_marks)
                        if result and result.get_marks is not None
                        else 0.0
                    ),
                    "attendence": result.attendence if result else "present",
                    "note": result.note if result else None,
                }
            )

        students.sort(
            key=lambda row: (
                (
                    int(row["roll_no"])
                    if row["roll_no"] is not None and str(row["roll_no"]).isdigit()
                    else 9999
                ),
                row["full_name"].lower(),
            )
        )

        return {
            "exam_id": exam.id,
            "exam_name": exam.exam,
            "exam_group_id": exam.exam_group_id,
            "session_id": exam.session_id,
            "schedule_id": schedule.id,
            "subject_id": schedule.subject_id,
            "subject_name": subject.name if subject else None,
            "full_marks": schedule.max_marks,
            "passing_marks": schedule.min_marks,
            "students": students,
        }

    def save_results(self, payload: dict[str, Any]) -> dict[str, Any]:
        exam_id = payload.get("exam_id")
        schedule_id = payload.get(
            "exam_group_class_batch_exam_subject_id"
        ) or payload.get("schedule_id")
        entries = payload.get("entries") or []

        if not exam_id:
            raise ExaminationValidationError("Exam is required.")
        if not schedule_id:
            raise ExaminationValidationError("Exam schedule is required.")
        if not isinstance(entries, list) or not entries:
            raise ExaminationValidationError("At least one result entry is required.")

        exam = selectors.get_exam(int(exam_id))
        if exam is None:
            raise ExaminationNotFoundError("Exam not found.")

        schedule = selectors.get_schedule(int(schedule_id))
        if schedule is None:
            raise ExaminationNotFoundError("Exam schedule not found.")
        if schedule.exam_group_class_batch_exams_id != int(exam_id):
            raise ExaminationValidationError(
                "Selected schedule does not belong to this exam."
            )

        enrollment_ids = [
            int(entry.get("exam_group_class_batch_exam_student_id"))
            for entry in entries
            if entry.get("exam_group_class_batch_exam_student_id") is not None
        ]
        if len(enrollment_ids) != len(entries):
            raise ExaminationValidationError(
                "Each entry requires exam_group_class_batch_exam_student_id."
            )

        enrollments = {
            row.id: row
            for row in ExamGroupClassBatchExamStudents.objects.filter(
                id__in=enrollment_ids,
                exam_group_class_batch_exam_id=exam_id,
                is_active=1,
            )
        }
        if len(enrollments) != len(set(enrollment_ids)):
            raise ExaminationValidationError(
                "One or more students are not enrolled in this exam."
            )

        max_marks = schedule.max_marks
        cleaned_entries: list[dict[str, Any]] = []
        for entry in entries:
            enrollment_id = int(entry["exam_group_class_batch_exam_student_id"])
            marks = self._parse_marks(entry.get("get_marks"), max_marks)
            attendence = self._parse_attendence(entry.get("attendence"))
            note = entry.get("note")
            note_value = str(note).strip() if note not in (None, "") else None

            exam_group_student_id = entry.get("exam_group_student_id")
            if exam_group_student_id in (None, ""):
                exam_group_student_id = None
            else:
                exam_group_student_id = int(exam_group_student_id)

            cleaned_entries.append(
                {
                    "enrollment_id": enrollment_id,
                    "exam_group_student_id": exam_group_student_id,
                    "marks": marks,
                    "attendence": attendence,
                    "note": note_value,
                }
            )

        saved_count = 0
        with transaction.atomic():
            for entry in cleaned_entries:
                enrollment_id = entry["enrollment_id"]
                existing = ExamGroupExamResults.objects.filter(
                    exam_group_class_batch_exam_student_id=enrollment_id,
                    exam_group_class_batch_exam_subject_id=schedule.id,
                ).first()

                if existing is None:
                    ExamGroupExamResults.objects.create(
                        exam_group_class_batch_exam_student_id=enrollment_id,
                        exam_group_class_batch_exam_subject_id=schedule.id,
                        exam_group_student_id=entry["exam_group_student_id"],
                        attendence=entry["attendence"],
                        get_marks=entry["marks"],
                        note=entry["note"],
                        is_active=1,
                        created_at=selectors.now_datetime(),
                        updated_at=selectors.today_date(),
                    )
                else:
                    if entry["exam_group_student_id"] is not None:
                        existing.exam_group_student_id = entry["exam_group_student_id"]
                    existing.attendence = entry["attendence"]
                    existing.get_marks = entry["marks"]
                    existing.note = entry["note"]
                    existing.is_active = 1
                    existing.updated_at = selectors.today_date()
                    existing.save()
                saved_count += 1

        logger.info(
            "Saved exam results exam_id=%s schedule_id=%s count=%s",
            exam_id,
            schedule.id,
            saved_count,
        )
        return {
            "exam_id": exam.id,
            "schedule_id": schedule.id,
            "saved_count": saved_count,
        }

    def _parse_marks(self, value: Any, max_marks: float | None) -> float:
        if value in (None, ""):
            raise ExaminationValidationError("Marks are required for each student.")
        try:
            marks = float(value)
        except (TypeError, ValueError) as exc:
            raise ExaminationValidationError("Marks must be a number.") from exc
        if marks < 0:
            raise ExaminationValidationError("Marks cannot be negative.")
        if max_marks is not None and marks > float(max_marks):
            raise ExaminationValidationError(
                f"Marks cannot exceed full marks ({max_marks})."
            )
        return marks

    def _parse_attendence(self, value: Any) -> str:
        if value in (None, ""):
            return "present"
        attendence = str(value).strip().lower()
        if attendence not in ALLOWED_ATTENDENCE:
            raise ExaminationValidationError(
                "Attendance must be 'present' or 'absent'."
            )
        return attendence
