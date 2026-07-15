import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type {
  SaveStaffLeaveAllotmentsPayload,
  StaffLeaveAllotmentRoster,
} from '@app-types/staff/leave-allotment';

export const staffLeaveAllotmentsService = {
  getRoster: async (staffId: number): Promise<StaffLeaveAllotmentRoster> => {
    const { data } = await apiClient.get<ApiSuccessResponse<StaffLeaveAllotmentRoster>>(
      API_ENDPOINTS.staff.leaveAllotmentsRoster,
      { params: { staff_id: staffId } },
    );
    return data.data;
  },

  saveRoster: async (
    payload: SaveStaffLeaveAllotmentsPayload,
  ): Promise<StaffLeaveAllotmentRoster> => {
    const { data } = await apiClient.post<ApiSuccessResponse<StaffLeaveAllotmentRoster>>(
      API_ENDPOINTS.staff.leaveAllotments,
      payload,
    );
    return data.data;
  },
};
