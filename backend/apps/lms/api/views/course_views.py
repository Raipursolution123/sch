from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.lms.domain.lms_exceptions import LMSError, CourseNotFoundError
from apps.lms.services.course_service import CourseService
from common.exceptions.legacy_errors import legacy_domain_error_response
from common.pagination.standard import StandardResultsSetPagination
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege


def lms_error_response(exc: LMSError):
    return legacy_domain_error_response(exc, not_found_type=CourseNotFoundError)


class CourseListView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = "lms"
    legacy_permission_category = "online_course"

    def get(self, request):
        service = CourseService()
        qs = service.list_courses()
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(qs, request, view=self)
        
        # Serialize the subset
        from apps.lms.api.serializers.course_serializers import CourseSerializer
        rows = list(page if page is not None else qs)
        data = CourseSerializer(rows, many=True).data
        
        if page is not None:
            return paginator.get_paginated_response(data)
        
        return APIResponse.success(
            data=data, message="Courses retrieved successfully."
        )

    def post(self, request):
        try:
            # We assume user is authenticated and has an id
            user_id = getattr(request.user, "id", 0)
            data = CourseService().create_course(request.data, user_id=user_id)
            return APIResponse.success(
                data=data,
                message="Course created successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        except LMSError as exc:
            return lms_error_response(exc)


class CourseDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = "lms"
    legacy_permission_category = "online_course"

    def get(self, request, pk):
        try:
            data = CourseService().get_course(pk)
            return APIResponse.success(
                data=data, message="Course retrieved successfully."
            )
        except LMSError as exc:
            return lms_error_response(exc)

    def put(self, request, pk):
        try:
            data = CourseService().update_course(pk, request.data)
            return APIResponse.success(
                data=data, message="Course updated successfully."
            )
        except LMSError as exc:
            return lms_error_response(exc)

    def patch(self, request, pk):
        return self.put(request, pk)

    def delete(self, request, pk):
        try:
            CourseService().delete_course(pk)
            return APIResponse.success(message="Course deleted successfully.")
        except LMSError as exc:
            return lms_error_response(exc)
