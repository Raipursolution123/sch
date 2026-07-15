import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type {
  AssignFeeDiscountPayload,
  AssignFeeDiscountResult,
  FeeDiscountAssignRoster,
} from '@app-types/fees/fee-discount-assignment';

export const feeDiscountAssignmentsService = {
  getRoster: async (
    classId: number,
    sectionId: number,
    feesDiscountId: number,
  ): Promise<FeeDiscountAssignRoster> => {
    const { data } = await apiClient.get<ApiSuccessResponse<FeeDiscountAssignRoster>>(
      API_ENDPOINTS.fees.discountAssignRoster,
      {
        params: {
          class_id: classId,
          section_id: sectionId,
          fees_discount_id: feesDiscountId,
        },
      },
    );
    return data.data;
  },

  assign: async (payload: AssignFeeDiscountPayload): Promise<AssignFeeDiscountResult> => {
    const { data } = await apiClient.post<ApiSuccessResponse<AssignFeeDiscountResult>>(
      API_ENDPOINTS.fees.discountAssignments,
      payload,
    );
    return data.data;
  },

  unassign: async (assignmentId: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.fees.discountAssignmentDetail(assignmentId));
  },
};
