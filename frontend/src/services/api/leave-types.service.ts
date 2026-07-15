import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type {
  CreateLeaveTypePayload,
  LeaveType,
  UpdateLeaveTypePayload,
} from '@app-types/staff/leave-type';
import { type BackendPayload, extractList } from '@utils/api-response';

export const leaveTypesService = {
  list: async (): Promise<LeaveType[]> => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.staff.leaveTypes);
    return extractList<LeaveType>(data);
  },

  create: async (payload: CreateLeaveTypePayload): Promise<LeaveType> => {
    const { data } = await apiClient.post<ApiSuccessResponse<LeaveType>>(
      API_ENDPOINTS.staff.leaveTypes,
      payload,
    );
    return data.data;
  },

  update: async (id: number, payload: UpdateLeaveTypePayload): Promise<LeaveType> => {
    const { data } = await apiClient.patch<ApiSuccessResponse<LeaveType>>(
      API_ENDPOINTS.staff.leaveTypeDetail(id),
      payload,
    );
    return data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.staff.leaveTypeDetail(id));
  },
};
