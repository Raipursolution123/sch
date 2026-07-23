from __future__ import annotations

from datetime import datetime, time
from typing import Any

from django.db import transaction
from django.db.models import Q
from django.utils import timezone
from django.utils.dateparse import parse_datetime, parse_time

from apps.academics.models import Classes, Sections, Sessions
from apps.examinations.domain.examination_exceptions import (
    ExaminationNotFoundError,
    ExaminationValidationError,
)
from apps.examinations.models.onlineexam import Onlineexam
from apps.examinations.models.onlineexam_questions import OnlineexamQuestions
from apps.examinations.models.onlineexam_students import OnlineexamStudents
from apps.examinations.models.questions import Questions
from apps.students.models.student_session import StudentSession
from apps.students.selectors import promotion_selectors
from apps.students.selectors import student_selectors as student_sel


def _as_int(value: Any, default: int | None = None) -> int | None:
    if value is None or value == "":
        return default
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def _as_float(value: Any, default: float = 0.0) -> float:
    if value is None or value == "":
        return default
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def _parse_dt(value: Any):
    if value in (None, ""):
        return None
    if isinstance(value, datetime):
        return value
    parsed = parse_datetime(str(value))
    if parsed is None:
        raise ExaminationValidationError(f"Invalid datetime: {value}")
    return parsed


def _parse_tm(value: Any, *, required: bool = False, field: str = "time"):
    if value in (None, ""):
        if required:
            raise ExaminationValidationError(f"{field} is required.")
        return None
    if isinstance(value, time):
        return value
    parsed = parse_time(str(value))
    if parsed is None:
        raise ExaminationValidationError(f"Invalid {field}: {value}")
    return parsed


class QuestionBankService:
    def list(
        self,
        *,
        query: str | None = None,
        class_id: int | None = None,
        subject_id: int | None = None,
        question_type: str | None = None,
    ):
        qs = Questions.objects.all().order_by("-id")
        if class_id:
            qs = qs.filter(class_id=class_id)
        if subject_id:
            qs = qs.filter(subject_id=subject_id)
        if question_type:
            qs = qs.filter(question_type=question_type)
        term = (query or "").strip()
        if term:
            qs = qs.filter(
                Q(question__icontains=term)
                | Q(lesson_name__icontains=term)
                | Q(question_type__icontains=term)
            )
        return qs

    def get(self, pk: int) -> Questions:
        row = Questions.objects.filter(id=pk).first()
        if row is None:
            raise ExaminationNotFoundError("Question not found.")
        return row

    def to_dict(self, row: Questions) -> dict[str, Any]:
        return {
            "id": row.id,
            "staff_id": row.staff_id,
            "subject_id": row.subject_id,
            "lesson_id": row.lesson_id,
            "lesson_name": row.lesson_name,
            "question_type": row.question_type,
            "level": row.level,
            "class_id": row.class_id,
            "section_id": row.section_id,
            "class_section_id": row.class_section_id,
            "question_parts": row.question_parts,
            "question": row.question,
            "opt_a": row.opt_a,
            "opt_b": row.opt_b,
            "opt_c": row.opt_c,
            "opt_d": row.opt_d,
            "opt_e": row.opt_e,
            "correct": row.correct,
            "qscore": row.qscore,
            "descriptive_word_limit": row.descriptive_word_limit,
            "created_at": row.created_at,
            "updated_at": row.updated_at,
            "qpart_1": row.qpart_1,
            "qpart_2": row.qpart_2,
            "qpart_3": row.qpart_3,
            "qpart_4": row.qpart_4,
            "qpart_5": row.qpart_5,
            "is_it_offline": row.is_it_offline,
        }

    def create(self, payload: dict[str, Any], *, staff_id: int) -> dict[str, Any]:
        class_id = _as_int(payload.get("class_id"))
        if not class_id:
            raise ExaminationValidationError("class_id is required.")
        question_type = str(payload.get("question_type", "")).strip()
        if not question_type:
            raise ExaminationValidationError("question_type is required.")
        level = str(payload.get("level", "")).strip() or "low"
        question = str(payload.get("question", "")).strip()
        if not question:
            raise ExaminationValidationError("question is required.")

        row = Questions.objects.create(
            staff_id=staff_id or None,
            subject_id=_as_int(payload.get("subject_id")),
            lesson_id=_as_int(payload.get("lesson_id")),
            lesson_name=str(payload.get("lesson_name", "")).strip() or None,
            question_type=question_type[:100],
            level=level[:10],
            class_id=class_id,
            section_id=_as_int(payload.get("section_id")),
            class_section_id=_as_int(payload.get("class_section_id")),
            question_parts=str(payload.get("question_parts", "")).strip() or None,
            question=question,
            opt_a=str(payload.get("opt_a", "")).strip() or None,
            opt_b=str(payload.get("opt_b", "")).strip() or None,
            opt_c=str(payload.get("opt_c", "")).strip() or None,
            opt_d=str(payload.get("opt_d", "")).strip() or None,
            opt_e=str(payload.get("opt_e", "")).strip() or None,
            correct=str(payload.get("correct", "")).strip() or None,
            qscore=_as_int(payload.get("qscore"), 1),
            descriptive_word_limit=_as_int(payload.get("descriptive_word_limit"), 0)
            or 0,
            created_at=timezone.now(),
            updated_at=timezone.localdate(),
            qpart_1=_as_int(payload.get("qpart_1"), 0) or 0,
            qpart_2=_as_int(payload.get("qpart_2"), 0) or 0,
            qpart_3=_as_int(payload.get("qpart_3"), 0) or 0,
            qpart_4=_as_int(payload.get("qpart_4"), 0) or 0,
            qpart_5=_as_int(payload.get("qpart_5"), 0) or 0,
            is_it_offline=_as_int(payload.get("is_it_offline"), 0) or 0,
        )
        return self.to_dict(row)

    def update(self, pk: int, payload: dict[str, Any]) -> dict[str, Any]:
        row = self.get(pk)
        if "class_id" in payload:
            class_id = _as_int(payload.get("class_id"))
            if not class_id:
                raise ExaminationValidationError("class_id cannot be empty.")
            row.class_id = class_id
        if "question_type" in payload:
            question_type = str(payload.get("question_type", "")).strip()
            if not question_type:
                raise ExaminationValidationError("question_type cannot be empty.")
            row.question_type = question_type[:100]
        if "level" in payload:
            row.level = str(payload.get("level") or "low").strip()[:10]
        if "question" in payload:
            question = str(payload.get("question", "")).strip()
            if not question:
                raise ExaminationValidationError("question cannot be empty.")
            row.question = question
        for field in (
            "subject_id",
            "lesson_id",
            "section_id",
            "class_section_id",
            "qscore",
            "descriptive_word_limit",
            "qpart_1",
            "qpart_2",
            "qpart_3",
            "qpart_4",
            "qpart_5",
            "is_it_offline",
        ):
            if field in payload:
                setattr(row, field, _as_int(payload.get(field)))
        for field in (
            "lesson_name",
            "question_parts",
            "opt_a",
            "opt_b",
            "opt_c",
            "opt_d",
            "opt_e",
            "correct",
        ):
            if field in payload:
                value = payload.get(field)
                setattr(
                    row,
                    field,
                    (str(value).strip() if value is not None else "") or None,
                )
        row.updated_at = timezone.localdate()
        row.save()
        return self.to_dict(row)

    def delete(self, pk: int) -> None:
        linked = OnlineexamQuestions.objects.filter(question_id=pk).exists()
        if linked:
            raise ExaminationValidationError(
                "Question is linked to an online exam and cannot be deleted."
            )
        self.get(pk).delete()


class OnlineExamService:
    def list(self, *, query: str | None = None, session_id: int | None = None):
        qs = Onlineexam.objects.all().order_by("-id")
        if session_id:
            qs = qs.filter(session_id=session_id)
        term = (query or "").strip()
        if term:
            qs = qs.filter(Q(exam__icontains=term) | Q(description__icontains=term))
        return qs

    def get(self, pk: int) -> Onlineexam:
        row = Onlineexam.objects.filter(id=pk).first()
        if row is None:
            raise ExaminationNotFoundError("Online exam not found.")
        return row

    def to_dict(self, row: Onlineexam) -> dict[str, Any]:
        question_count = OnlineexamQuestions.objects.filter(
            onlineexam_id=row.id
        ).count()
        student_count = OnlineexamStudents.objects.filter(onlineexam_id=row.id).count()
        return {
            "id": row.id,
            "session_id": row.session_id,
            "exam": row.exam,
            "attempt": row.attempt,
            "exam_from": row.exam_from,
            "exam_to": row.exam_to,
            "is_quiz": row.is_quiz,
            "auto_publish_date": row.auto_publish_date,
            "time_from": row.time_from.strftime("%H:%M:%S") if row.time_from else None,
            "time_to": row.time_to.strftime("%H:%M:%S") if row.time_to else None,
            "duration": row.duration.strftime("%H:%M:%S") if row.duration else None,
            "passing_percentage": row.passing_percentage,
            "description": row.description,
            "publish_result": row.publish_result,
            "answer_word_count": row.answer_word_count,
            "is_active": row.is_active,
            "is_marks_display": row.is_marks_display,
            "is_neg_marking": row.is_neg_marking,
            "is_random_question": row.is_random_question,
            "is_rank_generated": row.is_rank_generated,
            "publish_exam_notification": row.publish_exam_notification,
            "publish_result_notification": row.publish_result_notification,
            "created_at": row.created_at,
            "updated_at": row.updated_at,
            "question_count": question_count,
            "student_count": student_count,
        }

    def create(self, payload: dict[str, Any]) -> dict[str, Any]:
        session_id = _as_int(payload.get("session_id"))
        if not session_id:
            raise ExaminationValidationError("session_id is required.")
        if not Sessions.objects.filter(id=session_id).exists():
            raise ExaminationValidationError("Session not found.")
        exam = str(payload.get("exam", "")).strip()
        if not exam:
            raise ExaminationValidationError("exam name is required.")
        duration = _parse_tm(
            payload.get("duration") or "01:00:00", required=True, field="duration"
        )
        attempt = _as_int(payload.get("attempt"), 1) or 1

        row = Onlineexam.objects.create(
            session_id=session_id,
            exam=exam,
            attempt=attempt,
            exam_from=_parse_dt(payload.get("exam_from")),
            exam_to=_parse_dt(payload.get("exam_to")),
            is_quiz=_as_int(payload.get("is_quiz"), 0) or 0,
            auto_publish_date=_parse_dt(payload.get("auto_publish_date")),
            time_from=_parse_tm(payload.get("time_from")),
            time_to=_parse_tm(payload.get("time_to")),
            duration=duration,
            passing_percentage=str(payload.get("passing_percentage", "0")),
            description=str(payload.get("description", "")).strip() or None,
            publish_result=_as_int(payload.get("publish_result"), 0) or 0,
            answer_word_count=(
                _as_int(payload.get("answer_word_count"), -1)
                if payload.get("answer_word_count") is not None
                else -1
            ),
            is_active=str(payload.get("is_active", "1"))[:1] or "1",
            is_marks_display=_as_int(payload.get("is_marks_display"), 0) or 0,
            is_neg_marking=_as_int(payload.get("is_neg_marking"), 0) or 0,
            is_random_question=_as_int(payload.get("is_random_question"), 0) or 0,
            is_rank_generated=_as_int(payload.get("is_rank_generated"), 0) or 0,
            publish_exam_notification=_as_int(
                payload.get("publish_exam_notification"), 0
            )
            or 0,
            publish_result_notification=_as_int(
                payload.get("publish_result_notification"), 0
            )
            or 0,
            created_at=timezone.now(),
            updated_at=timezone.localdate(),
        )
        return self.to_dict(row)

    def update(self, pk: int, payload: dict[str, Any]) -> dict[str, Any]:
        row = self.get(pk)
        if "session_id" in payload:
            session_id = _as_int(payload.get("session_id"))
            if not session_id:
                raise ExaminationValidationError("session_id cannot be empty.")
            if not Sessions.objects.filter(id=session_id).exists():
                raise ExaminationValidationError("Session not found.")
            row.session_id = session_id
        if "exam" in payload:
            exam = str(payload.get("exam", "")).strip()
            if not exam:
                raise ExaminationValidationError("exam name cannot be empty.")
            row.exam = exam
        if "attempt" in payload:
            row.attempt = _as_int(payload.get("attempt"), 1) or 1
        if "exam_from" in payload:
            row.exam_from = _parse_dt(payload.get("exam_from"))
        if "exam_to" in payload:
            row.exam_to = _parse_dt(payload.get("exam_to"))
        if "auto_publish_date" in payload:
            row.auto_publish_date = _parse_dt(payload.get("auto_publish_date"))
        if "time_from" in payload:
            row.time_from = _parse_tm(payload.get("time_from"))
        if "time_to" in payload:
            row.time_to = _parse_tm(payload.get("time_to"))
        if "duration" in payload:
            row.duration = _parse_tm(
                payload.get("duration"), required=True, field="duration"
            )
        if "passing_percentage" in payload:
            row.passing_percentage = str(payload.get("passing_percentage", "0"))
        if "description" in payload:
            row.description = str(payload.get("description") or "").strip() or None
        if "is_active" in payload:
            row.is_active = str(payload.get("is_active", "0"))[:1]
        for field in (
            "is_quiz",
            "publish_result",
            "answer_word_count",
            "is_marks_display",
            "is_neg_marking",
            "is_random_question",
            "is_rank_generated",
            "publish_exam_notification",
            "publish_result_notification",
        ):
            if field in payload:
                setattr(row, field, _as_int(payload.get(field), 0) or 0)
        row.updated_at = timezone.localdate()
        row.save()
        return self.to_dict(row)

    @transaction.atomic
    def delete(self, pk: int) -> None:
        row = self.get(pk)
        OnlineexamQuestions.objects.filter(onlineexam_id=row.id).delete()
        OnlineexamStudents.objects.filter(onlineexam_id=row.id).delete()
        row.delete()

    def list_questions(self, exam_id: int) -> list[dict[str, Any]]:
        exam = self.get(exam_id)
        links = list(
            OnlineexamQuestions.objects.filter(onlineexam_id=exam.id).order_by("id")
        )
        question_ids = [link.question_id for link in links if link.question_id]
        qmap = {q.id: q for q in Questions.objects.filter(id__in=question_ids)}
        result = []
        for link in links:
            q = qmap.get(link.question_id)
            result.append(
                {
                    "id": link.id,
                    "onlineexam_id": link.onlineexam_id,
                    "question_id": link.question_id,
                    "session_id": link.session_id,
                    "marks": link.marks,
                    "neg_marks": link.neg_marks,
                    "is_active": link.is_active,
                    "question": q.question if q else None,
                    "question_type": q.question_type if q else None,
                    "level": q.level if q else None,
                    "correct": q.correct if q else None,
                }
            )
        return result

    def add_questions(
        self, exam_id: int, items: list[dict[str, Any]]
    ) -> dict[str, Any]:
        if not items:
            raise ExaminationValidationError("Select at least one question.")
        exam = self.get(exam_id)
        created = 0
        skipped = 0
        for item in items:
            question_id = _as_int(item.get("question_id"))
            if not question_id:
                continue
            if not Questions.objects.filter(id=question_id).exists():
                raise ExaminationValidationError(f"Question {question_id} not found.")
            exists = OnlineexamQuestions.objects.filter(
                onlineexam_id=exam.id, question_id=question_id
            ).exists()
            if exists:
                skipped += 1
                continue
            OnlineexamQuestions.objects.create(
                question_id=question_id,
                onlineexam_id=exam.id,
                session_id=exam.session_id,
                marks=_as_float(item.get("marks"), 1.0),
                neg_marks=_as_float(item.get("neg_marks"), 0.0),
                is_active=str(item.get("is_active", "1"))[:1] or "1",
                created_at=timezone.now(),
                updated_at=timezone.localdate(),
            )
            created += 1
        return {"created": created, "skipped": skipped}

    def remove_question(self, exam_id: int, link_id: int) -> None:
        self.get(exam_id)
        link = OnlineexamQuestions.objects.filter(
            id=link_id, onlineexam_id=exam_id
        ).first()
        if link is None:
            raise ExaminationNotFoundError("Exam question link not found.")
        link.delete()

    def get_roster(
        self, exam_id: int, class_id: int, section_id: int
    ) -> dict[str, Any]:
        exam = self.get(exam_id)
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
        assigned_map = {
            row.student_session_id: row
            for row in OnlineexamStudents.objects.filter(
                onlineexam_id=exam.id, student_session_id__in=session_ids
            )
        }

        students: list[dict[str, Any]] = []
        for session_row in session_enrollments:
            student = student_map.get(session_row.student_id)
            if not student or student.is_active != "yes":
                continue
            assigned = assigned_map.get(session_row.id)
            students.append(
                {
                    "student_id": student.id,
                    "student_session_id": session_row.id,
                    "admission_no": student.admission_no,
                    "roll_no": student.roll_no,
                    "full_name": student_sel.format_student_name(
                        student.firstname, student.middlename, student.lastname
                    ),
                    "is_assigned": assigned is not None,
                    "assignment_id": assigned.id if assigned else None,
                    "is_attempted": assigned.is_attempted if assigned else 0,
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
        return {
            "exam_id": exam.id,
            "exam_name": exam.exam,
            "session_id": exam.session_id,
            "session_name": session.session if session else None,
            "class_id": class_id,
            "class_name": school_class.class_field,
            "section_id": section_id,
            "section_name": section.section,
            "students": students,
        }

    def assign_students(
        self, exam_id: int, student_session_ids: list[int]
    ) -> dict[str, Any]:
        if not student_session_ids:
            raise ExaminationValidationError("Select at least one student.")
        exam = self.get(exam_id)
        if not exam.session_id:
            raise ExaminationValidationError("Exam has no academic session.")
        unique_ids = sorted({int(sid) for sid in student_session_ids})
        session_rows = list(
            StudentSession.objects.filter(id__in=unique_ids, session_id=exam.session_id)
        )
        if len(session_rows) != len(unique_ids):
            raise ExaminationValidationError(
                "One or more selected students are not in the exam session."
            )
        created = 0
        skipped = 0
        for sid in unique_ids:
            if OnlineexamStudents.objects.filter(
                onlineexam_id=exam.id, student_session_id=sid
            ).exists():
                skipped += 1
                continue
            OnlineexamStudents.objects.create(
                onlineexam_id=exam.id,
                student_session_id=sid,
                is_attempted=0,
                rank=0,
                quiz_attempted=0,
                created_at=timezone.now(),
                updated_at=timezone.localdate(),
            )
            created += 1
        return {"assigned_count": created, "skipped": skipped}

    def unassign_student(self, exam_id: int, assignment_id: int) -> None:
        self.get(exam_id)
        row = OnlineexamStudents.objects.filter(
            id=assignment_id, onlineexam_id=exam_id
        ).first()
        if row is None:
            raise ExaminationNotFoundError("Student assignment not found.")
        if row.is_attempted:
            raise ExaminationValidationError(
                "Cannot unassign a student who has already attempted the exam."
            )
        row.delete()
