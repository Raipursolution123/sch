import logging
from django.db import transaction
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status

from apps.students.models.students import Students
from apps.students.models.student_session import StudentSession
from apps.academics.models import Classes, Sections, Sessions

from common.pagination.standard import StandardResultsSetPagination
from common.responses.api import APIResponse
from apps.accounts.services.legacy_password import hash_legacy_password

from apps.accounts.models import User

logger = logging.getLogger(__name__)

def safe_date_str(value, fmt='%Y-%m-%d'):
    """Return a date string whether value is a date/datetime object or already a string."""
    if value is None:
        return None
    if isinstance(value, str):
        return value
    try:
        return value.strftime(fmt)
    except Exception:
        return str(value)

def format_student_name(first, middle, last):
    parts = [first]
    if middle:
        parts.append(middle)
    if last:
        parts.append(last)
    return " ".join([p.strip() for p in parts if p and p.strip()])

def get_active_session():
    from apps.settings.models.sch_settings import SchSettings
    sch_setting = SchSettings.objects.first()
    if sch_setting and sch_setting.session_id:
        session = Sessions.objects.filter(id=sch_setting.session_id).first()
        if session:
            return session
    return Sessions.objects.filter(is_active='yes').first()

class ParentsTestView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT * FROM feetype")
                ft = [dict(zip([c[0] for c in cursor.description], row)) for row in cursor.fetchall()]
                cursor.execute("SELECT * FROM fee_groups_feetype ORDER BY id DESC LIMIT 5")
                fgft = [dict(zip([c[0] for c in cursor.description], row)) for row in cursor.fetchall()]
            return Response({"ft": ft, "fgft": fgft})
        except Exception as e:
            import traceback
            return Response({"error": str(e), "traceback": traceback.format_exc()})

class StudentsListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        students_qs = Students.objects.all().order_by('-id')
        
        paginator = StandardResultsSetPagination()
        paginated_qs = paginator.paginate_queryset(students_qs, request, view=self)
        
        current_page = paginated_qs if paginated_qs is not None else students_qs
        student_ids = [s.id for s in current_page]
        
        # Get active session
        active_session = get_active_session()
        
        # Get student sessions mapping
        student_sessions = []
        if active_session:
            student_sessions = StudentSession.objects.filter(
                session_id=active_session.id, 
                student_id__in=student_ids
            )
            
        session_map = {ss.student_id: ss for ss in student_sessions}
        
        class_ids = [ss.class_id for ss in student_sessions if ss.class_id]
        section_ids = [ss.section_id for ss in student_sessions if ss.section_id]
        
        classes_dict = {c.id: c.class_field for c in Classes.objects.filter(id__in=class_ids)}
        sections_dict = {s.id: s.section for s in Sections.objects.filter(id__in=section_ids)}
        
        data = []
        for student in current_page:
            ss = session_map.get(student.id)
            class_id = ss.class_id if ss else None
            section_id = ss.section_id if ss else None
            data.append({
                'id': student.id,
                'admission_no': student.admission_no,
                'roll_no': student.roll_no,
                'firstname': student.firstname,
                'middlename': student.middlename,
                'lastname': student.lastname,
                'full_name': format_student_name(student.firstname, student.middlename, student.lastname),
                'gender': student.gender,
                'mobileno': student.mobileno,
                'email': student.email,
                'dob': safe_date_str(student.dob),
                'is_active': student.is_active,
                'class_id': class_id,
                'section_id': section_id,
                'class_name': classes_dict.get(class_id) if class_id else None,
                'section_name': sections_dict.get(section_id) if section_id else None,
                'admission_date': safe_date_str(student.admission_date),
                'created_at': safe_date_str(student.created_at, '%Y-%m-%dT%H:%M:%SZ'),
            })
            
        if paginated_qs is not None:
            return paginator.get_paginated_response(data)
            
        return APIResponse.success(data=data, message='Students retrieved successfully.')

    def post(self, request):
        data = request.data
        
        admission_no = data.get('admission_no', '').strip()
        if Students.objects.filter(admission_no__iexact=admission_no).exists():
            return APIResponse.error(message='A student with this admission number already exists.')
            
        active_session = get_active_session()
        if not active_session:
            return APIResponse.error(message='No active academic session found.')
            
        class_id = data.get('class_id')
        section_id = data.get('section_id')
        
        if not class_id or not section_id:
            return APIResponse.error(message='Class and section are required.')
            
        school_class = Classes.objects.filter(id=class_id, is_active='yes').first()
        section = Sections.objects.filter(id=section_id, is_active='yes').first()
        
        if not school_class:
            return APIResponse.error(message='Selected class is not available.')
        if not section:
            return APIResponse.error(message='Selected section is not available.')
            
        try:
            with transaction.atomic():
                student = Students.objects.create(
                    parent_id=0,
                    admission_no=admission_no,
                    roll_no=data.get('roll_no') if data.get('roll_no') else None,
                    admission_date=data.get('admission_date') if data.get('admission_date') else None,
                    firstname=data.get('firstname', '').strip(),
                    middlename=data.get('middlename', '').strip() if data.get('middlename') else None,
                    lastname=data.get('lastname', '').strip(),
                    gender=data.get('gender', '').strip() if data.get('gender') else None,
                    mobileno=data.get('mobileno', '').strip() if data.get('mobileno') else None,
                    email=data.get('email', '').strip() if data.get('email') else None,
                    state=data.get('state', '').strip() if data.get('state') else None,
                    city=data.get('city', '').strip() if data.get('city') else None,
                    pincode=data.get('pincode', '').strip() if data.get('pincode') else None,
                    religion=data.get('religion', '').strip() if data.get('religion') else None,
                    cast=data.get('cast', '').strip() if data.get('cast') else None,
                    dob=data.get('dob') if data.get('dob') else None,
                    is_active=data.get('is_active', 'yes'),
                    father_name=data.get('father_name', '').strip() if data.get('father_name') else None,
                    father_phone=data.get('father_phone', '').strip() if data.get('father_phone') else None,
                    father_occupation=data.get('father_occupation', '').strip() if data.get('father_occupation') else None,
                    mother_name=data.get('mother_name', '').strip() if data.get('mother_name') else None,
                    mother_phone=data.get('mother_phone', '').strip() if data.get('mother_phone') else None,
                    mother_occupation=data.get('mother_occupation', '').strip() if data.get('mother_occupation') else None,
                    guardian_name=data.get('guardian_name', '').strip() if data.get('guardian_name') else None,
                    guardian_relation=data.get('guardian_relation', '').strip() if data.get('guardian_relation') else None,
                    guardian_phone=data.get('guardian_phone', '').strip() if data.get('guardian_phone') else None,
                    guardian_occupation=data.get('guardian_occupation', '').strip() if data.get('guardian_occupation') else '',
                    guardian_address=data.get('guardian_address', '').strip() if data.get('guardian_address') else None,
                    guardian_email=data.get('guardian_email', '').strip() if data.get('guardian_email') else None,
                    guardian_is=data.get('guardian_is', 'father').strip(),
                    current_address=data.get('current_address', '').strip() if data.get('current_address') else None,
                    permanent_address=data.get('permanent_address', '').strip() if data.get('permanent_address') else (data.get('current_address', '').strip() if data.get('current_address') else None),
                    blood_group=data.get('blood_group', '').strip() if data.get('blood_group') else '',
                    school_house_id=int(data.get('school_house_id')) if data.get('school_house_id') else None,
                    hostel_room_id=int(data.get('hostel_room_id')) if data.get('hostel_room_id') else 0,
                    room_bed_id=int(data.get('room_bed_id')) if data.get('room_bed_id') else 0,
                    adhar_no=data.get('adhar_no', '').strip() if data.get('adhar_no') else None,
                    samagra_id=data.get('samagra_id', '').strip() if data.get('samagra_id') else None,
                    bank_account_no=data.get('bank_account_no', '').strip() if data.get('bank_account_no') else None,
                    bank_name=data.get('bank_name', '').strip() if data.get('bank_name') else None,
                    ifsc_code=data.get('ifsc_code', '').strip() if data.get('ifsc_code') else None,
                    previous_school=data.get('previous_school', '').strip() if data.get('previous_school') else None,
                    height=data.get('height', '').strip() if data.get('height') else '',
                    weight=data.get('weight', '').strip() if data.get('weight') else '',
                    measurement_date=data.get('measurement_date') if data.get('measurement_date') else None,
                    note=data.get('note', '').strip() if data.get('note') else None,
                    rte=data.get('rte', 'No'),
                    created_at=timezone.now(),
                    dis_reason=0,
                    dis_note="",
                    father_pic="",
                    mother_pic="",
                    guardian_pic=""
                )
                
                # Generate student user record in users table
                User.objects.create(
                    user_id=student.id,
                    username=f"std{student.id}",
                    password=hash_legacy_password(student.mobileno if student.mobileno else "123456"),
                    childs="",
                    role="student",
                    lang_id=4,
                    currency_id=1,
                    is_active="yes",
                    created_at=timezone.now(),
                    verification_code=""
                )

                # Generate parent_id by creating a User record for the parent
                parent_user = User.objects.create(
                    user_id=student.id,
                    username=f"parent{student.id}",
                    password=hash_legacy_password(student.mobileno if student.mobileno else "123456"),
                    childs=str(student.id),
                    role="parent",
                    lang_id=4,
                    currency_id=1,
                    is_active="yes",
                    created_at=timezone.now(),
                    verification_code=""
                )
                
                # Assign the newly created parent User's ID to the student
                student.parent_id = parent_user.id
                student.save(update_fields=['parent_id'])
                
                StudentSession.objects.create(
                    session_id=active_session.id,
                    student_id=student.id,
                    class_id=class_id,
                    section_id=section_id,
                    is_alumni=0,
                    created_at=timezone.now()
                )
                
                detail = _get_student_detail(student, class_id, section_id, school_class.class_field, section.section)
                return APIResponse.success(data=detail, message='Student created successfully.')
        except Exception as e:
            logger.error(f"Error creating student: {e}")
            return APIResponse.error(message=f'Failed to create student: {str(e)}')


class StudentDetailView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request, pk):
        student = Students.objects.filter(id=pk).first()
        if not student:
            return APIResponse.error(message='Student not found.')
            
        active_session = get_active_session()
        
        class_id, section_id = None, None
        class_name, section_name = None, None
        if active_session:
            ss = StudentSession.objects.filter(session_id=active_session.id, student_id=student.id).first()
            if ss:
                class_id = ss.class_id
                section_id = ss.section_id
                if class_id:
                    c = Classes.objects.filter(id=class_id).first()
                    if c: class_name = c.class_field
                if section_id:
                    s = Sections.objects.filter(id=section_id).first()
                    if s: section_name = s.section
                    
        detail = _get_student_detail(student, class_id, section_id, class_name, section_name)
        return APIResponse.success(data=detail)

    def patch(self, request, pk):
        return self.put(request, pk)

    def put(self, request, pk):
        student = Students.objects.filter(id=pk).first()
        if not student:
            return APIResponse.error(message='Student not found.')
            
        data = request.data
        
        admission_no = data.get('admission_no', '').strip() if 'admission_no' in data else None
        if admission_no and Students.objects.exclude(id=pk).filter(admission_no__iexact=admission_no).exists():
            return APIResponse.error(message='A student with this admission number already exists.')
            
        active_session = get_active_session()
        if not active_session:
            return APIResponse.error(message='No active academic session found.')
            
        class_id = data.get('class_id')
        section_id = data.get('section_id')
        
        school_class = None
        section = None
        if class_id:
            school_class = Classes.objects.filter(id=class_id, is_active='yes').first()
            if not school_class:
                return APIResponse.error(message='Selected class is not available.')
        if section_id:
            section = Sections.objects.filter(id=section_id, is_active='yes').first()
            if not section:
                return APIResponse.error(message='Selected section is not available.')
            
        try:
            with transaction.atomic():
                if 'admission_no' in data: student.admission_no = admission_no
                if 'roll_no' in data: student.roll_no = data['roll_no']
                if 'admission_date' in data: student.admission_date = data['admission_date'] if data['admission_date'] else None
                if 'firstname' in data: student.firstname = data['firstname'].strip()
                if 'middlename' in data: student.middlename = data['middlename'].strip() if data['middlename'] else None
                if 'lastname' in data: student.lastname = data['lastname'].strip()
                if 'gender' in data: student.gender = data['gender']
                if 'mobileno' in data: student.mobileno = data['mobileno'].strip() if data['mobileno'] else None
                if 'email' in data: student.email = data['email'].strip() if data['email'] else None
                if 'state' in data: student.state = data['state'].strip() if data['state'] else None
                if 'city' in data: student.city = data['city'].strip() if data['city'] else None
                if 'pincode' in data: student.pincode = data['pincode'].strip() if data['pincode'] else None
                if 'religion' in data: student.religion = data['religion'].strip() if data['religion'] else None
                if 'cast' in data: student.cast = data['cast'].strip() if data['cast'] else None
                if 'dob' in data: student.dob = data['dob'] if data['dob'] else None
                if 'is_active' in data: student.is_active = data['is_active']
                if 'father_name' in data: student.father_name = data['father_name'].strip() if data['father_name'] else None
                if 'father_phone' in data: student.father_phone = data['father_phone'].strip() if data['father_phone'] else None
                if 'father_occupation' in data: student.father_occupation = data['father_occupation'].strip() if data['father_occupation'] else None
                if 'mother_name' in data: student.mother_name = data['mother_name'].strip() if data['mother_name'] else None
                if 'mother_phone' in data: student.mother_phone = data['mother_phone'].strip() if data['mother_phone'] else None
                if 'mother_occupation' in data: student.mother_occupation = data['mother_occupation'].strip() if data['mother_occupation'] else None
                if 'guardian_name' in data: student.guardian_name = data['guardian_name'].strip() if data['guardian_name'] else None
                if 'guardian_relation' in data: student.guardian_relation = data['guardian_relation'].strip() if data['guardian_relation'] else None
                if 'guardian_phone' in data: student.guardian_phone = data['guardian_phone'].strip() if data['guardian_phone'] else None
                if 'guardian_occupation' in data: student.guardian_occupation = data['guardian_occupation'].strip() if data['guardian_occupation'] else ''
                if 'guardian_address' in data: student.guardian_address = data['guardian_address'].strip() if data['guardian_address'] else None
                if 'guardian_email' in data: student.guardian_email = data['guardian_email'].strip() if data['guardian_email'] else None
                if 'guardian_is' in data: student.guardian_is = data['guardian_is'].strip() if data['guardian_is'] else 'father'
                if 'current_address' in data: 
                    student.current_address = data['current_address'].strip() if data['current_address'] else None
                if 'permanent_address' in data: 
                    student.permanent_address = data['permanent_address'].strip() if data['permanent_address'] else None
                elif 'current_address' in data:
                    student.permanent_address = data['current_address'].strip() if data['current_address'] else None
                if 'blood_group' in data: student.blood_group = data['blood_group'].strip() if data['blood_group'] else ''
                if 'school_house_id' in data: student.school_house_id = int(data['school_house_id']) if data['school_house_id'] else None
                if 'hostel_room_id' in data: student.hostel_room_id = int(data['hostel_room_id']) if data['hostel_room_id'] else 0
                if 'room_bed_id' in data: student.room_bed_id = int(data['room_bed_id']) if data['room_bed_id'] else 0
                if 'adhar_no' in data: student.adhar_no = data['adhar_no'].strip() if data['adhar_no'] else None
                if 'samagra_id' in data: student.samagra_id = data['samagra_id'].strip() if data['samagra_id'] else None
                if 'bank_account_no' in data: student.bank_account_no = data['bank_account_no'].strip() if data['bank_account_no'] else None
                if 'bank_name' in data: student.bank_name = data['bank_name'].strip() if data['bank_name'] else None
                if 'ifsc_code' in data: student.ifsc_code = data['ifsc_code'].strip() if data['ifsc_code'] else None
                if 'previous_school' in data: student.previous_school = data['previous_school'].strip() if data['previous_school'] else None
                if 'height' in data: student.height = data['height'].strip() if data['height'] else ''
                if 'weight' in data: student.weight = data['weight'].strip() if data['weight'] else ''
                if 'measurement_date' in data: student.measurement_date = data['measurement_date'] if data['measurement_date'] else None
                if 'note' in data: student.note = data['note'].strip() if data['note'] else None
                if 'rte' in data: student.rte = data['rte']
                
                if not student.parent_id and (student.father_name or student.mother_name or student.guardian_name):
                    parent_user = User.objects.create(
                        user_id=student.id,
                        username=f"parent{student.id}",
                        password=hash_legacy_password(student.mobileno if student.mobileno else "123456"),
                        childs=str(student.id),
                        role="parent",
                        lang_id=4,
                        currency_id=1,
                        is_active="yes",
                        created_at=timezone.now(),
                        verification_code=""
                    )
                    student.parent_id = parent_user.id

                student.updated_at = timezone.now().date()
                student.save()
                
                ss = StudentSession.objects.filter(session_id=active_session.id, student_id=student.id).first()
                if ss:
                    if class_id: ss.class_id = class_id
                    if section_id: ss.section_id = section_id
                    ss.save()
                else:
                    if class_id and section_id:
                        StudentSession.objects.create(
                            session_id=active_session.id,
                            student_id=student.id,
                            class_id=class_id,
                            section_id=section_id,
                            is_alumni=0,
                            created_at=timezone.now()
                        )
                
                class_name = school_class.class_field if school_class else (Classes.objects.filter(id=ss.class_id).first().class_field if ss and ss.class_id else None)
                section_name = section.section if section else (Sections.objects.filter(id=ss.section_id).first().section if ss and ss.section_id else None)
                
                detail = _get_student_detail(student, ss.class_id if ss else class_id, ss.section_id if ss else section_id, class_name, section_name)
                return APIResponse.success(data=detail, message='Student updated successfully.')
        except Exception as e:
            logger.error(f"Error updating student: {e}")
            return APIResponse.error(message=f'Failed to update student: {str(e)}')

    def delete(self, request, pk):
        student = Students.objects.filter(id=pk).first()
        if not student:
            return APIResponse.error(message='Student not found.')
        try:
            with transaction.atomic():
                StudentSession.objects.filter(student_id=student.id).delete()
                student.delete()
            return APIResponse.success(message='Student deleted successfully.')
        except Exception as e:
            logger.error(f"Error deleting student: {e}")
            return APIResponse.error(message='Failed to delete student.')


def _get_student_detail(student, class_id, section_id, class_name, section_name):
    return {
        'id': student.id,
        'admission_no': student.admission_no,
        'roll_no': student.roll_no,
        'firstname': student.firstname,
        'middlename': student.middlename,
        'lastname': student.lastname,
        'full_name': format_student_name(student.firstname, student.middlename, student.lastname),
        'gender': student.gender,
        'mobileno': student.mobileno,
        'email': student.email,
        'dob': safe_date_str(student.dob),
        'is_active': student.is_active,
        'class_id': class_id,
        'section_id': section_id,
        'class_name': class_name,
        'section_name': section_name,
        'admission_date': safe_date_str(student.admission_date),
        'father_name': student.father_name,
        'father_phone': student.father_phone,
        'father_occupation': student.father_occupation,
        'mother_name': student.mother_name,
        'mother_phone': student.mother_phone,
        'mother_occupation': student.mother_occupation,
        'guardian_name': student.guardian_name,
        'guardian_relation': student.guardian_relation,
        'guardian_phone': student.guardian_phone,
        'guardian_occupation': student.guardian_occupation,
        'guardian_address': student.guardian_address,
        'guardian_email': student.guardian_email,
        'guardian_is': student.guardian_is,
        'current_address': student.current_address,
        'permanent_address': student.permanent_address,
        'blood_group': student.blood_group,
        'religion': student.religion,
        'cast': student.cast,
        'category_id': student.category_id,
        'school_house_id': student.school_house_id,
        'hostel_room_id': student.hostel_room_id,
        'room_bed_id': student.room_bed_id,
        'adhar_no': student.adhar_no,
        'samagra_id': student.samagra_id,
        'bank_account_no': student.bank_account_no,
        'bank_name': student.bank_name,
        'ifsc_code': student.ifsc_code,
        'previous_school': student.previous_school,
        'height': student.height,
        'weight': student.weight,
        'measurement_date': safe_date_str(student.measurement_date),
        'note': student.note,
        'rte': student.rte,
        'created_at': safe_date_str(student.created_at, '%Y-%m-%dT%H:%M:%SZ'),
        'updated_at': safe_date_str(student.updated_at),
    }

from django.db import connection

class StudentFeesView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request, pk):
        student = Students.objects.filter(id=pk).first()
        if not student:
            return APIResponse.error(message='Student not found.', status_code=404)
            
        active_session = get_active_session()
        if not active_session:
            return APIResponse.error(message='No active session found.')
            
        ss = StudentSession.objects.filter(session_id=active_session.id, student_id=student.id).first()
        if not ss or not ss.class_id:
            return APIResponse.error(message='Student is not enrolled in a class for the active session.')
            
        school_class = Classes.objects.filter(id=ss.class_id).first()
        section = Sections.objects.filter(id=ss.section_id).first() if ss.section_id else None
        
        class_name = school_class.class_field if school_class else '—'
        section_name = section.section if section else '—'
        
        lines = []
        payments = []
        
        with connection.cursor() as cursor:
            # Get fee groups assigned to this student via student_fees_master
            cursor.execute("""
                SELECT 
                    sfm.id as student_fees_master_id,
                    fsg.id as assignment_id, 
                    fg.name as fee_group_name,
                    fgft.id as line_id,
                    fgft.feetype_id,
                    ft.code as feetype_code,
                    ft.type as feetype_name,
                    fgft.amount,
                    fgft.due_date
                FROM student_fees_master sfm
                JOIN fee_session_groups fsg ON sfm.fee_session_group_id = fsg.id
                JOIN fee_groups fg ON fsg.fee_groups_id = fg.id
                JOIN fee_groups_feetype fgft ON fgft.fee_session_group_id = fsg.id
                JOIN feetype ft ON fgft.feetype_id = ft.id
                WHERE sfm.student_session_id = %s AND sfm.is_active = 'yes'
            """, [ss.id])
            
            assigned_lines = cursor.fetchall()
            
            if assigned_lines:
                cols = [col[0] for col in cursor.description]
                assigned_lines = [dict(zip(cols, row)) for row in assigned_lines]
            else:
                assigned_lines = []
            
            # Query payments from student_fees_deposite linked via student_fees_master
            cursor.execute("""
                SELECT
                    sfd.id as deposite_id,
                    sfd.student_fees_master_id,
                    sfd.fee_groups_feetype_id,
                    sfd.amount_detail,
                    fgft.feetype_id,
                    ft.type as feetype_name,
                    ft.code as feetype_code
                FROM student_fees_deposite sfd
                JOIN student_fees_master sfm ON sfd.student_fees_master_id = sfm.id
                JOIN fee_groups_feetype fgft ON sfd.fee_groups_feetype_id = fgft.id
                JOIN feetype ft ON fgft.feetype_id = ft.id
                WHERE sfm.student_session_id = %s AND sfd.is_active = 'yes'
            """, [ss.id])
            
            deposite_rows = cursor.fetchall()
            if deposite_rows:
                import json
                for row in deposite_rows:
                    dep_id, master_id, fgft_id, amount_detail_str, feetype_id, feetype_name, feetype_code = row
                    if not amount_detail_str:
                        continue
                    try:
                        detail_dict = json.loads(amount_detail_str)
                    except Exception:
                        continue
                    
                    for trans_id, detail in detail_dict.items():
                        unique_payment_id = f"dep-{dep_id}-{trans_id}"
                        payments.append({
                            'id': unique_payment_id,
                            'deposite_id': dep_id,
                            'trans_id': trans_id,
                            'date': safe_date_str(detail.get('date')),
                            'amount': float(detail.get('amount') or 0),
                            'amount_discount': float(detail.get('amount_discount') or 0),
                            'amount_fine': float(detail.get('amount_fine') or 0),
                            'payment_mode': detail.get('payment_mode', 'Cash'),
                            'description': detail.get('description', ''),
                            'feetype_name': feetype_name,
                            'feetype_id': feetype_id,
                            'feetype_code': feetype_code,
                            'fgft_id': fgft_id
                        })
            
            print(f"DEBUG: Retrieved {len(payments)} payments from student_fees_deposite for student_session {ss.id}")
            
        # Group lines by fee_groups_feetype_id to distribute payments
        fgft_paid_map = {}
        for p in payments:
            fid = p.get('fgft_id')
            if fid:
                fgft_paid_map[fid] = fgft_paid_map.get(fid, 0) + p['amount']

        for line in assigned_lines:
            amount = float(line['amount'] or 0)
            fgft_id = line['line_id']
            
            # Distribute available paid amount to this line
            available_paid = fgft_paid_map.get(fgft_id, 0)
            amount_paid = min(amount, available_paid)
            
            # Subtract the used amount from the pool
            fgft_paid_map[fgft_id] = max(0, available_paid - amount_paid)
            
            balance = max(0, amount - amount_paid)
            
            due_date = line['due_date']
            due_date_str = safe_date_str(due_date)
            
            if balance <= 0:
                status_str = 'paid'
            elif amount_paid > 0:
                status_str = 'partial'
            else:
                status_str = 'pending'
                
            lines.append({
                'id': f"{line['assignment_id']}-{line['line_id']}",
                'feetype_id': line['feetype_id'],
                'feetype_code': line['feetype_code'],
                'feetype_name': line['feetype_name'],
                'fee_group_name': line['fee_group_name'],
                'amount': amount,
                'amount_paid': amount_paid,
                'balance': balance,
                'due_date': due_date_str,
                'status': status_str
            })
            
        total_due = sum([l['amount'] for l in lines])
        total_paid_all = sum([l['amount_paid'] for l in lines])
        total_balance = max(0, total_due - total_paid_all)
        
        return APIResponse.success(data={
            'student_id': student.id,
            'session_name': active_session.session if active_session else '—',
            'class_name': class_name,
            'section_name': section_name,
            'total_due': total_due,
            'total_paid': total_paid_all,
            'total_balance': total_balance,
            'lines': lines,
            'payments': payments
        })

    def post(self, request, pk):
        data = request.data
        amount = data.get('amount')
        feetype_id = data.get('feetype_id')
        payment_mode = data.get('payment_mode', 'Cash')
        description = data.get('description', '')
        payment_date = data.get('date')
        
        if not payment_date:
            payment_date = timezone.now().date()
        
        if not amount or not feetype_id:
            return APIResponse.error(message='Amount and Fee Type are required.')
            
        student = Students.objects.filter(id=pk).first()
        if not student:
            return APIResponse.error(message='Student not found.', status_code=404)
            
        active_session = get_active_session()
        if not active_session:
            return APIResponse.error(message='No active session found.')
            
        ss = StudentSession.objects.filter(session_id=active_session.id, student_id=student.id).first()
        if not ss:
            return APIResponse.error(message='Student is not enrolled in a class for the active session.')
            
        try:
            with transaction.atomic():
                # 1. Resolve fee_groups_feetype_id (fgft_id) and fee_session_group_id (fsg_id)
                # First check student's explicitly assigned fees
                with connection.cursor() as cursor:
                    cursor.execute("""
                        SELECT fgft.id, fgft.fee_session_group_id, sfm.id
                        FROM student_fees_master sfm
                        JOIN fee_session_groups fsg ON sfm.fee_session_group_id = fsg.id
                        JOIN fee_groups_feetype fgft ON fgft.fee_session_group_id = fsg.id
                        WHERE sfm.student_session_id = %s AND fgft.feetype_id = %s AND sfm.is_active = 'yes'
                        LIMIT 1
                    """, [ss.id, feetype_id])
                    res = cursor.fetchone()

                if res:
                    fgft_id, fsg_id, sfm_id = res
                    from apps.students.models.student_fees_master import StudentFeesMaster
                    sfm = StudentFeesMaster.objects.get(id=sfm_id)
                else:
                    # Fallback to class level
                    with connection.cursor() as cursor:
                        cursor.execute("""
                            SELECT fgft.id, fgft.fee_session_group_id
                            FROM fee_groups_feetype fgft
                            JOIN fee_session_groups fsg ON fgft.fee_session_group_id = fsg.id
                            WHERE fsg.class_id = %s AND fgft.feetype_id = %s AND fsg.is_active = 'yes'
                            LIMIT 1
                        """, [ss.class_id, feetype_id])
                        res_class = cursor.fetchone()
                    
                    if not res_class:
                        return APIResponse.error(message='Fee group configuration not found for this class and feetype.')
                    
                    fgft_id, fsg_id = res_class
                    
                    from apps.students.models.student_fees_master import StudentFeesMaster
                    sfm, created = StudentFeesMaster.objects.get_or_create(
                        student_session_id=ss.id,
                        fee_session_group_id=fsg_id,
                        defaults={
                            'is_system': 0,
                            'amount': 0.0,
                            'is_active': 'yes',
                            'created_at': timezone.now()
                        }
                    )
                
                # 3. Create or Update StudentFeesDeposite
                from apps.students.models.student_fees_deposite import StudentFeesDeposite
                import json
                
                sfd = StudentFeesDeposite.objects.filter(
                    student_fees_master_id=sfm.id,
                    fee_groups_feetype_id=fgft_id
                ).first()
                
                new_payment = {
                    "amount": float(amount),
                    "amount_discount": 0.0,
                    "amount_fine": 0.0,
                    "date": safe_date_str(payment_date),
                    "description": description,
                    "collected_by": "Super Admin(9000)",
                    "payment_mode": payment_mode.lower(),
                    "received_by": "1"
                }
                
                if sfd:
                    try:
                        detail_dict = json.loads(sfd.amount_detail) if sfd.amount_detail else {}
                    except Exception:
                        detail_dict = {}
                        
                    existing_keys = [int(k) for k in detail_dict.keys() if k.isdigit()]
                    next_key = str(max(existing_keys) + 1) if existing_keys else "1"
                    
                    new_payment["inv_no"] = int(next_key)
                    detail_dict[next_key] = new_payment
                    sfd.amount_detail = json.dumps(detail_dict)
                    sfd.save()
                else:
                    new_payment["inv_no"] = 1
                    detail_dict = {"1": new_payment}
                    sfd = StudentFeesDeposite.objects.create(
                        student_fees_master_id=sfm.id,
                        fee_groups_feetype_id=fgft_id,
                        student_transport_fee_id=None,
                        amount_detail=json.dumps(detail_dict),
                        file="",
                        is_active='yes',
                        created_at=timezone.now()
                    )
                    
            return APIResponse.success(message='Payment recorded successfully.')
        except Exception as e:
            logger.error(f"Error recording payment: {e}")
            return APIResponse.error(message=f'Failed to record payment: {str(e)}')

    def delete(self, request, pk):
        feetype_id = request.query_params.get('feetype_id')
        payment_id = request.query_params.get('payment_id')
        
        if payment_id:
            if payment_id.startswith("dep-"):
                parts = payment_id.split("-")
                if len(parts) == 3:
                    dep_id = int(parts[1])
                    trans_id = parts[2]
                    
                    from apps.students.models.student_fees_deposite import StudentFeesDeposite
                    import json
                    try:
                        with transaction.atomic():
                            sfd = StudentFeesDeposite.objects.filter(id=dep_id).first()
                            if sfd:
                                detail_dict = json.loads(sfd.amount_detail) if sfd.amount_detail else {}
                                if trans_id in detail_dict:
                                    del detail_dict[trans_id]
                                    if detail_dict:
                                        sfd.amount_detail = json.dumps(detail_dict)
                                        sfd.save()
                                    else:
                                        sfd.delete()
                                    return APIResponse.success(message='Payment deleted successfully.')
                            return APIResponse.error(message='Payment record not found.')
                    except Exception as e:
                        logger.error(f"Error deleting payment: {e}")
                        return APIResponse.error(message=f'Failed to delete payment: {str(e)}')
            else:
                # Legacy direct ID fallback
                try:
                    with connection.cursor() as cursor:
                        cursor.execute("DELETE FROM student_fees WHERE id = %s", [payment_id])
                    return APIResponse.success(message='Payment deleted successfully.')
                except Exception as e:
                    logger.error(f"Error deleting payment: {e}")
                    return APIResponse.error(message=f'Failed to delete payment: {str(e)}')
                
        if not feetype_id:
            return APIResponse.error(message='Fee type ID or Payment ID is required for reverting.')
            
        student = Students.objects.filter(id=pk).first()
        if not student:
            return APIResponse.error(message='Student not found.', status_code=404)
            
        active_session = get_active_session()
        if not active_session:
            return APIResponse.error(message='No active session found.')
            
        ss = StudentSession.objects.filter(session_id=active_session.id, student_id=student.id).first()
        if not ss:
            return APIResponse.error(message='Student is not enrolled in a class for the active session.')
            
        try:
            with transaction.atomic():
                with connection.cursor() as cursor:
                    cursor.execute("""
                        DELETE FROM student_fees_deposite 
                        WHERE student_fees_master_id IN (
                            SELECT id FROM student_fees_master WHERE student_session_id = %s
                        ) AND fee_groups_feetype_id IN (
                            SELECT id FROM fee_groups_feetype WHERE feetype_id = %s
                        )
                    """, [ss.id, feetype_id])
                
            return APIResponse.success(message='Payment reverted successfully.')
        except Exception as e:
            logger.error(f"Error reverting payment: {e}")
            return APIResponse.error(message=f'Failed to revert payment: {str(e)}')


class StudentAcademicSessionsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, student_id):
        user_role = (request.user.role if request.user.is_authenticated else None)
        if not user_role:
            return APIResponse.error(
                message='Authentication required. Please login first.',
                status_code=status.HTTP_401_UNAUTHORIZED,
            )

        student = Students.objects.filter(id=student_id).first()
        if not student:
            return APIResponse.error(
                message='Student not found.',
                status_code=status.HTTP_404_NOT_FOUND,
            )

        session_ids = StudentSession.objects.filter(student_id=student_id).values_list('session_id', flat=True).distinct()
        sessions = Sessions.objects.filter(id__in=session_ids).order_by('id')

        from apps.settings.models.sch_settings import SchSettings
        sch_setting = SchSettings.objects.first()
        active_session_id = sch_setting.session_id if sch_setting else 0

        sessions_data = []
        for s in sessions:
            sessions_data.append({
                'id': s.id,
                'session': s.session,
                'is_active': s.is_active,
                'active': s.id if s.id == active_session_id else 0,
                'created_at': s.created_at.strftime('%Y-%m-%d %H:%M:%S') if s.created_at else None,
                'updated_at': s.updated_at.strftime('%Y-%m-%d') if s.updated_at else None,
            })

        return APIResponse.success(
            data={'sessions': sessions_data},
            message='Student academic sessions retrieved successfully.'
        )

