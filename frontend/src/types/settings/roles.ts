export interface RoleSummary {
  id: number;
  name: string;
  slug: string;
  is_active: boolean;
  is_system: boolean;
  is_superadmin: boolean;
}

export interface RolePermissionCategory {
  id: number;
  name: string;
  short_code: string;
  enable_view: boolean;
  enable_add: boolean;
  enable_edit: boolean;
  enable_delete: boolean;
  can_view: boolean;
  can_add: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

export interface RolePermissionGroup {
  id: number;
  name: string;
  short_code: string;
  categories: RolePermissionCategory[];
}

export interface RoleDetail extends RoleSummary {
  permission_groups: RolePermissionGroup[];
}

export interface RolePermissionUpdateItem {
  perm_cat_id: number;
  can_view: boolean;
  can_add: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

export interface UpdateRolePermissionsPayload {
  permissions: RolePermissionUpdateItem[];
}

export interface StaffUserAccount {
  id: number;
  username: string;
  is_active: boolean;
  staff_id: number;
  staff_name: string;
  employee_id: string;
  email: string;
  role_id: number | null;
  role_name: string;
  role_slug: string;
  is_superadmin_role: boolean;
}

export interface UpdateStaffUserPayload {
  is_active?: boolean;
  role_id?: number;
}
