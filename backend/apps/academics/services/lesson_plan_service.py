import logging
from typing import Any

from django.db import IntegrityError
from django.utils import timezone

from apps.academics.domain.lesson_plan_exceptions import (
    LessonPlanNotFoundError,
    LessonPlanValidationError,
)
from apps.academics.models.lesson import Lesson
from apps.academics.models.lesson_plan_forum import LessonPlanForum
from apps.academics.models.subject_syllabus import SubjectSyllabus
from apps.academics.models.topic import Topic

logger = logging.getLogger(__name__)


class LessonPlanService:
    # ---------------------------------------------------------
    # Lessons
    # ---------------------------------------------------------
    def list_lessons(
        self, subject_group_id=None, subject_id=None, class_section_id=None
    ):
        qs = Lesson.objects.all().order_by("-id")

        if subject_group_id or subject_id or class_section_id:
            from apps.academics.models.subject_group_class_sections import (
                SubjectGroupClassSections,
            )
            from apps.academics.models.subject_group_subjects import (
                SubjectGroupSubjects,
            )

            sgs_qs = SubjectGroupSubjects.objects.all()
            if subject_group_id:
                sgs_qs = sgs_qs.filter(subject_group_id=subject_group_id)
            if subject_id:
                sgs_qs = sgs_qs.filter(subject_id=subject_id)

            sgcs_qs = SubjectGroupClassSections.objects.all()
            if subject_group_id:
                sgcs_qs = sgcs_qs.filter(subject_group_id=subject_group_id)
            if class_section_id:
                sgcs_qs = sgcs_qs.filter(class_section_id=class_section_id)

            qs = qs.filter(
                subject_group_subject_id__in=sgs_qs.values("id"),
                subject_group_class_sections_id__in=sgcs_qs.values("id"),
            )

        return qs

    def get_lesson(self, lesson_id: int):
        lesson = Lesson.objects.filter(id=lesson_id).first()
        if not lesson:
            raise LessonPlanNotFoundError(f"Lesson {lesson_id} not found.")
        return lesson

    def create_lesson(self, data: dict[str, Any]) -> Lesson:
        if not data.get("name"):
            raise LessonPlanValidationError("Lesson name is required.")

        from apps.academics.models.sessions import Sessions
        from apps.academics.models.subject_group_class_sections import (
            SubjectGroupClassSections,
        )
        from apps.academics.models.subject_group_subjects import SubjectGroupSubjects

        session_id = data.get("session_id", 1)
        if not Sessions.objects.filter(id=session_id).exists():
            session_id = Sessions.objects.first().id if Sessions.objects.first() else 1

        sg_id = data.get("subject_group_id")
        subj_id = data.get("subject_id")
        cs_id = data.get("class_section_id")

        if not sg_id or not subj_id or not cs_id:
            raise LessonPlanValidationError(
                "subject_group_id, subject_id, and class_section_id are required."
            )

        sgs = SubjectGroupSubjects.objects.filter(
            subject_group_id=sg_id, subject_id=subj_id
        ).first()
        if not sgs:
            raise LessonPlanValidationError(
                f"Invalid Subject mapping for Group {sg_id} and Subject {subj_id}."
            )

        sgcs = SubjectGroupClassSections.objects.filter(
            subject_group_id=sg_id, class_section_id=cs_id
        ).first()
        if not sgcs:
            raise LessonPlanValidationError(
                f"Invalid Class/Section mapping for Group {sg_id} and ClassSection {cs_id}."
            )

        try:
            lesson = Lesson.objects.create(
                session_id=session_id,
                subject_group_subject_id=sgs.id,
                subject_group_class_sections_id=sgcs.id,
                name=data.get("name"),
                created_at=timezone.now(),
            )
            return lesson
        except IntegrityError as e:
            logger.error("Foreign key constraint failed in create_lesson: %s", e)
            raise LessonPlanValidationError(
                "Could not create Lesson because the referenced Session or Subject Group ID does not exist."
            )

    def update_lesson(self, lesson_id: int, data: dict[str, Any]) -> Lesson:
        lesson = self.get_lesson(lesson_id)
        if "name" in data:
            if not data["name"]:
                raise LessonPlanValidationError("Lesson name is required.")
            lesson.name = data["name"]
        if "session_id" in data:
            lesson.session_id = data["session_id"]

        sg_id = data.get("subject_group_id")
        subj_id = data.get("subject_id")
        cs_id = data.get("class_section_id")

        if sg_id and subj_id:
            from apps.academics.models.subject_group_subjects import (
                SubjectGroupSubjects,
            )

            sgs = SubjectGroupSubjects.objects.filter(
                subject_group_id=sg_id, subject_id=subj_id
            ).first()
            if sgs:
                lesson.subject_group_subject_id = sgs.id

        if sg_id and cs_id:
            from apps.academics.models.subject_group_class_sections import (
                SubjectGroupClassSections,
            )

            sgcs = SubjectGroupClassSections.objects.filter(
                subject_group_id=sg_id, class_section_id=cs_id
            ).first()
            if sgcs:
                lesson.subject_group_class_sections_id = sgcs.id

        lesson.save()
        return lesson

    def delete_lesson(self, lesson_id: int) -> None:
        lesson = self.get_lesson(lesson_id)
        # Cascade delete Topics
        topics = Topic.objects.filter(lesson_id=lesson.id)
        for t in topics:
            self.delete_topic(t.id)
        lesson.delete()

    # ---------------------------------------------------------
    # Topics
    # ---------------------------------------------------------
    def list_topics(self, lesson_id=None):
        qs = Topic.objects.all().order_by("-id")
        if lesson_id:
            qs = qs.filter(lesson_id=lesson_id)
        return qs

    def get_topic(self, topic_id: int):
        topic = Topic.objects.filter(id=topic_id).first()
        if not topic:
            raise LessonPlanNotFoundError(f"Topic {topic_id} not found.")
        return topic

    def create_topic(self, data: dict[str, Any]) -> Topic:
        if not data.get("name"):
            raise LessonPlanValidationError("Topic name is required.")

        from apps.academics.models.lesson import Lesson
        from apps.academics.models.sessions import Sessions

        first_session = Sessions.objects.first()
        first_lesson = Lesson.objects.first()

        session_id = data.get("session_id", 1)
        if not Sessions.objects.filter(id=session_id).exists() and first_session:
            session_id = first_session.id

        lesson_id = data.get("lesson_id", 1)
        if not Lesson.objects.filter(id=lesson_id).exists() and first_lesson:
            lesson_id = first_lesson.id

        try:
            topic = Topic.objects.create(
                session_id=session_id,
                lesson_id=lesson_id,
                name=data.get("name"),
                status=data.get("status", 0),
                complete_date=data.get("complete_date"),
                created_at=timezone.now(),
            )
            return topic
        except IntegrityError as e:
            logger.error("Foreign key constraint failed in create_topic: %s", e)
            raise LessonPlanValidationError(
                "Could not create Topic because the referenced Session or Lesson ID does not exist."
            )

    def update_topic(self, topic_id: int, data: dict[str, Any]) -> Topic:
        topic = self.get_topic(topic_id)
        if "name" in data:
            if not data["name"]:
                raise LessonPlanValidationError("Topic name is required.")
            topic.name = data["name"]
        if "session_id" in data:
            topic.session_id = data["session_id"]
        if "lesson_id" in data:
            topic.lesson_id = data["lesson_id"]
        if "status" in data:
            topic.status = data["status"]
        if "complete_date" in data:
            topic.complete_date = data["complete_date"]

        topic.save()
        return topic

    def delete_topic(self, topic_id: int) -> None:
        topic = self.get_topic(topic_id)
        # Cascade delete Syllabus
        SubjectSyllabus.objects.filter(topic_id=topic.id).delete()
        topic.delete()

    # ---------------------------------------------------------
    # Subject Syllabus (Lesson Plan)
    # ---------------------------------------------------------
    def list_syllabus(self):
        return SubjectSyllabus.objects.all().order_by("-id")

    def get_syllabus(self, syllabus_id: int):
        syllabus = SubjectSyllabus.objects.filter(id=syllabus_id).first()
        if not syllabus:
            raise LessonPlanNotFoundError(f"SubjectSyllabus {syllabus_id} not found.")
        return syllabus

    def create_syllabus(self, data: dict[str, Any]) -> SubjectSyllabus:
        from apps.academics.models.sessions import Sessions
        from apps.staff.models.staff import Staff

        # Get first available IDs in the database to prevent foreign key constraint failures!
        first_topic = Topic.objects.first()
        first_session = Sessions.objects.first()
        first_staff = Staff.objects.first()

        topic_id = data.get("topic_id", 1)
        if not Topic.objects.filter(id=topic_id).exists() and first_topic:
            topic_id = first_topic.id

        session_id = data.get("session_id", 1)
        if not Sessions.objects.filter(id=session_id).exists() and first_session:
            session_id = first_session.id

        staff_id = data.get("created_by", 1)
        if not Staff.objects.filter(id=staff_id).exists() and first_staff:
            staff_id = first_staff.id

        try:
            syllabus = SubjectSyllabus.objects.create(
                topic_id=topic_id,
                session_id=session_id,
                created_by=staff_id,
                created_for=staff_id,
                date=data.get("date"),
                time_from=data.get("time_from", ""),
                time_to=data.get("time_to", ""),
                presentation=data.get("presentation", ""),
                attachment=data.get("attachment", ""),
                lacture_youtube_url=data.get("lacture_youtube_url", ""),
                lacture_video=data.get("lacture_video", ""),
                sub_topic=data.get("sub_topic", ""),
                teaching_method=data.get("teaching_method", ""),
                general_objectives=data.get("general_objectives", ""),
                previous_knowledge=data.get("previous_knowledge", ""),
                comprehensive_questions=data.get("comprehensive_questions", ""),
                status=data.get("status", 0),
                created_at=timezone.now(),
            )
            return syllabus
        except IntegrityError as e:
            logger.error("Foreign key constraint failed in create_syllabus: %s", e)
            raise LessonPlanValidationError(
                "Could not create Syllabus because the referenced Topic, Session, or Staff ID does not exist in the database."
            )

    def update_syllabus(
        self, syllabus_id: int, data: dict[str, Any]
    ) -> SubjectSyllabus:
        syllabus = self.get_syllabus(syllabus_id)
        fields = [
            "topic_id",
            "session_id",
            "created_by",
            "created_for",
            "date",
            "time_from",
            "time_to",
            "presentation",
            "attachment",
            "lacture_youtube_url",
            "lacture_video",
            "sub_topic",
            "teaching_method",
            "general_objectives",
            "previous_knowledge",
            "comprehensive_questions",
            "status",
        ]
        for field in fields:
            if field in data:
                setattr(syllabus, field, data[field])
        syllabus.save()
        return syllabus

    def delete_syllabus(self, syllabus_id: int) -> None:
        syllabus = self.get_syllabus(syllabus_id)
        syllabus.delete()

    # ---------------------------------------------------------
    # Lesson Plan Forum (Comments)
    # ---------------------------------------------------------
    def list_forum_comments(self, syllabus_id: int):
        return LessonPlanForum.objects.filter(subject_syllabus_id=syllabus_id).order_by(
            "-id"
        )

    def get_forum_comment(self, comment_id: int):
        comment = LessonPlanForum.objects.filter(id=comment_id).first()
        if not comment:
            raise LessonPlanNotFoundError(f"LessonPlanForum {comment_id} not found.")
        return comment

    def create_forum_comment(
        self, syllabus_id: int, data: dict[str, Any]
    ) -> LessonPlanForum:
        if not data.get("message"):
            raise LessonPlanValidationError("Comment message is required.")
        if not data.get("type"):
            raise LessonPlanValidationError(
                "Comment type (e.g. 'staff' or 'student') is required."
            )

        comment = LessonPlanForum.objects.create(
            subject_syllabus_id=syllabus_id,
            type=data.get("type"),
            staff_id=data.get("staff_id"),
            student_id=data.get("student_id"),
            message=data.get("message"),
            created_date=timezone.now(),
        )
        return comment

    def delete_forum_comment(self, comment_id: int) -> None:
        comment = self.get_forum_comment(comment_id)
        comment.delete()
