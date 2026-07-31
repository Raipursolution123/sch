# flake8: noqa
import os
import sys

import django
from django.utils import timezone

# Add backend directory to sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.local")
django.setup()

from apps.academics.models.lesson import Lesson
from apps.academics.models.subject_group_class_sections import SubjectGroupClassSections
from apps.academics.models.subject_group_subjects import SubjectGroupSubjects
from apps.academics.models.subject_groups import SubjectGroups
from apps.academics.models.topic import Topic


def seed_lessons():
    print("Seeding test lessons and topics for old session 30 (2025-26)...")
    now = timezone.now()

    # 1. Create a Subject Group in Session 30 (since it was missing)
    old_group, created = SubjectGroups.objects.get_or_create(
        name="Math-Old",
        session_id=30,
        defaults={
            "description": "Mathematics for old academic session 2025-26",
            "created_at": now,
        },
    )
    if created:
        print(f"Created Subject Group 'Math-Old' for Session 30 with ID {old_group.id}")
    else:
        print(
            f"Subject Group 'Math-Old' for Session 30 already exists with ID {old_group.id}"
        )

    # 2. Ensure the source SubjectGroupSubjects mapping exists for Session 30 pointing to this group
    src_sgs, created = SubjectGroupSubjects.objects.get_or_create(
        subject_group_id=old_group.id,
        subject_id=42,  # Math Subject ID
        session_id=30,
        defaults={"created_at": now},
    )
    if created:
        print(f"Created source SubjectGroupSubjects mapping with ID {src_sgs.id}")
    else:
        print(
            f"Source SubjectGroupSubjects mapping already exists with ID {src_sgs.id}"
        )

    # 3. Ensure the source SubjectGroupClassSections mapping exists for Session 30
    src_sgcs, created = SubjectGroupClassSections.objects.get_or_create(
        subject_group_id=old_group.id,
        class_section_id=111,
        session_id=30,
        defaults={"created_at": now, "is_active": 1},
    )
    if created:
        print(f"Created source SubjectGroupClassSections mapping with ID {src_sgcs.id}")
    else:
        print(
            f"Source SubjectGroupClassSections mapping already exists with ID {src_sgcs.id}"
        )

    # Clear existing lessons/topics for session 30
    existing_lessons = Lesson.objects.filter(
        session_id=30, subject_group_subject_id=src_sgs.id
    )
    lesson_ids = list(existing_lessons.values_list("id", flat=True))
    Topic.objects.filter(session_id=30, lesson_id__in=lesson_ids).delete()
    existing_lessons.delete()
    print("Cleared existing test lessons and topics for session 30.")

    # 4. Create mock lessons in session 30
    lesson1 = Lesson.objects.create(
        session_id=30,
        subject_group_subject_id=src_sgs.id,
        subject_group_class_sections_id=src_sgcs.id,
        name="Introduction to Physics & Measurements",
        created_at=now,
    )
    print(f"Created Lesson: {lesson1.name}")

    lesson2 = Lesson.objects.create(
        session_id=30,
        subject_group_subject_id=src_sgs.id,
        subject_group_class_sections_id=src_sgcs.id,
        name="Laws of Motion & Force",
        created_at=now,
    )
    print(f"Created Lesson: {lesson2.name}")

    # 5. Create mock topics under those lessons in session 30
    Topic.objects.create(
        session_id=30,
        lesson_id=lesson1.id,
        name="Units, Dimensions and Errors in Measurement",
        status=0,
        created_at=now,
    )
    Topic.objects.create(
        session_id=30,
        lesson_id=lesson1.id,
        name="Significant Figures & Precision of Instruments",
        status=0,
        created_at=now,
    )
    Topic.objects.create(
        session_id=30,
        lesson_id=lesson2.id,
        name="Newton's Laws of Motion & Applications",
        status=0,
        created_at=now,
    )
    print("Created mock topics for both lessons successfully.")
    print(
        "Seeding complete! You can now test copying from Session 30 (2025-26) to Session 28 (2026-27)."
    )


if __name__ == "__main__":
    seed_lessons()
