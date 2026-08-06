import django
import os
import sys
from django.utils import timezone

# Setup django environment
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.local")
django.setup()

from apps.students.models.student_behaviour import StudentBehaviour
from apps.students.models.student_incidents import StudentIncidents
from apps.settings.models.behaviour_settings import BehaviourSettings
from apps.students.models.students import Students
from apps.staff.models import Staff
from apps.academics.selectors.session_selectors import get_current_session

def seed():
    print("Seeding Behavioural Record database...")
    
    # 1. Create Behaviour Settings if not exists
    setting, created = BehaviourSettings.objects.get_or_create(id=1)
    setting.comment_option = '["Great","Helpful","Late"]'
    setting.save()
    print(f"Behaviour Settings updated. Created: {created}")

    # 2. Create sample incidents
    incidents_data = [
        {"title": "Academic Excellence", "point": 10, "description": "Outstanding performance in academic tests or assignments."},
        {"title": "Helping Peers", "point": 5, "description": "Voluntarily helping other students understand complex topics."},
        {"title": "Classroom Disruption", "point": -5, "description": "Continuously talking or disrupting the class environment."},
        {"title": "Late Submission", "point": -3, "description": "Submitting assignments after the due date without prior permission."},
        {"title": "Good Citizenship", "point": 8, "description": "Showing high moral values, honesty, and care for school property."},
    ]

    for item in incidents_data:
        inc, created = StudentBehaviour.objects.get_or_create(
            title=item["title"],
            defaults={"point": item["point"], "description": item["description"], "created_at": timezone.now()}
        )
        if not created:
            inc.point = item["point"]
            inc.description = item["description"]
            inc.save()
        print(f"Incident '{item['title']}' seeded. Created: {created}")

    # 3. Assign incidents to some active students
    active_sess = get_current_session()
    if not active_sess:
        print("No active academic session found. Skipping incident assignments.")
        return

    students = Students.objects.filter(is_active="yes")[:5]
    staff = Staff.objects.all().first()
    staff_id = staff.id if staff else 1

    if not students:
        print("No active students found to assign incidents. Please add students first.")
        return

    all_incidents = list(StudentBehaviour.objects.all())
    if not all_incidents:
        return

    import random
    for student in students:
        # Assign 1-2 random incidents
        for _ in range(random.randint(1, 2)):
            incident = random.choice(all_incidents)
            assignment = StudentIncidents(
                session_id=active_sess.id,
                student_id=student.id,
                incident_id=incident.id,
                assign_by=staff_id,
                created_at=timezone.now()
            )
            assignment.save()
            print(f"Assigned incident '{incident.title}' to student '{student.firstname} {student.lastname}'")

    print("Seeding complete!")

if __name__ == "__main__":
    seed()
