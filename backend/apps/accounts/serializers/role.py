from rest_framework import serializers
from apps.accounts.models.role import Role, RolePermission
from apps.accounts.models.permission import PermissionCategory, PermissionGroup

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = '__all__'
        read_only_fields = ['id', 'is_superadmin', 'created_at', 'updated_at']

class PermissionCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = PermissionCategory
        fields = '__all__'

class RolePermissionSerializer(serializers.ModelSerializer):
    permission_category_name = serializers.CharField(source='permission_category.name', read_only=True)
    permission_category_short_code = serializers.CharField(source='permission_category.short_code', read_only=True)
    enable_view = serializers.IntegerField(source='permission_category.enable_view', read_only=True)
    enable_add = serializers.IntegerField(source='permission_category.enable_add', read_only=True)
    enable_edit = serializers.IntegerField(source='permission_category.enable_edit', read_only=True)
    enable_delete = serializers.IntegerField(source='permission_category.enable_delete', read_only=True)

    class Meta:
        model = RolePermission
        fields = [
            'id', 'role', 'permission_category', 'permission_category_name', 
            'permission_category_short_code', 'can_view', 'can_add', 'can_edit', 
            'can_delete', 'enable_view', 'enable_add', 'enable_edit', 'enable_delete'
        ]
