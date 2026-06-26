import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type {
  ApiSuccessResponse,
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  User,
} from '@app-types/auth';

export const authService = {
  login: async (payload: LoginPayload) => {
    const { data } = await apiClient.post<ApiSuccessResponse<AuthResponse>>(
      API_ENDPOINTS.auth.login,
      payload,
    );
    return data.data;
  },

  register: async (payload: RegisterPayload) => {
    const { data } = await apiClient.post<ApiSuccessResponse<AuthResponse>>(
      API_ENDPOINTS.auth.register,
      payload,
    );
    return data.data;
  },

  logout: async (refreshToken: string) => {
    await apiClient.post(API_ENDPOINTS.auth.logout, { refresh: refreshToken });
  },

  getMe: async () => {
    const { data } = await apiClient.get<ApiSuccessResponse<User>>(API_ENDPOINTS.auth.me);
    return data.data;
  },
};
