import logging
from typing import Any

from django.db import transaction

from apps.academics.models import Classes, Sections, Sessions
from apps.examinations.domain.examination_exceptions import (
    ExaminationNotFoundError,
    ExaminationValidationError,
)
from apps.examinations.models.exam_group_class_batch_exam_students import (
    ExamGroupClassBatchExamStudents,
)
from apps.examinations.models.exam_group_students import ExamGroupStudents
from apps.examinations.selectors import examination_selectors as selectors
from apps.students.models.student_session import StudentSession
from apps.students.selectors import promotion_selectors
from apps.students.selectors import student_selectors as student_sel

logger = logging.getLogger(__name__)


class ExamEnrollmentService:
    def get_roster(
        self, exam_id: int, class_id: int, section_id: int
    ) -> dict[str, Any]:
        exam = self._require_exam(exam_id)
        if not exam.session_id:
            raise ExaminationValidationError("Exam has no academic session.")

        if not student_sel.class_section_mapping_active(class_id, section_id):
            raise ExaminationValidationError(
                "Class and section are not assigned to each other."
            )

        school_class = Classes.objects.filter(id=class_id, is_active="yes").first()
        section = Sections.objects.filter(id=section_id, is_active="yes").first()
        if not school_class or not section:
            raise ExaminationValidationError("Class or section not found.")

        session_enrollments = promotion_selectors.list_source_enrollments(
            exam.session_id, class_id, section_id
        )
        student_ids = [row.student_id for row in session_enrollments if row.student_id]
        student_map = promotion_selectors.students_by_ids(student_ids)

        session_ids = [row.id for row in session_enrollments]
        enrollment_map = {
            row.student_session_id: row
            for row in ExamGroupClassBatchExamStudents.objects.filter(
                exam_group_class_batch_exam_id=exam_id,
                student_session_id__in=session_ids,
                is_active=1,
            )
        }

        students: list[dict[str, Any]] = []
        for session_row in session_enrollments:
            student = student_map.get(session_row.student_id)
            if not student or student.is_active != "yes":
                continue

            enrollment = enrollment_map.get(session_row.id)
            roll_no = (
                enrollment.roll_no
                if enrollment and enrollment.roll_no is not None
                else student.roll_no
            )
            students.append(
                {
                    "student_id": student.id,
                    "student_session_id": session_row.id,
                    "admission_no": student.admission_no,
                    "roll_no": roll_no,
                    "full_name": student_sel.format_student_name(
                        student.firstname, student.middlename, student.lastname
                    ),
                    "is_enrolled": enrollment is not None,
                    "enrollment_id": enrollment.id if enrollment else None,
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

        session = Sessions.objects.filter(id=exam.session_id).first()
        session_name = session.session if session else None

        return {
            "exam_id": exam.id,
            "exam_name": exam.exam,
            "exam_group_id": exam.exam_group_id,
            "session_id": exam.session_id,
            "session_name": session_name,
            "class_id": class_id,
            "class_name": school_class.class_field,
            "section_id": section_id,
            "section_name": section.section,
            "students": students,
        }

    def enroll(self, *, exam_id: int, student_session_ids: list[int]) -> dict[str, Any]:
        if not student_session_ids:
            raise ExaminationValidationError("Select at least one student.")

        exam = self._require_exam(exam_id)
        if not exam.session_id:
            raise ExaminationValidationError("Exam has no academic session.")

        unique_ids = sorted({int(sid) for sid in student_session_ids})
        session_rows = list(
            StudentSession.objects.filter(
                id__in=unique_ids,
                session_id=exam.session_id,
                is_active="yes",
            )
        )
        if len(session_rows) != len(unique_ids):
            raise ExaminationValidationError(
                "One or more selected students are not enrolled in the exam session."
            )

        student_ids = [row.student_id for row in session_rows if row.student_id]
        student_map = promotion_selectors.students_by_ids(student_ids)

        existing = {
            row.student_session_id: row
            for row in ExamGroupClassBatchExamStudents.objects.filter(
                exam_group_class_batch_exam_id=exam.id,
                student_session_id__in=unique_ids,
            )
        }

        created_count = 0
        reactivated_count = 0
        skipped_count = 0

        with transaction.atomic():
            for session_row in session_rows:
                student = student_map.get(session_row.student_id)
                roll_no = None
                if student and student.roll_no is not None:
                    try:
                        roll_no = int(student.roll_no)
                    except (TypeError, ValueError):
                        roll_no = None

                self._ensure_group_student(
                    exam_group_id=exam.exam_group_id,
                    student_id=session_row.student_id,
                    student_session_id=session_row.id,
                )

                current = existing.get(session_row.id)
                if current is not None and current.is_active == 1:
                    skipped_count += 1
                    continue

                if current is not None:
                    current.is_active = 1
                    current.roll_no = (
                        roll_no if roll_no is not None else current.roll_no
                    )
                    current.updated_at = selectors.today_date()
                    current.save(update_fields=["is_active", "roll_no", "updated_at"])
                    reactivated_count += 1
                    continue

                ExamGroupClassBatchExamStudents.objects.create(
                    exam_group_class_batch_exam_id=exam.id,
                    student_id=session_row.student_id,
                    student_session_id=session_row.id,
                    roll_no=roll_no,
                    teacher_remark=None,
                    rank=0,
                    is_active=1,
                    created_at=selectors.now_datetime(),
                    updated_at=selectors.today_date(),
                )
                created_count += 1

        logger.info(
            "Enrolled exam_id=%s created=%s reactivated=%s skipped=%s",
            exam.id,
            created_count,
            reactivated_count,
            skipped_count,
        )
        return {
            "exam_id": exam.id,
            "enrolled_count": created_count + reactivated_count,
            "created_count": created_count,
            "reactivated_count": reactivated_count,
            "skipped_count": skipped_count,
        }

    def unenroll(self, enrollment_id: int) -> None:
        enrollment = ExamGroupClassBatchExamStudents.objects.filter(
            id=enrollment_id
        ).first()
        if enrollment is None or enrollment.is_active != 1:
            raise ExaminationNotFoundError("Exam enrollment not found.")

        enrollment.is_active = 0
        enrollment.updated_at = selectors.today_date()
        enrollment.save(update_fields=["is_active", "updated_at"])
        logger.info("Unenrolled exam student id=%s", enrollment_id)

    def _require_exam(self, exam_id: int):
        exam = selectors.get_exam(exam_id)
        if exam is None:
            raise ExaminationNotFoundError("Exam not found.")
        if exam.is_active != 1:
            raise ExaminationValidationError("Selected exam is not active.")
        return exam

    def _ensure_group_student(
        self,
        *,
        exam_group_id: int | None,
        student_id: int,
        student_session_id: int,
    ) -> int | None:
        if not exam_group_id:
            return None

        existing = ExamGroupStudents.objects.filter(
            exam_group_id=exam_group_id,
            student_session_id=student_session_id,
        ).first()
        if existing is not None:
            if existing.is_active != 1:
                existing.is_active = 1
                existing.updated_at = selectors.today_date()
                existing.save(update_fields=["is_active", "updated_at"])
            return existing.id

        created = ExamGroupStudents.objects.create(
            exam_group_id=exam_group_id,
            student_id=student_id,
            student_session_id=student_session_id,
            is_active=1,
            created_at=selectors.now_datetime(),
            updated_at=selectors.today_date(),
        )
        return created.id
