import { apiClient } from './client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type {
  FeeHeadMapper,
  FeeHeadMapperPayload,
  FeeHeadMapperUpdatePayload,
} from '@app-types/finance';

export const feeMapperService = {
  list: async (): Promise<FeeHeadMapper[]> => {
    const response = await apiClient.get<ApiSuccessResponse<FeeHeadMapper[]>>(
      API_ENDPOINTS.finance.mapper,
    );
    return response.data.data ?? [];
  },

  create: async (payload: FeeHeadMapperPayload) => {
    const response = await apiClient.post<{ data: FeeHeadMapper; message: string }>(
      API_ENDPOINTS.finance.mapper,
      payload,
    );
    return response.data;
  },

  update: async (id: number, payload: FeeHeadMapperUpdatePayload) => {
    const response = await apiClient.patch<{ data: FeeHeadMapper; message: string }>(
      API_ENDPOINTS.finance.mapperDetail(id),
      payload,
    );
    return response.data;
  },

  delete: async (id: number) => {
    const response = await apiClient.delete<{ message: string }>(
      API_ENDPOINTS.finance.mapperDetail(id),
    );
    return response.data;
  },
};
