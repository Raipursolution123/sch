import os
import sys
import django
from django.utils import timezone

# Add backend directory to sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.local')
django.setup()

from apps.academics.models.classes import Classes
from apps.academics.models.sections import Sections
from apps.academics.models.class_sections import ClassSections
from apps.students.models.students import Students
from apps.students.models.student_session import StudentSession
from apps.accounts.models import User

def seed_student():
    print("Seeding test class, section, student, and user...")
    now = timezone.now()
    
    # 1. Create Class
    klass, created = Classes.objects.get_or_create(
        class_field="Class 10",
        defaults={
            "sort_order": 1,
            "is_active": "yes",
            "created_at": now
        }
    )
    if not created and klass.is_active != "yes":
        klass.is_active = "yes"
        klass.save()
    print(f"Class: {klass.class_field} (ID: {klass.id})")
    
    # 2. Create Section
    section, created = Sections.objects.get_or_create(
        section="A",
        defaults={
            "is_active": "yes",
            "created_at": now
        }
    )
    if not created and section.is_active != "yes":
        section.is_active = "yes"
        section.save()
    print(f"Section: {section.section} (ID: {section.id})")
    
    # 3. Map Class and Section
    cs, created = ClassSections.objects.get_or_create(
        class_id=klass.id,
        section_id=section.id,
        defaults={
            "is_active": "yes",
            "created_at": now
        }
    )
    if not created and cs.is_active != "yes":
        cs.is_active = "yes"
        cs.save()
    print(f"Class Section mapped.")
    
    # 4. Create Student
    student, created = Students.objects.get_or_create(
        admission_no="ADM101",
        defaults={
            "parent_id": 0,
            "roll_no": 101,
            "admission_date": now.date(),
            "firstname": "Rahul",
            "lastname": "Kumar",
            "rte": "no",
            "mobileno": "9876543210",
            "email": "student1@demo.com",
            "blood_group": "O+",
            "guardian_is": "father",
            "guardian_name": "Ramesh Kumar",
            "guardian_phone": "9999999999",
            "guardian_occupation": "Business",
            "height": "170",
            "weight": "60",
            "dis_reason": 0,
            "dis_note": "",
            "is_active": "yes",
            "created_at": now
        }
    )
    print(f"Student: {student.firstname} {student.lastname} (ID: {student.id})")
    
    # 5. Map to Active Session (28)
    ss, created = StudentSession.objects.get_or_create(
        student_id=student.id,
        session_id=28,
        defaults={
            "class_id": klass.id,
            "section_id": section.id,
            "is_active": "yes",
            "is_alumni": 0,
            "created_at": now
        }
    )
    print(f"StudentSession mapped to Session 28.")
    
    # 6. Create Login User
    user, created = User.objects.get_or_create(
        username="student1@demo.com",
        defaults={
            "user_id": student.id,
            "password": "student123",  # plaintext legacy password
            "role": "student",
            "lang_id": 4,
            "currency_id": 1,
            "is_active": "yes",
            "created_at": now
        }
    )
    if not created:
        user.user_id = student.id
        user.role = "student"
        user.password = "student123"
        user.is_active = "yes"
        user.save()
    print(f"User login created: username='{user.username}', password='student123', role='{user.role}'")

if __name__ == '__main__':
    seed_student()
