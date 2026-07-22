from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.utils import timezone
from apps.accounts.models.role import Role, RolePermission
from apps.accounts.models.permission import PermissionCategory
from apps.accounts.serializers.role import RoleSerializer, RolePermissionSerializer
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege

MODULE = "system_settings"
CATEGORY = "notification_setting" # General settings category for settings access

class RolesListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request):
        roles = Role.objects.all().order_by('id')
        serializer = RoleSerializer(roles, many=True)
        return APIResponse.success(data=serializer.data, message="Roles retrieved successfully.")

    def post(self, request):
        serializer = RoleSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(
                created_at=timezone.now(),
                is_active=1
            )
            return APIResponse.success(data=serializer.data, message="Role created successfully.", status_code=status.HTTP_201_CREATED)
        return APIResponse.error(message="Validation Error", details=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)

class RoleDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request, pk):
        try:
            role = Role.objects.get(pk=pk)
        except Role.DoesNotExist:
            return APIResponse.error(message="Role not found.", status_code=status.HTTP_404_NOT_FOUND)

        serializer = RoleSerializer(role)
        return APIResponse.success(data=serializer.data, message="Role details retrieved.")

    def put(self, request, pk):
        try:
            role = Role.objects.get(pk=pk)
        except Role.DoesNotExist:
            return APIResponse.error(message="Role not found.", status_code=status.HTTP_404_NOT_FOUND)

        serializer = RoleSerializer(role, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save(updated_at=timezone.now().date())
            return APIResponse.success(data=serializer.data, message="Role updated successfully.")
        return APIResponse.error(message="Validation Error", details=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        try:
            role = Role.objects.get(pk=pk)
        except Role.DoesNotExist:
            return APIResponse.error(message="Role not found.", status_code=status.HTTP_404_NOT_FOUND)

        if role.is_system == 1 or role.is_superadmin == 1:
            return APIResponse.error(message="System protected roles cannot be deleted.", status_code=status.HTTP_400_BAD_REQUEST)

        role.delete()
        return APIResponse.success(message="Role deleted successfully.")

class RolePermissionsView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request, role_id):
        try:
            role = Role.objects.get(pk=role_id)
        except Role.DoesNotExist:
            return APIResponse.error(message="Role not found.", status_code=status.HTTP_404_NOT_FOUND)

        categories = PermissionCategory.objects.all().order_by('name')
        grid = []
        for cat in categories:
            perm = RolePermission.objects.filter(role=role, permission_category=cat).first()
            if not perm:
                perm = RolePermission(
                    role=role,
                    permission_category=cat,
                    can_view=0,
                    can_add=0,
                    can_edit=0,
                    can_delete=0,
                    created_at=timezone.now()
                )
            grid.append(perm)

        serializer = RolePermissionSerializer(grid, many=True)
        return APIResponse.success(data=serializer.data, message="Role permissions retrieved.")

    def put(self, request, role_id):
        try:
            role = Role.objects.get(pk=role_id)
        except Role.DoesNotExist:
            return APIResponse.error(message="Role not found.", status_code=status.HTTP_404_NOT_FOUND)

        permissions_list = request.data.get('permissions', [])
        for item in permissions_list:
            cat_id = item.get('permission_category')
            if not cat_id:
                continue

            try:
                cat = PermissionCategory.objects.get(pk=cat_id)
            except PermissionCategory.DoesNotExist:
                continue

            perm, created = RolePermission.objects.get_or_create(
                role=role,
                permission_category=cat,
                defaults={'created_at': timezone.now()}
            )

            perm.can_view = 1 if item.get('can_view') else 0
            perm.can_add = 1 if item.get('can_add') else 0
            perm.can_edit = 1 if item.get('can_edit') else 0
            perm.can_delete = 1 if item.get('can_delete') else 0
            perm.save()

        return APIResponse.success(message="Role permissions updated successfully.")
