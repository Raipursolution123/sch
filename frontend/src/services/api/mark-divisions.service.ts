import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type {
  CreateMarkDivisionPayload,
  MarkDivision,
  UpdateMarkDivisionPayload,
} from '@app-types/examinations/mark-division';
import { type BackendPayload, extractList } from '@utils/api-response';

export const markDivisionsService = {
  list: async (): Promise<MarkDivision[]> => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.examinations.divisions);
    return extractList<MarkDivision>(data);
  },

  create: async (payload: CreateMarkDivisionPayload): Promise<MarkDivision> => {
    const { data } = await apiClient.post<ApiSuccessResponse<MarkDivision>>(
      API_ENDPOINTS.examinations.divisions,
      payload,
    );
    return data.data;
  },

  update: async (id: number, payload: UpdateMarkDivisionPayload): Promise<MarkDivision> => {
    const { data } = await apiClient.patch<ApiSuccessResponse<MarkDivision>>(
      API_ENDPOINTS.examinations.divisionDetail(id),
      payload,
    );
    return data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.examinations.divisionDetail(id));
  },
};
