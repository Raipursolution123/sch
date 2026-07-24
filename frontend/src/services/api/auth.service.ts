import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import { mapLegacyPermissionsToUser } from '@utils/auth-user';
import type {
  ApiSuccessResponse,
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  User,
} from '@app-types/index';

export const authService = {
  login: async (payload: LoginPayload) => {
    const { data } = await apiClient.post<ApiSuccessResponse<AuthResponse>>(
      API_ENDPOINTS.auth.login,
      payload,
    );
    const auth = data.data;
    return {
      ...auth,
      user: mapLegacyPermissionsToUser(auth.user, auth.user.legacy_permissions ?? {}),
    };
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
    const user = data.data;
    return mapLegacyPermissionsToUser(user, user.legacy_permissions ?? {});
  },
};
