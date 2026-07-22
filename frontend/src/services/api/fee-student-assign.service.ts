import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type {
  CarryForwardFeesPayload,
  FeeCarryForwardPreview,
  FeeStudentAssignRoster,
  SaveFeeStudentAssignPayload,
} from '@app-types/fees/fee-student-assign';
import { type BackendPayload, extractEntity } from '@utils/api-response';

export const feeStudentAssignService = {
  getRoster: async (
    feeSessionGroupId: number,
    sectionId?: number,
  ): Promise<FeeStudentAssignRoster> => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.fees.studentAssignRoster, {
      params: {
        fee_session_group_id: feeSessionGroupId,
        ...(sectionId ? { section_id: sectionId } : {}),
      },
    });
    return extractEntity<FeeStudentAssignRoster>(data);
  },

  save: async (payload: SaveFeeStudentAssignPayload): Promise<FeeStudentAssignRoster> => {
    const { data } = await apiClient.post<ApiSuccessResponse<FeeStudentAssignRoster>>(
      API_ENDPOINTS.fees.studentAssignSave,
      payload,
    );
    return data.data;
  },
};

export const feeCarryForwardService = {
  preview: async (
    fromSessionId: number,
    toSessionId: number,
    classId: number,
    sectionId: number,
  ): Promise<FeeCarryForwardPreview> => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.fees.carryForwardPreview, {
      params: {
        from_session_id: fromSessionId,
        to_session_id: toSessionId,
        class_id: classId,
        section_id: sectionId,
      },
    });
    return extractEntity<FeeCarryForwardPreview>(data);
  },

  carryForward: async (payload: CarryForwardFeesPayload): Promise<FeeCarryForwardPreview> => {
    const { data } = await apiClient.post<ApiSuccessResponse<FeeCarryForwardPreview>>(
      API_ENDPOINTS.fees.carryForward,
      payload,
    );
    return data.data;
  },
};
