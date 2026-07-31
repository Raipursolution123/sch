import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import { type BackendPayload, extractList } from '@utils/api-response';

export interface FeeMasterItem {
  id: number;
  fee_group_id: number;
  fee_group_name: string;
  fee_type_id: number;
  fee_type_name: string;
  amount: number;
  description?: string;
  is_active?: string;
}

export interface CreateFeeMasterPayload {
  fee_group_id: number;
  fee_type_id: number;
  amount: number;
  description?: string;
}

export interface UpdateFeeMasterPayload {
  fee_group_id?: number;
  fee_type_id?: number;
  amount?: number;
  description?: string;
}

export const feeMastersService = {
  list: async (): Promise<FeeMasterItem[]> => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.fees.assignments);
    return extractList<FeeMasterItem>(data);
  },

  create: async (payload: CreateFeeMasterPayload): Promise<FeeMasterItem> => {
    const { data } = await apiClient.post<ApiSuccessResponse<FeeMasterItem>>(
      API_ENDPOINTS.fees.assignments,
      payload,
    );
    return data.data;
  },

  update: async (id: number, payload: UpdateFeeMasterPayload): Promise<FeeMasterItem> => {
    const { data } = await apiClient.put<ApiSuccessResponse<FeeMasterItem>>(
      API_ENDPOINTS.fees.assignmentDetail(id),
      payload,
    );
    return data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.fees.assignmentDetail(id));
  },
};
