import os
import sys
import django
from django.utils import timezone

# Add backend directory to sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.local')
django.setup()

from apps.students.models.students import Students

def update_student():
    print("Updating test student with complete details...")
    student = Students.objects.filter(email="student1@demo.com").first()
    if not student:
        print("Error: Student not found. Run seed_test_student.py first.")
        return
        
    student.gender = "Male"
    student.dob = "2012-05-15"
    student.religion = "Hinduism"
    student.cast = "General"
    student.category_id = "1"
    student.school_house_id = 1
    
    student.father_name = "Ramesh Kumar"
    student.father_phone = "9999911111"
    student.father_occupation = "Businessman"
    
    student.mother_name = "Sita Devi"
    student.mother_phone = "9999922222"
    student.mother_occupation = "Homemaker"
    
    student.guardian_is = "father"
    student.guardian_name = "Ramesh Kumar"
    student.guardian_relation = "Father"
    student.guardian_phone = "9999911111"
    student.guardian_occupation = "Businessman"
    student.guardian_email = "ramesh@demo.com"
    student.guardian_address = "Sector 15, H.No 123, Noida, UP"
    
    student.current_address = "Sector 15, H.No 123, Noida, UP"
    student.permanent_address = "Sector 15, H.No 123, Noida, UP"
    student.pincode = "201301"
    student.city = "Noida"
    student.state = "Uttar Pradesh"
    
    student.blood_group = "O+"
    student.adhar_no = "1234-5678-9012"
    student.samagra_id = "987654321"
    student.bank_account_no = "999888777666"
    student.bank_name = "State Bank of India"
    student.ifsc_code = "SBIN0001234"
    
    student.height = "142 cm"
    student.weight = "38 kg"
    student.measurement_date = "2026-07-01"
    student.note = "Active student, good in mathematics."
    student.previous_school = "Noida Primary School"
    student.rte = "No"
    
    student.save()
    print("Student updated successfully with all fields filled!")

if __name__ == '__main__':
    update_student()
