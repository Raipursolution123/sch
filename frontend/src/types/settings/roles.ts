export interface Role {
  id: number;
  name: string;
  slug: string;
  is_active: number;
  is_system: number;
  is_superadmin: number;
  created_at: string;
  updated_at: string | null;
}

export interface RolePermission {
  id: number;
  role: number;
  permission_category: number;
  permission_category_name: string;
  permission_category_short_code: string;
  can_view: number;
  can_add: number;
  can_edit: number;
  can_delete: number;
  enable_view: number;
  enable_add: number;
  enable_edit: number;
  enable_delete: number;
}

export type RoleCreatePayload = Omit<Role, 'id' | 'is_active' | 'is_superadmin' | 'created_at' | 'updated_at'>;
export type RoleUpdatePayload = Partial<RoleCreatePayload>;
