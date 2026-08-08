import { apiClient } from './client';
import { API_ENDPOINTS } from '@constants/api-endpoints';

export interface ZoomSettings {
  id: number;
  zoom_api_key: string;
  zoom_api_secret: string;
  use_teacher_api: number;
  use_zoom_app: number;
  use_zoom_app_user: number;
  created_at: string;
}

export interface ZoomClassSection {
  id: number;
  class_name: string;
  section_name: string;
  cls_section_id: number;
}

export interface ZoomStaffMember {
  id: number;
  name: string;
  surname: string;
  employee_id: string;
  role_name: string;
}

export interface Conference {
  id: number;
  purpose: string;
  staff_id: number | null;
  created_id: number;
  title: string;
  date: string;
  duration: number;
  password?: string;
  subject?: string;
  class_id?: number;
  section_id?: number;
  session_id: number;
  host_video: number;
  client_video: number;
  description: string;
  timezone: string;
  url?: string;
  return_response?: string;
  api_type: string;
  status: number;
  created_at: string;
  create_for_name: string;
  create_for_surname: string;
  create_by_name: string;
  create_by_surname: string;
  create_by_employee_id: string;
  create_by_role_name: string;
  create_for_role_name: string;
  total_viewers: number;
  sections_list: ZoomClassSection[];
  staff_list: ZoomStaffMember[];
}

export interface ZoomViewerHistory {
  id: number;
  conference_id: number;
  staff_id: number | null;
  student_id: number | null;
  total_hit: number;
  created_at: string;
  student_name?: string;
  student_lastname?: string;
  admission_no?: string;
  roll_no?: string;
  father_name?: string;
  staff_name?: string;
  staff_surname?: string;
  employee_id?: string;
  role_name?: string;
}

export const zoomService = {
  getSettings: async (): Promise<ZoomSettings> => {
    const { data } = await apiClient.get(API_ENDPOINTS.zoom.settings);
    return data.data;
  },

  updateSettings: async (payload: Partial<ZoomSettings>): Promise<ZoomSettings> => {
    const { data } = await apiClient.post(API_ENDPOINTS.zoom.settings, payload);
    return data.data;
  },

  listClasses: async (params?: { staff_id?: string | number; session_id?: number }): Promise<Conference[]> => {
    const { data } = await apiClient.get(API_ENDPOINTS.zoom.classes, { params });
    return data.data;
  },

  createClass: async (payload: Partial<Conference> & { class_sections: number[] }): Promise<Conference> => {
    const { data } = await apiClient.post(API_ENDPOINTS.zoom.classes, payload);
    return data.data;
  },

  deleteClass: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.zoom.classDetail(id));
  },

  listMeetings: async (params?: { staff_id?: string | number; session_id?: number }): Promise<Conference[]> => {
    const { data } = await apiClient.get(API_ENDPOINTS.zoom.meetings, { params });
    return data.data;
  },

  createMeeting: async (payload: Partial<Conference> & { staff_ids: number[] }): Promise<Conference> => {
    const { data } = await apiClient.post(API_ENDPOINTS.zoom.meetings, payload);
    return data.data;
  },

  deleteMeeting: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.zoom.meetingDetail(id));
  },

  join: async (id: number, payload?: { student_id?: number; staff_id?: number }): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.zoom.join(id), payload);
  },

  getClassReport: async (params: { class_id: number; section_id: number; session_id?: number }): Promise<Conference[]> => {
    const { data } = await apiClient.get(API_ENDPOINTS.zoom.classReport, { params });
    return data.data;
  },

  getMeetingReport: async (params?: { session_id?: number }): Promise<Conference[]> => {
    const { data } = await apiClient.get(API_ENDPOINTS.zoom.meetingReport, { params });
    return data.data;
  },

  getClassViewers: async (id: number, params: { class_id: number; section_id: number }): Promise<ZoomViewerHistory[]> => {
    const { data } = await apiClient.get(API_ENDPOINTS.zoom.classViewers(id), { params });
    return data.data;
  },

  getMeetingViewers: async (id: number): Promise<ZoomViewerHistory[]> => {
    const { data } = await apiClient.get(API_ENDPOINTS.zoom.meetingViewers(id));
    return data.data;
  },
};
