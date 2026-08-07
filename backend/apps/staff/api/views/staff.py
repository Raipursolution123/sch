from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.staff.api.views.common import MODULE, staff_error_response
from apps.staff.domain.staff_exceptions import StaffError, StaffValidationError
from apps.staff.services.staff_service import StaffService
from common.pagination.standard import StandardResultsSetPagination
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege

CATEGORY = "staff"
DISABLE_CATEGORY = "disable_staff"


class StaffListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def initial(self, request, *args, **kwargs):
        status_filter = request.query_params.get("status", "active")
        if status_filter == "disabled" and request.method == "GET":
            self.legacy_permission_category = DISABLE_CATEGORY
        else:
            self.legacy_permission_category = CATEGORY
        super().initial(request, *args, **kwargs)

    def get(self, request):
        status_filter = request.query_params.get("status", "active")
        if status_filter not in {"active", "disabled", "all"}:
            return APIResponse.error(
                message="Invalid status filter. Use active, disabled, or all.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        service = StaffService()
        staff_qs = service.list_staff(
            search=request.query_params.get("search"),
            status=status_filter,
        )
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

    def _parse_pk(self, pk) -> int:
        try:
            return int(str(pk).lstrip(":"))
        except ValueError:
            raise StaffValidationError("Invalid staff ID format.")

    def get(self, request, pk):
        try:
            staff_id = self._parse_pk(pk)
            return APIResponse.success(
                data=StaffService().get_staff(staff_id),
                message="Staff details retrieved successfully.",
            )
        except StaffError as exc:
            return staff_error_response(exc)

    def patch(self, request, pk):
        return self.put(request, pk)

    def put(self, request, pk):
        try:
            staff_id = self._parse_pk(pk)
            data = StaffService().update_staff(staff_id, request.data)
            return APIResponse.success(
                data=data,
                message="Staff updated successfully.",
            )
        except StaffError as exc:
            return staff_error_response(exc)

    def delete(self, request, pk):
        try:
            staff_id = self._parse_pk(pk)
            staff_name = StaffService().delete_staff(staff_id)
            return APIResponse.success(
                message=f"Staff '{staff_name}' deleted successfully."
            )
        except StaffError as exc:
            return staff_error_response(exc)
