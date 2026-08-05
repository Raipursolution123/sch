import logging
from typing import Any

from django.db import connection, transaction
from django.utils import timezone

from apps.academics.models.subjects import Subjects
from apps.examinations.domain.examination_exceptions import (
    ExaminationNotFoundError,
    ExaminationValidationError,
)
from apps.examinations.models.cbse_exam_assessment_types import CbseExamAssessmentTypes
from apps.examinations.models.cbse_exam_students import CbseExamStudents
from apps.examinations.models.cbse_exam_timetable import CbseExamTimetable
from apps.examinations.models.cbse_exam_timetable_assessment_types import (
    CbseExamTimetableAssessmentTypes,
)
from apps.examinations.models.cbse_exams import CbseExams
from apps.examinations.models.cbse_student_subject_marks import CbseStudentSubjectMarks
from apps.students.models.student_session import StudentSession
from apps.students.models.students import Students
from apps.students.selectors import student_selectors as student_sel

logger = logging.getLogger(__name__)


def _safe_float(value: Any, default: float = 0.0) -> float:
    try:
        if value is None or value == "":
            return default
        return float(value)
    except (TypeError, ValueError):
        return default


class CbseMarksService:
    def list_timetable(self, exam_id: int) -> list[dict[str, Any]]:
        exam = CbseExams.objects.filter(id=exam_id).first()
        if exam is None:
            raise ExaminationNotFoundError("CBSE exam not found.")

        rows = list(
            CbseExamTimetable.objects.filter(cbse_exam_id=exam_id).order_by("date", "id")
        )
        subject_ids = [r.subject_id for r in rows if r.subject_id]
        subjects = {
            s.id: s.name
            for s in Subjects.objects.filter(id__in=subject_ids)
        }

        timetable_ids = [r.id for r in rows]
        link_rows = list(
            CbseExamTimetableAssessmentTypes.objects.filter(
                cbse_exam_timetable_id__in=timetable_ids
            )
        )
        assessment_type_ids = [
            link.cbse_exam_assessment_type_id
            for link in link_rows
            if link.cbse_exam_assessment_type_id
        ]
        assessment_types = {
            row.id: row
            for row in CbseExamAssessmentTypes.objects.filter(id__in=assessment_type_ids)
        }

        links_by_timetable: dict[int, list[dict[str, Any]]] = {}
        for link in link_rows:
            assessment = assessment_types.get(link.cbse_exam_assessment_type_id)
            links_by_timetable.setdefault(link.cbse_exam_timetable_id or 0, []).append(
                {
                    "timetable_assessment_type_id": link.id,
                    "assessment_type_id": link.cbse_exam_assessment_type_id,
                    "assessment_name": assessment.name if assessment else None,
                    "assessment_code": assessment.code if assessment else None,
                    "maximum_marks": (
                        _safe_float(assessment.maximum_marks) if assessment else None
                    ),
                }
            )

        result: list[dict[str, Any]] = []
        for row in rows:
            assessments = links_by_timetable.get(row.id, [])
            max_marks = _safe_float(row.written_maximum_marks)
            if assessments:
                max_marks = sum(
                    a["maximum_marks"] or 0 for a in assessments
                ) or max_marks
            result.append(
                {
                    "id": row.id,
                    "cbse_exam_id": exam_id,
                    "subject_id": row.subject_id,
                    "subject_name": subjects.get(row.subject_id) if row.subject_id else None,
                    "date": row.date.isoformat() if row.date else None,
                    "room_no": row.room_no,
                    "written_maximum_marks": _safe_float(row.written_maximum_marks),
                    "maximum_marks": max_marks,
                    "assessments": assessments,
                }
            )
        return result

    def get_roster(
        self,
        exam_id: int,
        timetable_id: int,
        *,
        assessment_type_id: int | None = None,
    ) -> dict[str, Any]:
        exam = CbseExams.objects.filter(id=exam_id).first()
        if exam is None:
            raise ExaminationNotFoundError("CBSE exam not found.")

        timetable = CbseExamTimetable.objects.filter(
            id=timetable_id, cbse_exam_id=exam_id
        ).first()
        if timetable is None:
            raise ExaminationNotFoundError("CBSE exam timetable not found.")

        subject = (
            Subjects.objects.filter(id=timetable.subject_id).first()
            if timetable.subject_id
            else None
        )

        links = list(
            CbseExamTimetableAssessmentTypes.objects.filter(
                cbse_exam_timetable_id=timetable_id
            )
        )
        if not links:
            raise ExaminationValidationError(
                "No assessment types are linked to this timetable subject."
            )

        selected_link = None
        if assessment_type_id:
            selected_link = next(
                (
                    link
                    for link in links
                    if link.cbse_exam_assessment_type_id == assessment_type_id
                ),
                None,
            )
            if selected_link is None:
                raise ExaminationValidationError(
                    "Assessment type is not linked to this timetable."
                )
        else:
            selected_link = links[0]

        assessment = CbseExamAssessmentTypes.objects.filter(
            id=selected_link.cbse_exam_assessment_type_id
        ).first()
        max_marks = (
            _safe_float(assessment.maximum_marks)
            if assessment
            else _safe_float(timetable.written_maximum_marks)
        )

        enrollments = list(
            CbseExamStudents.objects.filter(cbse_exam_id=exam_id).order_by("id")
        )
        session_ids = [e.student_session_id for e in enrollments if e.student_session_id]
        sessions = {
            s.id: s
            for s in StudentSession.objects.filter(id__in=session_ids)
        }
        student_ids = [s.student_id for s in sessions.values() if s.student_id]
        students = {
            s.id: s
            for s in Students.objects.filter(id__in=student_ids, is_active="yes")
        }

        marks_map = {
            row.cbse_exam_student_id: row
            for row in CbseStudentSubjectMarks.objects.filter(
                cbse_exam_timetable_id=timetable_id,
                cbse_exam_timetable_assessment_type_id=selected_link.id,
                cbse_exam_student_id__in=[e.id for e in enrollments],
            )
        }

        roster_students: list[dict[str, Any]] = []
        for enrollment in enrollments:
            if enrollment.delete_student_id and enrollment.delete_student_id != 0:
                continue
            session = sessions.get(enrollment.student_session_id)
            if not session:
                continue
            student = students.get(session.student_id)
            if not student:
                continue
            mark = marks_map.get(enrollment.id)
            roster_students.append(
                {
                    "cbse_exam_student_id": enrollment.id,
                    "student_id": student.id,
                    "student_session_id": session.id,
                    "admission_no": student.admission_no,
                    "roll_no": enrollment.roll_no or student.roll_no,
                    "full_name": student_sel.format_student_name(
                        student.firstname, student.middlename, student.lastname
                    ),
                    "marks_id": mark.id if mark else None,
                    "marks": float(mark.marks) if mark and mark.marks is not None else 0.0,
                    "is_absent": bool(mark.is_absent) if mark else False,
                    "note": mark.note if mark else None,
                    "marks_grade": mark.marks_grade if mark else None,
                }
            )

        roster_students.sort(
            key=lambda row: (
                (
                    int(row["roll_no"])
                    if row["roll_no"] is not None and str(row["roll_no"]).isdigit()
                    else 9999
                ),
                str(row["full_name"]).lower(),
            )
        )

        return {
            "exam_id": exam.id,
            "exam_name": exam.name,
            "timetable_id": timetable.id,
            "subject_id": timetable.subject_id,
            "subject_name": subject.name if subject else None,
            "assessment_type_id": selected_link.cbse_exam_assessment_type_id,
            "timetable_assessment_type_id": selected_link.id,
            "assessment_name": assessment.name if assessment else None,
            "maximum_marks": max_marks,
            "students": roster_students,
        }

    def save_marks(self, payload: dict[str, Any]) -> dict[str, Any]:
        exam_id = payload.get("exam_id")
        timetable_id = payload.get("timetable_id")
        assessment_type_id = payload.get("assessment_type_id")
        entries = payload.get("entries") or []

        if not exam_id:
            raise ExaminationValidationError("Exam is required.")
        if not timetable_id:
            raise ExaminationValidationError("Timetable is required.")
        if not isinstance(entries, list) or not entries:
            raise ExaminationValidationError("At least one marks entry is required.")

        roster = self.get_roster(
            int(exam_id),
            int(timetable_id),
            assessment_type_id=int(assessment_type_id) if assessment_type_id else None,
        )
        max_marks = float(roster["maximum_marks"] or 0)
        link_id = roster["timetable_assessment_type_id"]
        assessment_id = roster["assessment_type_id"]

        enrollment_ids = {
            int(entry.get("cbse_exam_student_id"))
            for entry in entries
            if entry.get("cbse_exam_student_id") is not None
        }
        valid_enrollments = {
            row.id
            for row in CbseExamStudents.objects.filter(
                id__in=enrollment_ids, cbse_exam_id=exam_id
            )
        }
        if len(valid_enrollments) != len(enrollment_ids):
            raise ExaminationValidationError(
                "One or more students are not enrolled in this CBSE exam."
            )

        saved = 0
        with transaction.atomic():
            for entry in entries:
                student_exam_id = int(entry["cbse_exam_student_id"])
                is_absent = 1 if entry.get("is_absent") else 0
                marks = 0.0 if is_absent else _safe_float(entry.get("marks"), 0.0)
                if marks < 0:
                    raise ExaminationValidationError("Marks cannot be negative.")
                if max_marks > 0 and marks > max_marks:
                    raise ExaminationValidationError(
                        f"Marks cannot exceed maximum of {max_marks}."
                    )
                note = entry.get("note") or None
                grade = entry.get("marks_grade") or None

                existing = CbseStudentSubjectMarks.objects.filter(
                    cbse_exam_student_id=student_exam_id,
                    cbse_exam_timetable_id=timetable_id,
                    cbse_exam_timetable_assessment_type_id=link_id,
                ).first()
                if existing:
                    existing.marks = marks
                    existing.is_absent = is_absent
                    existing.note = note
                    existing.marks_grade = grade
                    existing.cbse_exam_assessment_type_id = assessment_id
                    existing.save()
                else:
                    CbseStudentSubjectMarks.objects.create(
                        cbse_exam_timetable_assessment_type_id=link_id,
                        cbse_exam_timetable_id=timetable_id,
                        cbse_exam_student_id=student_exam_id,
                        cbse_exam_assessment_type_id=assessment_id,
                        is_absent=is_absent,
                        marks=marks,
                        note=note,
                        marks_grade=grade,
                        created_at=timezone.now(),
                    )
                saved += 1

        logger.info(
            "Saved CBSE marks exam_id=%s timetable_id=%s count=%s",
            exam_id,
            timetable_id,
            saved,
        )
        return self.get_roster(
            int(exam_id),
            int(timetable_id),
            assessment_type_id=int(assessment_type_id) if assessment_type_id else None,
        )

    def get_marksheet(
        self,
        exam_id: int,
        *,
        cbse_exam_student_id: int | None = None,
        student_session_id: int | None = None,
    ) -> dict[str, Any]:
        exam = CbseExams.objects.filter(id=exam_id).first()
        if exam is None:
            raise ExaminationNotFoundError("CBSE exam not found.")

        enrollment_qs = CbseExamStudents.objects.filter(cbse_exam_id=exam_id)
        if cbse_exam_student_id:
            enrollment_qs = enrollment_qs.filter(id=cbse_exam_student_id)
        elif student_session_id:
            enrollment_qs = enrollment_qs.filter(student_session_id=student_session_id)
        else:
            raise ExaminationValidationError(
                "cbse_exam_student_id or student_session_id is required."
            )

        enrollment = enrollment_qs.first()
        if enrollment is None:
            raise ExaminationNotFoundError("CBSE exam student enrollment not found.")

        session = StudentSession.objects.filter(id=enrollment.student_session_id).first()
        student = (
            Students.objects.filter(id=session.student_id).first() if session else None
        )
        if student is None:
            raise ExaminationNotFoundError("Student not found for enrollment.")

        class_name = None
        section_name = None
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT c.class as class_name, sec.section as section_name
                FROM student_session ss
                LEFT JOIN classes c ON ss.class_id = c.id
                LEFT JOIN sections sec ON ss.section_id = sec.id
                WHERE ss.id = %s
                """,
                [enrollment.student_session_id],
            )
            row = cursor.fetchone()
            if row:
                class_name, section_name = row

        timetable_rows = self.list_timetable(exam_id)
        marks = list(
            CbseStudentSubjectMarks.objects.filter(
                cbse_exam_student_id=enrollment.id,
                cbse_exam_timetable_id__in=[t["id"] for t in timetable_rows],
            )
        )
        marks_by_key = {
            (m.cbse_exam_timetable_id, m.cbse_exam_timetable_assessment_type_id): m
            for m in marks
        }

        subjects: list[dict[str, Any]] = []
        total_max = 0.0
        total_obtained = 0.0
        for tt in timetable_rows:
            assessments = tt.get("assessments") or []
            if not assessments:
                # Fall back to timetable-level marks
                mark = next(
                    (
                        m
                        for m in marks
                        if m.cbse_exam_timetable_id == tt["id"]
                    ),
                    None,
                )
                obtained = float(mark.marks) if mark and not mark.is_absent else 0.0
                max_marks = float(tt.get("maximum_marks") or 0)
                subjects.append(
                    {
                        "subject_id": tt.get("subject_id"),
                        "subject_name": tt.get("subject_name") or "Subject",
                        "maximum_marks": max_marks,
                        "obtained_marks": obtained,
                        "is_absent": bool(mark.is_absent) if mark else False,
                        "grade": mark.marks_grade if mark else None,
                    }
                )
                total_max += max_marks
                total_obtained += obtained
                continue

            subject_max = 0.0
            subject_obtained = 0.0
            absent = False
            grade = None
            for assessment in assessments:
                mark = marks_by_key.get(
                    (tt["id"], assessment["timetable_assessment_type_id"])
                )
                max_marks = float(assessment.get("maximum_marks") or 0)
                obtained = (
                    float(mark.marks)
                    if mark and not mark.is_absent and mark.marks is not None
                    else 0.0
                )
                if mark and mark.is_absent:
                    absent = True
                if mark and mark.marks_grade:
                    grade = mark.marks_grade
                subject_max += max_marks
                subject_obtained += obtained

            subjects.append(
                {
                    "subject_id": tt.get("subject_id"),
                    "subject_name": tt.get("subject_name") or "Subject",
                    "maximum_marks": subject_max,
                    "obtained_marks": subject_obtained,
                    "is_absent": absent,
                    "grade": grade,
                }
            )
            total_max += subject_max
            total_obtained += subject_obtained

        percentage = (total_obtained / total_max * 100) if total_max > 0 else 0.0

        return {
            "exam_id": exam.id,
            "exam_name": exam.name,
            "cbse_exam_student_id": enrollment.id,
            "student_id": student.id,
            "student_session_id": enrollment.student_session_id,
            "admission_no": student.admission_no,
            "roll_no": enrollment.roll_no or student.roll_no,
            "full_name": student_sel.format_student_name(
                student.firstname, student.middlename, student.lastname
            ),
            "class_name": class_name or "—",
            "section_name": section_name or "—",
            "subjects": subjects,
            "total_maximum_marks": total_max,
            "total_obtained_marks": total_obtained,
            "percentage": round(percentage, 2),
        }
