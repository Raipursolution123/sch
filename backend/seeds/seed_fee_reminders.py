import os
import sys
import django
from django.utils import timezone

# Add backend directory to sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.local')
django.setup()

from apps.fees.models.fees_reminder import FeesReminder

def seed_fee_reminders():
    print("Seeding default fee reminders...")
    now = timezone.now()
    
    reminders = [
        {"reminder_type": "before", "day": 5, "is_active": 1},
        {"reminder_type": "before", "day": 2, "is_active": 1},
        {"reminder_type": "on", "day": 0, "is_active": 1},
        {"reminder_type": "after", "day": 3, "is_active": 1},
        {"reminder_type": "after", "day": 7, "is_active": 0},
    ]
    
    for r in reminders:
        obj, created = FeesReminder.objects.get_or_create(
            reminder_type=r["reminder_type"],
            day=r["day"],
            defaults={
                "is_active": r["is_active"],
                "created_at": now,
                "updated_at": now.date()
            }
        )
        if created:
            print(f"Created reminder rule: Type={r['reminder_type']}, Days={r['day']}, Active={r['is_active']}")
        else:
            print(f"Reminder rule already exists: Type={r['reminder_type']}, Days={r['day']}")
            
    print("Fee reminders seeding completed!")

if __name__ == '__main__':
    seed_fee_reminders()
