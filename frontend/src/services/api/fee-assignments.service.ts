import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type {
  CreateFeeAssignmentPayload,
  FeeAssignment,
  UpdateFeeAssignmentPayload,
} from '@app-types/fees/fee-assignment';
import { type BackendPayload, extractList } from '@utils/api-response';

export const feeAssignmentsService = {
  list: async (): Promise<FeeAssignment[]> => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.fees.assignments);
    return extractList<FeeAssignment>(data);
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
