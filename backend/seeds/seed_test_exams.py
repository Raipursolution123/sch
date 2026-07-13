import os
import django
import sys
from django.utils import timezone

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.local")
django.setup()

from apps.examinations.models.exam_groups import ExamGroups
from apps.examinations.models.exam_group_class_batch_exams import (
    ExamGroupClassBatchExams,
)
from apps.academics.models.subjects import Subjects


def seed_exams():
    print("Seeding examination test data...")

    # 1. Create or get Exam Group
    group, created = ExamGroups.objects.get_or_create(
        id=1,
        defaults={
            "name": "First Term Exams",
            "exam_type": "gpa",
            "description": "First Term examination group for testing.",
            "is_active": 1,
            "created_at": timezone.now(),
            "updated_at": timezone.now().date(),
        },
    )
    if created:
        print(f"Created Exam Group: {group.name} (ID: {group.id})")
    else:
        print(f"Exam Group already exists: {group.name} (ID: {group.id})")

    # 2. Create or get Subject
    subject, created = Subjects.objects.get_or_create(
        id=1,
        defaults={
            "name": "Mathematics",
            "code": "MATH101",
            "type": "Theory",
            "is_active": "yes",
            "created_at": timezone.now(),
            "updated_at": timezone.now().date(),
        },
    )
    if created:
        print(f"Created Subject: {subject.name} (ID: {subject.id})")
    else:
        print(f"Subject already exists: {subject.name} (ID: {subject.id})")

    # 3. Create or get Exam
    exam, created = ExamGroupClassBatchExams.objects.get_or_create(
        id=1,
        defaults={
            "exam": "First Term Class 10 Math",
            "exam_group_id": group.id,
            "session_id": 28,  # active session
            "date_from": "2026-09-01",
            "date_to": "2026-09-10",
            "passing_percentage": 33.00,
            "is_publish": 1,
            "is_active": 1,
            "description": "Term 1 Mathematics exam.",
            "created_at": timezone.now(),
            "updated_at": timezone.now().date(),
        },
    )
    if created:
        print(f"Created Class Batch Exam: {exam.exam} (ID: {exam.id})")
    else:
        print(f"Class Batch Exam already exists: {exam.exam} (ID: {exam.id})")


if __name__ == "__main__":
    seed_exams()
