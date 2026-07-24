import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type {
  CreatePhoneCallLogPayload,
  CreateVisitorPurposePayload,
  PhoneCallLog,
  UpdatePhoneCallLogPayload,
  UpdateVisitorPurposePayload,
  VisitorPurpose,
} from '@app-types/front-office/phone-call-purpose';
import { type BackendPayload, extractList } from '@utils/api-response';

export const phoneCallLogService = {
  list: async (): Promise<PhoneCallLog[]> => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.frontOffice.phoneCalls, {
      params: { page_size: 100 },
    });
    return extractList<PhoneCallLog>(data);
  },
  create: async (payload: CreatePhoneCallLogPayload): Promise<PhoneCallLog> => {
    const { data } = await apiClient.post<ApiSuccessResponse<PhoneCallLog>>(
      API_ENDPOINTS.frontOffice.phoneCalls,
      payload,
    );
    return data.data;
  },
  update: async (id: number, payload: UpdatePhoneCallLogPayload): Promise<PhoneCallLog> => {
    const { data } = await apiClient.patch<ApiSuccessResponse<PhoneCallLog>>(
      API_ENDPOINTS.frontOffice.phoneCallDetail(id),
      payload,
    );
    return data.data;
  },
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.frontOffice.phoneCallDetail(id));
  },
};

export const visitorPurposeService = {
  list: async (): Promise<VisitorPurpose[]> => {
    const { data } = await apiClient.get<BackendPayload>(
      API_ENDPOINTS.frontOffice.visitorPurposes,
      { params: { page_size: 100 } },
    );
    return extractList<VisitorPurpose>(data);
  },
  create: async (payload: CreateVisitorPurposePayload): Promise<VisitorPurpose> => {
    const { data } = await apiClient.post<ApiSuccessResponse<VisitorPurpose>>(
      API_ENDPOINTS.frontOffice.visitorPurposes,
      payload,
    );
    return data.data;
  },
  update: async (id: number, payload: UpdateVisitorPurposePayload): Promise<VisitorPurpose> => {
    const { data } = await apiClient.patch<ApiSuccessResponse<VisitorPurpose>>(
      API_ENDPOINTS.frontOffice.visitorPurposeDetail(id),
      payload,
    );
    return data.data;
  },
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.frontOffice.visitorPurposeDetail(id));
  },
};
