import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type {
  CreateFeeAssignmentPayload,
  FeeAssignment,
  UpdateFeeAssignmentPayload,
} from '@app-types/fees/fee-assignment';

export const feeAssignmentsService = {
  list: async (): Promise<FeeAssignment[]> => {
    const { data } = await apiClient.get<any>(API_ENDPOINTS.fees.assignments);

    // Handle DRF paginated response: { count, next, previous, results: [...] }
    if (data?.results && Array.isArray(data.results)) {
      return data.results;
    }
    // Handle APIResponse wrapper: { success, message, data: [...] }
    if (data?.data && Array.isArray(data.data)) {
      return data.data;
    }
    if (data?.data?.results && Array.isArray(data.data.results)) {
      return data.data.results;
    }

    return [];
  },

  create: async (payload: CreateFeeAssignmentPayload): Promise<FeeAssignment> => {
    const { data } = await apiClient.post<ApiSuccessResponse<FeeAssignment>>(
      API_ENDPOINTS.fees.assignments,
      payload,
    );
    return data.data;
  },

  update: async (id: number, payload: UpdateFeeAssignmentPayload): Promise<FeeAssignment> => {
    const { data } = await apiClient.patch<ApiSuccessResponse<FeeAssignment>>(
      API_ENDPOINTS.fees.assignmentDetail(id),
      payload,
    );
    return data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.fees.assignmentDetail(id));
  },
};
