from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.staff.api.views.common import MODULE, staff_error_response
from apps.staff.domain.staff_exceptions import StaffError
from apps.staff.models.department import Department
from apps.staff.models.staff_designation import StaffDesignation
from apps.staff.services.staff_document_service import StaffLookupService
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege


class DepartmentListView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "department"

    def get(self, request):
        try:
            data = StaffLookupService().list_departments()
            return APIResponse.success(
                data={"results": data, "count": len(data)}, message="Departments retrieved successfully."
            )
        except StaffError as exc:
            return staff_error_response(exc)

    def post(self, request):
        name = request.data.get("department_name") or request.data.get("name")
        if not name:
            return APIResponse.error(message="Department name is required.")
        dept = Department.objects.create(
            department_name=name,
            is_active="yes",
        )
        return APIResponse.success(
            data={"id": dept.id, "name": dept.department_name},
            message="Department created successfully.",
            status_code=201,
        )


class DepartmentDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "department"

    def put(self, request, pk):
        try:
            dept = Department.objects.get(pk=pk)
        except Department.DoesNotExist:
            return APIResponse.error(message="Department not found.", status_code=404)
        name = request.data.get("department_name") or request.data.get("name")
        if name:
            dept.department_name = name
            dept.save()
        return APIResponse.success(
            data={"id": dept.id, "name": dept.department_name},
            message="Department updated successfully.",
        )

    def delete(self, request, pk):
        try:
            dept = Department.objects.get(pk=pk)
            dept.delete()
            return APIResponse.success(message="Department deleted successfully.")
        except Department.DoesNotExist:
            return APIResponse.error(message="Department not found.", status_code=404)


class DesignationListView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "designation"

    def get(self, request):
        try:
            data = StaffLookupService().list_designations()
            return APIResponse.success(
                data={"results": data, "count": len(data)}, message="Designations retrieved successfully."
            )
        except StaffError as exc:
            return staff_error_response(exc)

    def post(self, request):
        name = request.data.get("designation") or request.data.get("name")
        if not name:
            return APIResponse.error(message="Designation name is required.")
        desig = StaffDesignation.objects.create(designation=name, is_active="yes")
        return APIResponse.success(
            data={"id": desig.id, "name": desig.designation},
            message="Designation created successfully.",
            status_code=201,
        )


class DesignationDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "designation"

    def put(self, request, pk):
        try:
            desig = StaffDesignation.objects.get(pk=pk)
        except StaffDesignation.DoesNotExist:
            return APIResponse.error(message="Designation not found.", status_code=404)
        name = request.data.get("designation") or request.data.get("name")
        if name:
            desig.designation = name
            desig.save()
        return APIResponse.success(
            data={"id": desig.id, "name": desig.designation},
            message="Designation updated successfully.",
        )

    def delete(self, request, pk):
        try:
            desig = StaffDesignation.objects.get(pk=pk)
            desig.delete()
            return APIResponse.success(message="Designation deleted successfully.")
        except StaffDesignation.DoesNotExist:
            return APIResponse.error(message="Designation not found.", status_code=404)
