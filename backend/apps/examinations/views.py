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
