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
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code?: number;
    message: string;
    details?: unknown;
  };
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
