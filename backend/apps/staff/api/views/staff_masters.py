from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.staff.api.views.common import MODULE, staff_error_response
from apps.staff.domain.staff_exceptions import StaffError
from apps.staff.services.department_designation_service import (
    DepartmentService,
    DesignationService,
)
from apps.staff.services.staff_attendance_service import StaffAttendanceService
from apps.staff.services.staff_payroll_service import StaffPayrollService
from common.pagination.standard import StandardResultsSetPagination
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege


def _paginated(request, view, rows, message: str):
    paginator = StandardResultsSetPagination()
    page = paginator.paginate_queryset(rows, request, view=view)
    data = page if page is not None else rows
    if page is not None:
        return paginator.get_paginated_response(data)
    return APIResponse.success(data=data, message=message)


class DepartmentListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "department"

    def get(self, request):
        rows = DepartmentService().list(query=request.query_params.get("q"))
        return _paginated(request, self, rows, "Departments retrieved.")

    def post(self, request):
        try:
            data = DepartmentService().create(request.data)
            return APIResponse.success(
                data=data,
                message="Department created.",
                status_code=status.HTTP_201_CREATED,
            )
        except StaffError as exc:
            return staff_error_response(exc)


class DepartmentDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "department"

    def get(self, request, pk):
        try:
            return APIResponse.success(data=DepartmentService().get(pk))
        except StaffError as exc:
            return staff_error_response(exc)

    def patch(self, request, pk):
        return self.put(request, pk)

    def put(self, request, pk):
        try:
            return APIResponse.success(
                data=DepartmentService().update(pk, request.data)
            )
        except StaffError as exc:
            return staff_error_response(exc)

    def delete(self, request, pk):
        try:
            DepartmentService().delete(pk)
            return APIResponse.success(message="Department deleted.")
        except StaffError as exc:
            return staff_error_response(exc)


class DesignationListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "designation"

    def get(self, request):
        rows = DesignationService().list(query=request.query_params.get("q"))
        return _paginated(request, self, rows, "Designations retrieved.")

    def post(self, request):
        try:
            data = DesignationService().create(request.data)
            return APIResponse.success(
                data=data,
                message="Designation created.",
                status_code=status.HTTP_201_CREATED,
            )
        except StaffError as exc:
            return staff_error_response(exc)


class DesignationDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "designation"

    def get(self, request, pk):
        try:
            return APIResponse.success(data=DesignationService().get(pk))
        except StaffError as exc:
            return staff_error_response(exc)

    def patch(self, request, pk):
        return self.put(request, pk)

    def put(self, request, pk):
        try:
            return APIResponse.success(
                data=DesignationService().update(pk, request.data)
            )
        except StaffError as exc:
            return staff_error_response(exc)

    def delete(self, request, pk):
        try:
            DesignationService().delete(pk)
            return APIResponse.success(message="Designation deleted.")
        except StaffError as exc:
            return staff_error_response(exc)


class StaffAttendanceTypesView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "staff_attendance"

    def get(self, request):
        return APIResponse.success(
            data=StaffAttendanceService().list_types(),
            message="Staff attendance types retrieved.",
        )


class StaffAttendanceRosterView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "staff_attendance"

    def get(self, request):
        try:
            data = StaffAttendanceService().get_roster(
                date_str=request.query_params.get("date") or ""
            )
            return APIResponse.success(data=data, message="Staff attendance roster.")
        except StaffError as exc:
            return staff_error_response(exc)


class StaffAttendanceMarkView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "staff_attendance"

    def post(self, request):
        try:
            data = StaffAttendanceService().mark(request.data)
            return APIResponse.success(data=data, message="Staff attendance saved.")
        except StaffError as exc:
            return staff_error_response(exc)


class StaffPayrollScaleListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "staff_payroll"

    def get(self, request):
        rows = StaffPayrollService().list_scales(query=request.query_params.get("q"))
        return _paginated(request, self, rows, "Pay scales retrieved.")

    def post(self, request):
        try:
            data = StaffPayrollService().create_scale(request.data)
            return APIResponse.success(
                data=data,
                message="Pay scale created.",
                status_code=status.HTTP_201_CREATED,
            )
        except StaffError as exc:
            return staff_error_response(exc)


class StaffPayrollScaleDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "staff_payroll"

    def get(self, request, pk):
        try:
            return APIResponse.success(data=StaffPayrollService().get_scale(pk))
        except StaffError as exc:
            return staff_error_response(exc)

    def patch(self, request, pk):
        return self.put(request, pk)

    def put(self, request, pk):
        try:
            return APIResponse.success(
                data=StaffPayrollService().update_scale(pk, request.data)
            )
        except StaffError as exc:
            return staff_error_response(exc)

    def delete(self, request, pk):
        try:
            StaffPayrollService().delete_scale(pk)
            return APIResponse.success(message="Pay scale deleted.")
        except StaffError as exc:
            return staff_error_response(exc)


class StaffPayslipListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "staff_payroll"

    def get(self, request):
        staff_id = request.query_params.get("staff_id")
        parsed = int(staff_id) if staff_id not in (None, "") else None
        rows = StaffPayrollService().list_payslips(
            query=request.query_params.get("q"), staff_id=parsed
        )
        return _paginated(request, self, rows, "Payslips retrieved.")

    def post(self, request):
        generated_by = getattr(request.user, "user_id", None)
        try:
            data = StaffPayrollService().create_payslip(
                request.data, generated_by=int(generated_by or 0) or None
            )
            return APIResponse.success(
                data=data,
                message="Payslip created.",
                status_code=status.HTTP_201_CREATED,
            )
        except StaffError as exc:
            return staff_error_response(exc)


class StaffPayslipDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "staff_payroll"

    def delete(self, request, pk):
        try:
            StaffPayrollService().delete_payslip(pk)
            return APIResponse.success(message="Payslip deleted.")
        except StaffError as exc:
            return staff_error_response(exc)
