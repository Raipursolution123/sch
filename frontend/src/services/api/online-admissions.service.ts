import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type {
  ConvertOnlineAdmissionPayload,
  ConvertOnlineAdmissionResult,
  CreateOnlineAdmissionPayload,
  OnlineAdmission,
  UpdateOnlineAdmissionPayload,
} from '@app-types/admissions/online-admission';
import { type BackendPayload, extractList } from '@utils/api-response';

export const onlineAdmissionsService = {
  list: async (): Promise<OnlineAdmission[]> => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.admissions.online);
    return extractList<OnlineAdmission>(data);
  },

  create: async (payload: CreateOnlineAdmissionPayload): Promise<OnlineAdmission> => {
    const { data } = await apiClient.post<ApiSuccessResponse<OnlineAdmission>>(
      API_ENDPOINTS.admissions.online,
      payload,
    );
    return data.data;
  },

  update: async (id: number, payload: UpdateOnlineAdmissionPayload): Promise<OnlineAdmission> => {
    const { data } = await apiClient.patch<ApiSuccessResponse<OnlineAdmission>>(
      API_ENDPOINTS.admissions.onlineDetail(id),
      payload,
    );
    return data.data;
  },

  convert: async (
    id: number,
    payload: ConvertOnlineAdmissionPayload = {},
  ): Promise<ConvertOnlineAdmissionResult> => {
    const { data } = await apiClient.post<ApiSuccessResponse<ConvertOnlineAdmissionResult>>(
      API_ENDPOINTS.admissions.convert(id),
      payload,
    );
    return data.data;
  },
};
