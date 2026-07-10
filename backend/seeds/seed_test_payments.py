import os
import sys
import django
import json
from django.utils import timezone
from decimal import Decimal

# Add backend directory to sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.local')
django.setup()

from apps.students.models.students import Students
from apps.students.models.student_session import StudentSession
from apps.students.models.student_fees_master import StudentFeesMaster
from apps.students.models.student_fees_deposite import StudentFeesDeposite
from apps.fees.models.feetype import Feetype
from apps.fees.models.fee_groups_feetype import FeeGroupsFeetype

def seed_payments():
    print("Seeding test fee payment...")
    now = timezone.now()
    
    # 1. Fetch student
    student = Students.objects.filter(email="student1@demo.com").first()
    if not student:
        print("Error: Student not found.")
        return
        
    ss = StudentSession.objects.filter(student_id=student.id, session_id=28).first()
    sfm = StudentFeesMaster.objects.filter(student_session_id=ss.id).first()
    tution_ft = Feetype.objects.filter(code="TUTION").first()
    
    fgft = FeeGroupsFeetype.objects.filter(
        fee_session_group_id=sfm.fee_session_group_id,
        feetype_id=tution_ft.id
    ).first()
    
    # 2. Prepare payment details dict
    payment_detail = {
        "1": {
            "amount": 2000.0,
            "amount_discount": 0.0,
            "amount_fine": 0.0,
            "date": now.strftime("%Y-%m-%d"),
            "description": "Part payment for Tuition Fee",
            "collected_by": "Super Admin(9000)",
            "payment_mode": "cash",
            "received_by": "1",
            "inv_no": 1
        }
    }
    
    # 3. Create StudentFeesDeposite record
    sfd, created = StudentFeesDeposite.objects.get_or_create(
        student_fees_master_id=sfm.id,
        fee_groups_feetype_id=fgft.id,
        defaults={
            "student_transport_fee_id": None,
            "amount_detail": json.dumps(payment_detail),
            "file": "",
            "is_active": "yes",
            "created_at": now
        }
    )
    if not created:
        sfd.amount_detail = json.dumps(payment_detail)
        sfd.is_active = "yes"
        sfd.student_transport_fee_id = None
        sfd.save()
        
    print(f"Recorded payment of 2000.00 for Tuition Fee (Deposite ID: {sfd.id})")
    print("Fee payments successfully seeded!")

if __name__ == '__main__':
    seed_payments()
