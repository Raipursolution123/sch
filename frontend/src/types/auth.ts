export interface User {
  id: number;
  user_id: number;
  username: string;
  role: string;
  lang_id: number;
  currency_id: number | null;
  is_active: string;
  is_superadmin: boolean;
  created_at: string;
  updated_at: string | null;
  /** Legacy permission_category keys with can_view — from backend enrich_user_payload. */
  permissions?: string[];
  /** Full legacy RBAC map from `/auth/me` and login. */
  legacy_permissions?: Record<string, LegacyPermissionActions>;
}

export interface LegacyPermissionActions {
  can_view: boolean;
  can_add: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {
  password_confirm: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}
