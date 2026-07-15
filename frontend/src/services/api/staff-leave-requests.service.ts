import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type {
  CreateStaffLeaveRequestPayload,
  ReviewStaffLeavePayload,
  StaffLeaveRequest,
} from '@app-types/staff/leave-request';
import { type BackendPayload, extractList } from '@utils/api-response';

export const staffLeaveRequestsService = {
  list: async (): Promise<StaffLeaveRequest[]> => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.staff.leaveRequests);
    return extractList<StaffLeaveRequest>(data);
  },

  create: async (payload: CreateStaffLeaveRequestPayload): Promise<StaffLeaveRequest> => {
    const { data } = await apiClient.post<ApiSuccessResponse<StaffLeaveRequest>>(
      API_ENDPOINTS.staff.leaveRequests,
      payload,
    );
    return data.data;
  },

  review: async (id: number, payload: ReviewStaffLeavePayload): Promise<StaffLeaveRequest> => {
    const { data } = await apiClient.patch<ApiSuccessResponse<StaffLeaveRequest>>(
      API_ENDPOINTS.staff.leaveRequestDetail(id),
      payload,
    );
    return data.data;
  },
};
