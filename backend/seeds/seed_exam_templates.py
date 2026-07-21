import os
import sys
import django

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.development")
django.setup()

from apps.documents.models.template_admitcards import TemplateAdmitcards
from apps.examinations.models.template_marksheets import TemplateMarksheets
from django.utils import timezone

def seed_templates():
    if not TemplateAdmitcards.objects.exists():
        TemplateAdmitcards.objects.create(
            template="Standard Annual Admit Card",
            heading="ANNUAL EXAMINATION ADMIT CARD (2025-2026)",
            title="SPRINGFIELD PUBLIC SCHOOL",
            exam_name="Annual Examination 2026",
            school_name="SPRINGFIELD PUBLIC SCHOOL",
            exam_center="Main Campus Hall A & B",
            is_letter_head=1,
            is_name=1,
            is_father_name=1,
            is_mother_name=1,
            is_dob=1,
            is_admission_no=1,
            is_roll_no=1,
            is_address=1,
            is_gender=1,
            is_photo=1,
            is_class=1,
            is_section=1,
            content_footer="Note: Please bring this Admit Card along with School ID Card to the examination hall.",
            created_at=timezone.now(),
        )
        TemplateAdmitcards.objects.create(
            template="Terminal Exam Admit Card",
            heading="MID-TERM EXAMINATION ADMIT CARD",
            title="SPRINGFIELD PUBLIC SCHOOL",
            exam_name="Mid-Term Examination 2025",
            school_name="SPRINGFIELD PUBLIC SCHOOL",
            exam_center="Block C Examination Wing",
            is_letter_head=1,
            is_name=1,
            is_father_name=1,
            is_mother_name=1,
            is_dob=1,
            is_admission_no=1,
            is_roll_no=1,
            is_address=1,
            is_gender=1,
            is_photo=1,
            is_class=1,
            is_section=1,
            content_footer="Mobile phones and smartwatches are strictly prohibited.",
            created_at=timezone.now(),
        )
        print("Seeded default Admit Card Templates successfully.")

    if not TemplateMarksheets.objects.exists():
        TemplateMarksheets.objects.create(
            template="Official Annual Progress Marksheet",
            heading="ANNUAL PROGRESS REPORT CARD",
            title="SPRINGFIELD PUBLIC SCHOOL",
            exam_name="Annual Assessment 2026",
            school_name="SPRINGFIELD PUBLIC SCHOOL",
            exam_center="Main Campus",
            is_name=1,
            is_father_name=1,
            is_mother_name=1,
            is_dob=1,
            is_admission_no=1,
            is_roll_no=1,
            is_photo=1,
            is_division=1,
            is_rank=1,
            is_class=1,
            is_teacher_remark=1,
            is_section=1,
            content="Passed with Distinction",
            content_footer="Promoted to Next Higher Class.",
            created_at=timezone.now(),
        )
        TemplateMarksheets.objects.create(
            template="CBSE Pattern Comprehensive Marksheet",
            heading="COMPREHENSIVE EVALUATION REPORT",
            title="SPRINGFIELD PUBLIC SCHOOL",
            exam_name="CBSE Board Pattern Exam 2026",
            school_name="SPRINGFIELD PUBLIC SCHOOL",
            exam_center="Main Campus",
            is_name=1,
            is_father_name=1,
            is_mother_name=1,
            is_dob=1,
            is_admission_no=1,
            is_roll_no=1,
            is_photo=1,
            is_division=1,
            is_rank=1,
            is_class=1,
            is_teacher_remark=1,
            is_section=1,
            content="Excellent Performance",
            content_footer="Keep up the good work!",
            created_at=timezone.now(),
        )
        print("Seeded default Marksheet Templates successfully.")

if __name__ == "__main__":
    seed_templates()
