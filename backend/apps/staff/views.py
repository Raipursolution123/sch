import datetime
import logging
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from django.core.files.storage import default_storage
import os
from common.pagination.standard import StandardResultsSetPagination
from common.responses.api import APIResponse
from .models.staff import Staff
from .models.department import Department
from .models.staff_designation import StaffDesignation

logger = logging.getLogger(__name__)


def _get_department_name(dept_id):
    """Resolve department name from ID."""
    if dept_id is None:
        return '—'
    try:
        return Department.objects.get(pk=dept_id).department_name
    except Department.DoesNotExist:
        return '—'


def _get_designation_name(desig_id):
    """Resolve designation name from ID."""
    if desig_id is None:
        return '—'
    try:
        return StaffDesignation.objects.get(pk=desig_id).designation
    except StaffDesignation.DoesNotExist:
        return '—'


def _format_date(d):
    if not d:
        return None
    if isinstance(d, str):
        return d
    return d.strftime('%Y-%m-%d')


def _staff_to_list_item(s):
    """Convert a Staff model instance to the list-item dict the frontend expects."""
    full_name = ' '.join(filter(None, [s.name, s.surname])).strip() or s.name
    return {
        'id': s.id,
        'employee_id': s.employee_id,
        'name': s.name,
        'surname': s.surname or '',
        'full_name': full_name,
        'email': s.email or '',
        'contact_no': s.contact_no or '',
        'gender': s.gender or '',
        'department_id': s.department,
        'department_name': _get_department_name(s.department),
        'designation_id': s.designation,
        'designation_name': _get_designation_name(s.designation),
        'date_of_joining': _format_date(s.date_of_joining),
        'is_active': 'yes' if s.is_active == 1 else 'no',
    }


def _staff_to_detail(s):
    """Convert a Staff model instance to the detail dict the frontend expects."""
    item = _staff_to_list_item(s)
    def _parse_docs(db_val, prefix):
        if not db_val: return []
        # if it's the old JSON format, parse it (migration fallback)
        if db_val.startswith('['):
            import json
            try:
                docs = json.loads(db_val)
                return docs
            except:
                pass
        paths = [p for p in str(db_val).split('|') if p.strip()]
        return [{'id': i+1, 'name': f"{prefix} {i+1}", 'file_path': p} for i, p in enumerate(paths)]

    def _parse_other_docs(paths_val, names_val):
        if not paths_val: return []
        if paths_val.startswith('['):
            import json
            try:
                return json.loads(paths_val)
            except:
                pass
        paths = [p for p in str(paths_val).split('|') if p.strip()]
        names = [n for n in str(names_val).split('|') if n.strip()]
        while len(names) < len(paths):
            names.append("Other Document")
        return [{'id': i+1, 'name': names[i], 'file_path': p} for i, p in enumerate(paths)]

    item.update({
        'qualification': s.qualification or '',
        'work_exp': s.work_exp or '',
        'father_name': s.father_name or '',
        'mother_name': s.mother_name or '',
        'emergency_contact_no': s.emergency_contact_no or '',
        'dob': _format_date(s.dob),
        'marital_status': s.marital_status or '',
        'date_of_leaving': _format_date(s.date_of_leaving),
        'local_address': s.local_address or '',
        'permanent_address': s.permanent_address or '',
        'contract_type': s.contract_type or '',
        'basic_salary': s.basic_salary,
        'note': s.note or '',
        
        'resume': _parse_docs(s.resume, "Resume"),
        'joining_letter': _parse_docs(s.joining_letter, "Joining Letter"),
        'resignation_letter': _parse_docs(s.resignation_letter, "Resignation Letter"),
        'other_documents': _parse_other_docs(s.other_document_file, s.other_document_name),
        
        'updated_at': None,
    })
    return item


class StaffListCreateView(APIView):
    """List all staff (GET) or create a new staff member (POST)."""
    permission_classes = [AllowAny]

    def get(self, request):
        user_role = (request.user.role if request.user.is_authenticated else None)
        if not user_role:
            return APIResponse.error(
                message='Authentication required. Please login first.',
                status_code=status.HTTP_401_UNAUTHORIZED,
            )

        staff_qs = Staff.objects.all().order_by('name', 'surname')
        
        paginator = StandardResultsSetPagination()
        paginated_qs = paginator.paginate_queryset(staff_qs, request, view=self)

        staff_data = [_staff_to_list_item(s) for s in (paginated_qs if paginated_qs is not None else staff_qs)]

        if paginated_qs is not None:
            return APIResponse.success(
                data={
                    'count': paginator.page.paginator.count,
                    'next': paginator.get_next_link(),
                    'previous': paginator.get_previous_link(),
                    'staff': staff_data,
                },
                message='Staff retrieved successfully.'
            )

        return APIResponse.success(
            data={'staff': staff_data},
            message='Staff retrieved successfully.',
        )

    def post(self, request):
        user_role = (request.user.role if request.user.is_authenticated else None)
        if not user_role:
            return APIResponse.error(
                message='Authentication required. Please login first.',
                status_code=status.HTTP_401_UNAUTHORIZED,
            )
        if user_role != 'Super Admin':
            return APIResponse.error(
                message='Access denied. Only Super Admins can create staff.',
                status_code=status.HTTP_403_FORBIDDEN,
            )

        data = request.data
        employee_id = data.get('employee_id')
        name = data.get('name')
        
        if not employee_id or not str(employee_id).strip():
            return APIResponse.error(message='Employee ID is required.', status_code=status.HTTP_400_BAD_REQUEST)
        if not name or not str(name).strip():
            return APIResponse.error(message='Name is required.', status_code=status.HTTP_400_BAD_REQUEST)

        if Staff.objects.filter(employee_id__iexact=str(employee_id).strip()).exists():
            return APIResponse.error(message=f"Staff with employee ID '{str(employee_id).strip()}' already exists.", status_code=status.HTTP_400_BAD_REQUEST)

        # Frontend sends department_id / designation_id; DB column is department / designation (int)
        department = data.get('department_id') or data.get('department')
        designation = data.get('designation_id') or data.get('designation')

        try:
            new_staff = Staff.objects.create(
                employee_id=str(employee_id).strip(),
                name=str(name).strip(),
                surname=data.get('surname', ''),
                father_name=data.get('father_name', ''),
                mother_name=data.get('mother_name', ''),
                email=data.get('email', ''),
                contact_no=data.get('contact_no', ''),
                emergency_contact_no=data.get('emergency_contact_no', ''),
                department=department,
                designation=designation,
                dob=data.get('dob') or None,
                marital_status=data.get('marital_status', ''),
                date_of_joining=data.get('date_of_joining') or timezone.now().date(),
                date_of_leaving=data.get('date_of_leaving') or None,
                local_address=data.get('local_address', ''),
                permanent_address=data.get('permanent_address', data.get('local_address', '')),
                gender=data.get('gender', ''),
                lang_id=data.get('lang_id', 1),
                user_id=data.get('user_id', 0),
                is_active=1 if str(data.get('is_active', 'yes')).lower() == 'yes' else 0,
                qualification=data.get('qualification', ''),
                work_exp=data.get('work_exp', ''),
                note=data.get('note', ''),
                image=data.get('image', ''),
                password=data.get('password', ''),
                account_title=data.get('account_title', ''),
                bank_account_no=data.get('bank_account_no', ''),
                bank_name=data.get('bank_name', ''),
                ifsc_code=data.get('ifsc_code', ''),
                bank_branch=data.get('bank_branch', ''),
                payscale=data.get('payscale', ''),
                epf_no=data.get('epf_no', ''),
                contract_type=data.get('contract_type', ''),
                shift=data.get('shift', ''),
                location=data.get('location', ''),
                facebook=data.get('facebook', ''),
                twitter=data.get('twitter', ''),
                linkedin=data.get('linkedin', ''),
                instagram=data.get('instagram', ''),
                resume=data.get('resume', ''),
                joining_letter=data.get('joining_letter', ''),
                resignation_letter=data.get('resignation_letter', ''),
                other_document_name=data.get('other_document_name', ''),
                other_document_file=data.get('other_document_file', ''),
                verification_code=data.get('verification_code', ''),
            )
            logger.info(f"Staff '{new_staff.name}' created by user {(request.user.username if request.user.is_authenticated else 'Unknown')}.")
            return APIResponse.success(
                data=_staff_to_detail(new_staff),
                message=f"Staff '{new_staff.name}' created successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        except Exception as e:
            logger.error(f"Error creating staff: {str(e)}")
            return APIResponse.error(message=f"Database error: {str(e)}", status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

class StaffDetailView(APIView):
    """Retrieve (GET), update (PUT/PATCH), or delete (DELETE) a staff member."""
    permission_classes = [AllowAny]

    def _get_staff(self, pk):
        try:
            return Staff.objects.get(pk=pk)
        except Staff.DoesNotExist:
            return None

    def get(self, request, pk):
        user_role = (request.user.role if request.user.is_authenticated else None)
        if not user_role:
            return APIResponse.error(message='Authentication required.', status_code=status.HTTP_401_UNAUTHORIZED)

        s = self._get_staff(pk)
        if s is None:
            return APIResponse.error(message='Staff not found.', status_code=status.HTTP_404_NOT_FOUND)

        return APIResponse.success(
            data=_staff_to_detail(s),
            message='Staff details retrieved successfully.',
        )

    def patch(self, request, pk):
        return self.put(request, pk)

    def put(self, request, pk):
        user_role = (request.user.role if request.user.is_authenticated else None)
        if not user_role:
            return APIResponse.error(message='Authentication required.', status_code=status.HTTP_401_UNAUTHORIZED)
        if user_role != 'Super Admin':
            return APIResponse.error(message='Access denied.', status_code=status.HTTP_403_FORBIDDEN)

        s = self._get_staff(pk)
        if s is None:
            return APIResponse.error(message='Staff not found.', status_code=status.HTTP_404_NOT_FOUND)

        data = request.data
        employee_id = data.get('employee_id')
        name = data.get('name')
        
        if employee_id is not None:
            emp_clean = str(employee_id).strip()
            if not emp_clean:
                return APIResponse.error(message='Employee ID cannot be empty.', status_code=status.HTTP_400_BAD_REQUEST)
            if Staff.objects.filter(employee_id__iexact=emp_clean).exclude(pk=pk).exists():
                return APIResponse.error(message=f"Staff with Employee ID '{emp_clean}' already exists.", status_code=status.HTTP_400_BAD_REQUEST)
            s.employee_id = emp_clean

        if name is not None:
            name_clean = str(name).strip()
            if not name_clean:
                return APIResponse.error(message='Name cannot be empty.', status_code=status.HTTP_400_BAD_REQUEST)
            s.name = name_clean

        # Map frontend field names to DB column names
        if 'department_id' in data:
            s.department = data['department_id']
        elif 'department' in data:
            s.department = data['department']

        if 'designation_id' in data:
            s.designation = data['designation_id']
        elif 'designation' in data:
            s.designation = data['designation']

        for field in ['surname', 'father_name', 'mother_name', 'email', 'contact_no', 'emergency_contact_no',
                      'dob', 'marital_status', 'date_of_joining', 'date_of_leaving', 'local_address',
                      'permanent_address', 'gender', 'qualification', 'work_exp', 'contract_type', 'basic_salary']:
            if field in data:
                setattr(s, field, data[field])

        if 'is_active' in data:
            s.is_active = 1 if str(data['is_active']).lower() == 'yes' else 0

        try:
            s.save()
            logger.info(f"Staff ID {pk} updated by user {(request.user.username if request.user.is_authenticated else 'Unknown')}.")
            return APIResponse.success(
                data=_staff_to_detail(s),
                message='Staff updated successfully.',
            )
        except Exception as e:
            logger.error(f"Error updating staff ID {pk}: {str(e)}")
            return APIResponse.error(message=f"Database error: {str(e)}", status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request, pk):
        user_role = (request.user.role if request.user.is_authenticated else None)
        if not user_role:
            return APIResponse.error(message='Authentication required.', status_code=status.HTTP_401_UNAUTHORIZED)
        if user_role != 'Super Admin':
            return APIResponse.error(message='Access denied.', status_code=status.HTTP_403_FORBIDDEN)

        s = self._get_staff(pk)
        if s is None:
            return APIResponse.error(message='Staff not found.', status_code=status.HTTP_404_NOT_FOUND)

        try:
            staff_name = s.name
            s.delete()
            logger.info(f"Staff '{staff_name}' (ID {pk}) deleted by user {(request.user.username if request.user.is_authenticated else 'Unknown')}.")
            return APIResponse.success(message=f"Staff '{staff_name}' deleted successfully.")
        except Exception as e:
            logger.error(f"Error deleting staff ID {pk}: {str(e)}")
            return APIResponse.error(message=f"Database error: {str(e)}", status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

class DepartmentListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        if not Department.objects.exists():
            Department.objects.bulk_create([
                Department(department_name='Teaching', is_active='yes'),
                Department(department_name='Administration', is_active='yes'),
                Department(department_name='Accounts', is_active='yes'),
            ])
        departments = Department.objects.all()
        data = [
            {'id': d.id, 'name': d.department_name}
            for d in departments
        ]
        return APIResponse.success(data=data, message='Departments retrieved successfully.')

class DesignationListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        if not StaffDesignation.objects.exists():
            StaffDesignation.objects.bulk_create([
                StaffDesignation(designation='Principal', is_active='yes'),
                StaffDesignation(designation='Teacher', is_active='yes'),
                StaffDesignation(designation='Accountant', is_active='yes'),
                StaffDesignation(designation='Librarian', is_active='yes'),
            ])
        designations = StaffDesignation.objects.all()
        data = [
            {'id': d.id, 'name': d.designation}
            for d in designations
        ]
        return APIResponse.success(data=data, message='Designations retrieved successfully.')

class StaffDocumentUploadView(APIView):
    """Upload a document for a staff member."""
    permission_classes = [AllowAny]
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, pk):
        user_role = (request.user.role if request.user.is_authenticated else None)
        if not user_role:
            return APIResponse.error(message='Authentication required.', status_code=status.HTTP_401_UNAUTHORIZED)
        if user_role != 'Super Admin':
            return APIResponse.error(message='Access denied.', status_code=status.HTTP_403_FORBIDDEN)

        try:
            staff = Staff.objects.get(pk=pk)
        except Staff.DoesNotExist:
            return APIResponse.error(message='Staff not found.', status_code=status.HTTP_404_NOT_FOUND)

        document_type = request.data.get('document_type')
        uploaded_file = request.FILES.get('file')
        document_name = request.data.get('name', '')

        if not document_type or document_type not in ['resume', 'joining_letter', 'resignation_letter', 'other_document_file']:
            return APIResponse.error(message='Invalid document type.', status_code=status.HTTP_400_BAD_REQUEST)
        if not uploaded_file:
            return APIResponse.error(message='No file provided.', status_code=status.HTTP_400_BAD_REQUEST)

        # Generate a unique filename
        ext = os.path.splitext(uploaded_file.name)[1]
        timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
        filename = f"staff_documents/{pk}_{document_type}_{timestamp}{ext}"

        try:
            # Save the file
            saved_path = default_storage.save(filename, uploaded_file)
            
            import json
            if document_type == 'other_document_file':
                # Convert other_document_file to multiple_document under the hood
                docs = []
                if staff.other_document_file and staff.other_document_file.startswith('['):
                    try:
                        docs = json.loads(staff.other_document_file)
                    except json.JSONDecodeError:
                        pass
                elif staff.other_document_file:
                    docs.append({
                        'id': 1,
                        'name': staff.other_document_name or 'Other Document',
                        'file_path': staff.other_document_file,
                        'created_at': datetime.datetime.now().isoformat()
                    })
                
                new_id = max([d.get('id', 0) for d in docs] + [0]) + 1
                doc_name = document_name or uploaded_file.name
                docs.append({
                    'id': new_id,
                    'name': doc_name,
                    'file_path': saved_path,
                    'created_at': datetime.datetime.now().isoformat()
                })
                staff.other_document_file = json.dumps(docs)
                staff.other_document_name = ''
                staff.save()
            else:
                # For resume, joining_letter, resignation_letter: append pipe-delimited paths
                current_val = getattr(staff, document_type) or ''
                if current_val:
                    new_val = f"{current_val}|{saved_path}"
                else:
                    new_val = saved_path
                setattr(staff, document_type, new_val)
                staff.save()

            return APIResponse.success(
                data={
                    'document_type': document_type,
                    'file_path': saved_path,
                    'document_name': document_name if document_type == 'other_document_file' else None,
                },
                message='Document uploaded successfully.'
            )
        except Exception as e:
            logger.error(f"Error uploading document for staff ID {pk}: {str(e)}")
            return APIResponse.error(message=f'File upload failed: {str(e)}', status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

class StaffDocumentDeleteView(APIView):
    """Delete a document for a staff member."""
    permission_classes = [AllowAny]

    def delete(self, request, pk):
        user_role = (request.user.role if request.user.is_authenticated else None)
        if not user_role:
            return APIResponse.error(message='Authentication required.', status_code=status.HTTP_401_UNAUTHORIZED)
        if user_role != 'Super Admin':
            return APIResponse.error(message='Access denied.', status_code=status.HTTP_403_FORBIDDEN)

        try:
            staff = Staff.objects.get(pk=pk)
        except Staff.DoesNotExist:
            return APIResponse.error(message='Staff not found.', status_code=status.HTTP_404_NOT_FOUND)

        document_type = request.data.get('document_type')
        document_id = request.data.get('document_id')

        import json
        if document_type == 'other_document_file':
            docs = []
            if staff.other_document_file and staff.other_document_file.startswith('['):
                try:
                    docs = json.loads(staff.other_document_file)
                except json.JSONDecodeError:
                    pass
            
            # Filter out the deleted doc
            original_len = len(docs)
            docs = [d for d in docs if str(d.get('id')) != str(document_id)]
            
            if len(docs) == original_len:
                return APIResponse.error(message='Document not found.', status_code=status.HTTP_404_NOT_FOUND)
                
            staff.other_document_file = json.dumps(docs)
            staff.save()
        elif document_type in ['resume', 'joining_letter', 'resignation_letter']:
            current_val = getattr(staff, document_type) or ''
            paths = [p for p in current_val.split('|') if p.strip()]
            
            try:
                # document_id is 1-indexed based on the array generated in _parse_docs
                idx = int(document_id) - 1
                if 0 <= idx < len(paths):
                    del paths[idx]
                    setattr(staff, document_type, '|'.join(paths))
                    staff.save()
                else:
                    return APIResponse.error(message='Document not found.', status_code=status.HTTP_404_NOT_FOUND)
            except (ValueError, TypeError):
                return APIResponse.error(message='Invalid document ID.', status_code=status.HTTP_400_BAD_REQUEST)
        else:
            return APIResponse.error(message='Invalid document type.', status_code=status.HTTP_400_BAD_REQUEST)

        return APIResponse.success(message='Document deleted successfully.')
