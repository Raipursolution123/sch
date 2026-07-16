from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.academics.api.serializers.lesson_plan import (
    SubjectSyllabusCreateSerializer,
    SubjectSyllabusSerializer,
    SubjectSyllabusUpdateSerializer,
)
from apps.academics.domain.lesson_plan_exceptions import (
    LessonPlanError,
    LessonPlanNotFoundError,
    LessonPlanValidationError,
)
from apps.academics.services.lesson_plan_service import LessonPlanService
from common.pagination.standard import StandardResultsSetPagination
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege


def _handle_exception(exc: Exception):
    if isinstance(exc, LessonPlanValidationError):
        return APIResponse.error(
            message=str(exc), status_code=status.HTTP_400_BAD_REQUEST
        )
    if isinstance(exc, LessonPlanNotFoundError):
        return APIResponse.error(
            message=str(exc), status_code=status.HTTP_404_NOT_FOUND
        )
    if isinstance(exc, LessonPlanError):
        return APIResponse.error(
            message=str(exc), status_code=status.HTTP_400_BAD_REQUEST
        )
    return APIResponse.error(
        message="An unexpected error occurred.",
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )


class SyllabusStatusListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    # The distinct permission category for the Syllabus Status module
    legacy_permission_category = "manage_syllabus_status"

    def get(self, request):
        service = LessonPlanService()
        qs = service.list_syllabus()
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(qs, request, view=self)
        rows = page if page is not None else qs
        data = SubjectSyllabusSerializer(rows, many=True).data
        if page is not None:
            return APIResponse.success(
                data={
                    "count": paginator.page.paginator.count,
                    "next": paginator.get_next_link(),
                    "previous": paginator.get_previous_link(),
                    "results": data,
                },
                message="Syllabus Status list retrieved successfully.",
            )
        return APIResponse.success(
            data=data, message="Syllabus Status list retrieved successfully."
        )

    def post(self, request):
        serializer = SubjectSyllabusCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return APIResponse.error(
                message="Invalid data",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        service = LessonPlanService()
        try:
            syllabus = service.create_syllabus(serializer.validated_data)
            return APIResponse.success(
                data=SubjectSyllabusSerializer(syllabus).data,
                message="Syllabus Status created successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        except LessonPlanError as e:
            return _handle_exception(e)


class SyllabusStatusDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_permission_category = "manage_syllabus_status"

    def get(self, request, pk):
        service = LessonPlanService()
        try:
            syllabus = service.get_syllabus(pk)
            return APIResponse.success(
                data=SubjectSyllabusSerializer(syllabus).data,
                message="Syllabus Status retrieved successfully.",
            )
        except LessonPlanError as e:
            return _handle_exception(e)

    def put(self, request, pk):
        serializer = SubjectSyllabusUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return APIResponse.error(
                message="Invalid data",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        service = LessonPlanService()
        try:
            syllabus = service.update_syllabus(pk, serializer.validated_data)
            return APIResponse.success(
                data=SubjectSyllabusSerializer(syllabus).data,
                message="Syllabus Status updated successfully.",
            )
        except LessonPlanError as e:
            return _handle_exception(e)

    patch = put

    def delete(self, request, pk):
        service = LessonPlanService()
        try:
            service.delete_syllabus(pk)
            return APIResponse.success(message="Syllabus Status deleted successfully.")
        except LessonPlanError as e:
            return _handle_exception(e)
