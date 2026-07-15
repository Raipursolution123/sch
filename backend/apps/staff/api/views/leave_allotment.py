from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.staff.api.views.common import MODULE, staff_error_response
from apps.staff.domain.staff_exceptions import StaffError
from apps.staff.services.staff_leave_allotment_service import StaffLeaveAllotmentService
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege

# SoftSchool stores allotments on staff edit; gate under staff privilege.
CATEGORY = "staff"


class StaffLeaveAllotmentRosterView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request):
        staff_id = request.query_params.get("staff_id")
        if not staff_id:
            return APIResponse.error(
                message="staff_id is required.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        try:
            data = StaffLeaveAllotmentService().get_roster(int(staff_id))
            return APIResponse.success(
                data=data, message="Leave allotment roster retrieved successfully."
            )
        except StaffError as exc:
            return staff_error_response(exc)
        except (TypeError, ValueError):
            return APIResponse.error(
                message="staff_id must be a valid integer.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )


class StaffLeaveAllotmentsView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request):
        staff_id = request.query_params.get("staff_id")
        parsed = None
        if staff_id not in (None, ""):
            try:
                parsed = int(staff_id)
            except (TypeError, ValueError):
                return APIResponse.error(
                    message="staff_id must be a valid integer.",
                    status_code=status.HTTP_400_BAD_REQUEST,
                )
        data = StaffLeaveAllotmentService().list_allotments(parsed)
        return APIResponse.success(
            data=data, message="Leave allotments retrieved successfully."
        )

    def post(self, request):
        try:
            if isinstance(request.data.get("entries"), list):
                data = StaffLeaveAllotmentService().save_roster(
                    staff_id=int(request.data.get("staff_id")),
                    entries=list(request.data.get("entries") or []),
                )
                return APIResponse.success(
                    data=data,
                    message="Leave allotments saved successfully.",
                )
            data = StaffLeaveAllotmentService().upsert_allotment(request.data)
            return APIResponse.success(
                data=data,
                message="Leave allotment saved successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        except StaffError as exc:
            return staff_error_response(exc)
        except (TypeError, ValueError):
            return APIResponse.error(
                message="Invalid allotment payload.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )


class StaffLeaveAllotmentDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY
    legacy_method_actions = {"DELETE": "can_delete"}

    def delete(self, request, pk):
        try:
            StaffLeaveAllotmentService().delete_allotment(pk)
            return APIResponse.success(message="Leave allotment deleted successfully.")
        except StaffError as exc:
            return staff_error_response(exc)
