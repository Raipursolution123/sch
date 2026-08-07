import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import { type BackendPayload, extractEntity } from '@utils/api-response';

export interface HostelAttendanceEntry {
  student_id: number;
  student_session_id: number;
  admission_no: string;
  student_name: string;
  hostel_name: string | null;
  room_no: string;
  attendence_type_id: number;
  status_key: string;
  status_label: string;
  remark: string;
}

export interface HostelAttendanceRoster {
  hostel_id: number;
  date: string;
  entries: HostelAttendanceEntry[];
}

export const hostelAttendanceService = {
  getRoster: async (hostelId: number, date: string): Promise<HostelAttendanceRoster> => {
    const { data } = await apiClient.get<BackendPayload>(
      `${API_ENDPOINTS.attendance.hostelRoster}?hostel_id=${hostelId}&date=${date}`,
    );
    return extractEntity<HostelAttendanceRoster>(data);
  },

  mark: async (payload: {
    hostel_id: number;
    date: string;
    entries: Array<{
      student_session_id: number;
      attendence_type_id: number;
      remark?: string;
    }>;
  }): Promise<HostelAttendanceRoster> => {
    const { data } = await apiClient.post<ApiSuccessResponse<HostelAttendanceRoster>>(
      API_ENDPOINTS.attendance.hostelMark,
      payload,
    );
    return data.data;
  },
};
