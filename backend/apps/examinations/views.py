import logging
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny

from apps.examinations.models.exam_groups import ExamGroups
from common.pagination.standard import StandardResultsSetPagination
from common.responses.api import APIResponse

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

def serialize_exam_group(group):
    # Map IntegerField (1/0) to string ('yes'/'no') for the frontend
    is_active_str = "yes" if group.is_active == 1 else "no"
    
    return {
        'id': group.id,
        'name': group.name,
        'exam_type': group.exam_type,
        'description': group.description,
        'is_active': is_active_str,
        'created_at': safe_date_str(group.created_at, '%Y-%m-%dT%H:%M:%SZ'),
        'updated_at': safe_date_str(group.updated_at),
    }

class ExamGroupsListCreateView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            exam_groups_qs = ExamGroups.objects.all().order_by('-id')
            
            paginator = StandardResultsSetPagination()
            paginated_qs = paginator.paginate_queryset(exam_groups_qs, request, view=self)
            
            current_page = paginated_qs if paginated_qs is not None else exam_groups_qs
            data = [serialize_exam_group(group) for group in current_page]
            
            if paginated_qs is not None:
                # Instead of returning standard paginator response, we wrap it in APIResponse
                return APIResponse.success(
                    data={
                        "count": paginator.page.paginator.count,
                        "next": paginator.get_next_link(),
                        "previous": paginator.get_previous_link(),
                        "results": data
                    },
                    message="Exam groups retrieved successfully."
                )
                
            return APIResponse.success(data=data, message="Exam groups retrieved successfully.")
        except Exception as e:
            logger.error(f"Error fetching exam groups: {e}")
            return APIResponse.error(message=f"Failed to fetch exam groups: {str(e)}")

    def post(self, request):
        try:
            data = request.data
            
            # Convert 'yes'/'no' to 1/0
            is_active_val = data.get('is_active')
            if isinstance(is_active_val, str):
                is_active_val = 1 if is_active_val.lower() == 'yes' else 0
            elif is_active_val is None:
                is_active_val = 1
                
            exam_group = ExamGroups.objects.create(
                name=data.get('name'),
                exam_type=data.get('exam_type'),
                description=data.get('description'),
                is_active=is_active_val,
                created_at=timezone.now(),
                updated_at=timezone.now().date(),
            )
            
            return APIResponse.success(
                data=serialize_exam_group(exam_group), 
                message="Exam group created successfully.", 
                status_code=201
            )
        except Exception as e:
            logger.error(f"Error creating exam group: {e}")
            return APIResponse.error(message=f"Failed to create exam group: {str(e)}")


class ExamGroupsDetailView(APIView):
    permission_classes = [AllowAny]

    def get_object(self, pk):
        return ExamGroups.objects.filter(id=pk).first()

    def get(self, request, pk):
        try:
            exam_group = self.get_object(pk)
            if not exam_group:
                return APIResponse.error(message="Exam group not found.", status_code=404)
                
            return APIResponse.success(
                data=serialize_exam_group(exam_group), 
                message="Exam group retrieved successfully."
            )
        except Exception as e:
            logger.error(f"Error fetching exam group: {e}")
            return APIResponse.error(message=f"Failed to fetch exam group: {str(e)}")

    def put(self, request, pk):
        try:
            exam_group = self.get_object(pk)
            if not exam_group:
                return APIResponse.error(message="Exam group not found.", status_code=404)
                
            data = request.data
            
            if 'name' in data: exam_group.name = data['name']
            if 'exam_type' in data: exam_group.exam_type = data['exam_type']
            if 'description' in data: exam_group.description = data['description']
            if 'is_active' in data: 
                is_active_val = data['is_active']
                if isinstance(is_active_val, str):
                    exam_group.is_active = 1 if is_active_val.lower() == 'yes' else 0
                else:
                    exam_group.is_active = is_active_val
            
            exam_group.updated_at = timezone.now().date()
            exam_group.save()
            
            return APIResponse.success(
                data=serialize_exam_group(exam_group), 
                message="Exam group updated successfully."
            )
        except Exception as e:
            logger.error(f"Error updating exam group: {e}")
            return APIResponse.error(message=f"Failed to update exam group: {str(e)}")

    patch = put

    def delete(self, request, pk):
        try:
            exam_group = self.get_object(pk)
            if not exam_group:
                return APIResponse.error(message="Exam group not found.", status_code=404)
                
            exam_group.delete()
            return APIResponse.success(message="Exam group deleted successfully.")
        except Exception as e:
            logger.error(f"Error deleting exam group: {e}")
            return APIResponse.error(message=f"Failed to delete exam group: {str(e)}")

from apps.examinations.models.exam_group_class_batch_exams import ExamGroupClassBatchExams

def serialize_exam(exam):
    is_active_str = "yes" if exam.is_active == 1 else "no"
    is_published = bool(exam.is_publish == 1)

    return {
        'id': exam.id,
        'name': exam.exam, # The model uses 'exam' for the name
        'exam_group_id': exam.exam_group_id,
        'session_id': exam.session_id,
        'date_from': safe_date_str(exam.date_from),
        'date_to': safe_date_str(exam.date_to),
        'passing_percentage': exam.passing_percentage,
        'is_published': is_published,
        'is_active': is_active_str,
        'description': exam.description,
        'created_at': safe_date_str(exam.created_at, '%Y-%m-%dT%H:%M:%SZ'),
        'updated_at': safe_date_str(exam.updated_at),
    }

class ExamsListCreateView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            exams_qs = ExamGroupClassBatchExams.objects.all().order_by('-id')
            
            paginator = StandardResultsSetPagination()
            paginated_qs = paginator.paginate_queryset(exams_qs, request, view=self)
            
            current_page = paginated_qs if paginated_qs is not None else exams_qs
            data = [serialize_exam(exam) for exam in current_page]
            
            if paginated_qs is not None:
                return APIResponse.success(
                    data={
                        "count": paginator.page.paginator.count,
                        "next": paginator.get_next_link(),
                        "previous": paginator.get_previous_link(),
                        "results": data
                    },
                    message="Exams retrieved successfully."
                )
                
            return APIResponse.success(data=data, message="Exams retrieved successfully.")
        except Exception as e:
            logger.error(f"Error fetching exams: {e}")
            return APIResponse.error(message=f"Failed to fetch exams: {str(e)}")

    def post(self, request):
        try:
            data = request.data
            
            is_active_val = data.get('is_active')
            if isinstance(is_active_val, str):
                is_active_val = 1 if is_active_val.lower() == 'yes' else 0
            elif is_active_val is None:
                is_active_val = 1
                
            is_publish_val = 1 if data.get('is_published') else 0
            
            exam = ExamGroupClassBatchExams.objects.create(
                exam=data.get('name'),
                exam_group_id=data.get('exam_group_id'),
                session_id=data.get('session_id'),
                date_from=data.get('date_from'),
                date_to=data.get('date_to'),
                passing_percentage=data.get('passing_percentage'),
                is_publish=is_publish_val,
                description=data.get('description'),
                is_active=is_active_val,
                created_at=timezone.now(),
                updated_at=timezone.now().date(),
            )
            
            return APIResponse.success(
                data=serialize_exam(exam), 
                message="Exam created successfully.", 
                status_code=201
            )
        except Exception as e:
            logger.error(f"Error creating exam: {e}")
            return APIResponse.error(message=f"Failed to create exam: {str(e)}")


class ExamsDetailView(APIView):
    permission_classes = [AllowAny]

    def get_object(self, pk):
        return ExamGroupClassBatchExams.objects.filter(id=pk).first()

    def get(self, request, pk):
        try:
            exam = self.get_object(pk)
            if not exam:
                return APIResponse.error(message="Exam not found.", status_code=404)
                
            return APIResponse.success(
                data=serialize_exam(exam), 
                message="Exam retrieved successfully."
            )
        except Exception as e:
            logger.error(f"Error fetching exam: {e}")
            return APIResponse.error(message=f"Failed to fetch exam: {str(e)}")

    def put(self, request, pk):
        try:
            exam = self.get_object(pk)
            if not exam:
                return APIResponse.error(message="Exam not found.", status_code=404)
                
            data = request.data
            
            if 'name' in data: exam.exam = data['name']
            if 'exam_group_id' in data: exam.exam_group_id = data['exam_group_id']
            if 'session_id' in data: exam.session_id = data['session_id']
            if 'date_from' in data: exam.date_from = data['date_from']
            if 'date_to' in data: exam.date_to = data['date_to']
            if 'passing_percentage' in data: exam.passing_percentage = data['passing_percentage']
            if 'is_published' in data: exam.is_publish = 1 if data['is_published'] else 0
            if 'description' in data: exam.description = data['description']
            if 'is_active' in data: 
                is_active_val = data['is_active']
                if isinstance(is_active_val, str):
                    exam.is_active = 1 if is_active_val.lower() == 'yes' else 0
                else:
                    exam.is_active = is_active_val
            
            exam.updated_at = timezone.now().date()
            exam.save()
            
            return APIResponse.success(
                data=serialize_exam(exam), 
                message="Exam updated successfully."
            )
        except Exception as e:
            logger.error(f"Error updating exam: {e}")
            return APIResponse.error(message=f"Failed to update exam: {str(e)}")

    patch = put

    def delete(self, request, pk):
        try:
            exam = self.get_object(pk)
            if not exam:
                return APIResponse.error(message="Exam not found.", status_code=404)
                
            exam.delete()
            return APIResponse.success(message="Exam deleted successfully.")
        except Exception as e:
            logger.error(f"Error deleting exam: {e}")
            return APIResponse.error(message=f"Failed to delete exam: {str(e)}")
