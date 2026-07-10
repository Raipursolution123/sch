import os
import sys
import django
from django.utils import timezone
from decimal import Decimal

# Add backend directory to sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.local')
django.setup()

from apps.students.models.students import Students
from apps.students.models.student_session import StudentSession
from apps.students.models.student_fees_master import StudentFeesMaster
from apps.fees.models.feetype import Feetype
from apps.fees.models.fee_groups import FeeGroups
from apps.fees.models.fee_session_groups import FeeSessionGroups
from apps.fees.models.fee_groups_feetype import FeeGroupsFeetype

def seed_fees():
    print("Seeding test fees...")
    now = timezone.now()
    
    # 1. Fetch student and student session
    student = Students.objects.filter(email="student1@demo.com").first()
    if not student:
        print("Error: Student student1@demo.com not found. Run seed_test_student.py first.")
        return
        
    ss = StudentSession.objects.filter(student_id=student.id, session_id=28).first()
    if not ss:
        print("Error: StudentSession not found.")
        return
        
    # 2. Create Feecategories / Feetypes
    tution_fee, _ = Feetype.objects.get_or_create(
        code="TUTION",
        defaults={
            "type": "Tuition Fee",
            "is_system": 0,
            "feecategory_id": 1,
            "is_active": "yes",
            "description": "Monthly tuition fee",
            "created_at": now
        }
    )
    print(f"Fee Type: {tution_fee.type}")
    
    exam_fee, _ = Feetype.objects.get_or_create(
        code="EXAM",
        defaults={
            "type": "Exam Fee",
            "is_system": 0,
            "feecategory_id": 1,
            "is_active": "yes",
            "description": "Semester examination fee",
            "created_at": now
        }
    )
    print(f"Fee Type: {exam_fee.type}")
    
    # 3. Create Fee Group
    fg, _ = FeeGroups.objects.get_or_create(
        name="Class 10 Fees Group",
        defaults={
            "is_system": 0,
            "description": "Standard fees for Class 10",
            "is_active": "yes",
            "created_at": now
        }
    )
    print(f"Fee Group: {fg.name}")
    
    # 4. Create Fee Session Group
    fsg, _ = FeeSessionGroups.objects.get_or_create(
        fee_groups_id=fg.id,
        session_id=28,
        defaults={
            "is_active": "yes",
            "class_id": ss.class_id,
            "created_at": now
        }
    )
    print(f"Fee Session Group created.")
    
    # 5. Create Fee Group Fee Types (Rates)
    fgft1, _ = FeeGroupsFeetype.objects.get_or_create(
        fee_session_group_id=fsg.id,
        fee_groups_id=fg.id,
        feetype_id=tution_fee.id,
        defaults={
            "session_id": 28,
            "class_id": ss.class_id,
            "amount": Decimal("5000.00"),
            "due_date": now.date() + timezone.timedelta(days=30),
            "collection_type": 1,
            "is_active": "yes",
            "created_at": now
        }
    )
    print(f"Tuition fee rate set to 5000.00")
    
    fgft2, _ = FeeGroupsFeetype.objects.get_or_create(
        fee_session_group_id=fsg.id,
        fee_groups_id=fg.id,
        feetype_id=exam_fee.id,
        defaults={
            "session_id": 28,
            "class_id": ss.class_id,
            "amount": Decimal("1200.00"),
            "due_date": now.date() + timezone.timedelta(days=15),
            "collection_type": 1,
            "is_active": "yes",
            "created_at": now
        }
    )
    print(f"Exam fee rate set to 1200.00")
    
    # 6. Assign to student via StudentFeesMaster
    sfm, created = StudentFeesMaster.objects.get_or_create(
        student_session_id=ss.id,
        fee_session_group_id=fsg.id,
        defaults={
            "is_system": 0,
            "amount": 6200.00,
            "is_active": "yes",
            "created_at": now
        }
    )
    if not created and sfm.is_active != "yes":
        sfm.is_active = "yes"
        sfm.save()
    print(f"Assigned fee group to student (StudentFeesMaster ID: {sfm.id})")
    print("Fees successfully seeded!")

if __name__ == '__main__':
    seed_fees()
