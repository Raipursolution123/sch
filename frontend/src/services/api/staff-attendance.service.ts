import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type {
  MarkStaffAttendancePayload,
  StaffAttendanceRoster,
  StaffAttendanceType,
} from '@app-types/staff/attendance';
import { type BackendPayload, extractEntity, extractList } from '@utils/api-response';

export const staffAttendanceService = {
  listTypes: async (): Promise<StaffAttendanceType[]> => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.staff.attendanceTypes);
    return extractList<StaffAttendanceType>(data);
  },

  getRoster: async (date: string): Promise<StaffAttendanceRoster> => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.staff.attendanceRoster, {
      params: { date },
    });
    return extractEntity<StaffAttendanceRoster>(data);
  },

  saveMark: async (payload: MarkStaffAttendancePayload): Promise<StaffAttendanceRoster> => {
    const { data } = await apiClient.post<ApiSuccessResponse<StaffAttendanceRoster>>(
      API_ENDPOINTS.staff.attendanceMark,
      payload,
    );
    return data.data;
  },
};
