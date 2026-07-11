from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.staff.api.views.common import MODULE, staff_error_response
from apps.staff.domain.staff_exceptions import StaffError
from apps.staff.services.staff_service import StaffService
from common.pagination.standard import StandardResultsSetPagination
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege

CATEGORY = "staff"


class StaffListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request):
        service = StaffService()
        staff_qs = service.list_staff()
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(staff_qs, request, view=self)
        rows = page if page is not None else staff_qs
        staff_data = service.enrich_list_page(rows)

        if page is not None:
            return APIResponse.success(
                data={
                    "count": paginator.page.paginator.count,
                    "next": paginator.get_next_link(),
                    "previous": paginator.get_previous_link(),
                    "staff": staff_data,
                },
                message="Staff retrieved successfully.",
            )

        return APIResponse.success(
            data={"staff": staff_data},
            message="Staff retrieved successfully.",
        )

    def post(self, request):
        try:
            data = StaffService().create_staff(request.data)
            return APIResponse.success(
                data=data,
                message=f"Staff '{data['name']}' created successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        except StaffError as exc:
            return staff_error_response(exc)


class StaffDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request, pk):
        try:
            return APIResponse.success(
                data=StaffService().get_staff(pk),
                message="Staff details retrieved successfully.",
            )
        except StaffError as exc:
            return staff_error_response(exc)

    def patch(self, request, pk):
        return self.put(request, pk)

    def put(self, request, pk):
        try:
            data = StaffService().update_staff(pk, request.data)
            return APIResponse.success(
                data=data,
                message="Staff updated successfully.",
            )
        except StaffError as exc:
            return staff_error_response(exc)

    def delete(self, request, pk):
        try:
            staff_name = StaffService().delete_staff(pk)
            return APIResponse.success(
                message=f"Staff '{staff_name}' deleted successfully."
            )
        except StaffError as exc:
            return staff_error_response(exc)
