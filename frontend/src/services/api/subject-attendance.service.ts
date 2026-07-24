import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type {
  MarkSubjectAttendancePayload,
  SubjectAttendancePeriod,
  SubjectAttendanceRoster,
} from '@app-types/attendance/subject-attendance';
import { type BackendPayload, extractEntity, extractList } from '@utils/api-response';

export const subjectAttendanceService = {
  listPeriods: async (
    classId: number,
    sectionId: number,
    date: string,
  ): Promise<SubjectAttendancePeriod[]> => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.attendance.subjectPeriods, {
      params: { class_id: classId, section_id: sectionId, date },
    });
    return extractList<SubjectAttendancePeriod>(data);
  },

  getRoster: async (periodId: number, date: string): Promise<SubjectAttendanceRoster> => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.attendance.subjectRoster, {
      params: { subject_timetable_id: periodId, date },
    });
    return extractEntity<SubjectAttendanceRoster>(data);
  },

  saveMark: async (payload: MarkSubjectAttendancePayload): Promise<SubjectAttendanceRoster> => {
    const { data } = await apiClient.post<ApiSuccessResponse<SubjectAttendanceRoster>>(
      API_ENDPOINTS.attendance.subjectMark,
      payload,
    );
    return data.data;
  },
};
