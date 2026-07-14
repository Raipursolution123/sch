from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.examinations.api.views.common import MODULE, examination_error_response
from apps.examinations.domain.examination_exceptions import ExaminationError
from apps.examinations.selectors.examination_selectors import exam_group_to_dict
from apps.examinations.services.exam_group_service import ExamGroupService
from common.pagination.standard import StandardResultsSetPagination
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege

CATEGORY = "exam_group"


class ExamGroupsListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request):
        qs = ExamGroupService().list_groups()
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(qs, request, view=self)
        rows = page if page is not None else qs
        data = [exam_group_to_dict(group) for group in rows]
        if page is not None:
            return APIResponse.success(
                data={
                    "count": paginator.page.paginator.count,
                    "next": paginator.get_next_link(),
                    "previous": paginator.get_previous_link(),
                    "results": data,
                },
                message="Exam groups retrieved successfully.",
            )
        return APIResponse.success(
            data=data, message="Exam groups retrieved successfully."
        )

    def post(self, request):
        try:
            data = ExamGroupService().create_group(request.data)
            return APIResponse.success(
                data=data,
                message="Exam group created successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        except ExaminationError as exc:
            return examination_error_response(exc)


class ExamGroupsDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request, pk):
        try:
            return APIResponse.success(
                data=ExamGroupService().get_group(pk),
                message="Exam group retrieved successfully.",
            )
        except ExaminationError as exc:
            return examination_error_response(exc)

    def put(self, request, pk):
        try:
            data = ExamGroupService().update_group(pk, request.data)
            return APIResponse.success(
                data=data, message="Exam group updated successfully."
            )
        except ExaminationError as exc:
            return examination_error_response(exc)

    patch = put

    def delete(self, request, pk):
        try:
            ExamGroupService().delete_group(pk)
            return APIResponse.success(message="Exam group deleted successfully.")
        except ExaminationError as exc:
            return examination_error_response(exc)
