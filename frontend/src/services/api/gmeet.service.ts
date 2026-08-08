import { apiClient } from './client';
import { API_ENDPOINTS } from '@constants/api-endpoints';

export interface GmeetSettings {
  id: number;
  api_key: string;
  api_secret: string;
  use_api: number;
  created_at: string;
}

export interface GmeetClassSection {
  id: number;
  class_name: string;
  section_name: string;
  cls_section_id: number;
}

export interface GmeetStaffMember {
  id: number;
  name: string;
  surname: string;
  employee_id: string;
  role_name: string;
}

export interface Gmeet {
  id: number;
  purpose: string;
  staff_id: number | null;
  created_id: number;
  title: string;
  date: string;
  type: string;
  api_data: string | null;
  duration: number;
  subject: string;
  url: string;
  session_id: number;
  description: string;
  timezone: string;
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
  sections_list: GmeetClassSection[];
  staff_list: GmeetStaffMember[];
}

export interface GmeetViewerHistory {
  id: number;
  gmeet_id: number;
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

export const gmeetService = {
  getSettings: async (): Promise<GmeetSettings> => {
    const { data } = await apiClient.get(API_ENDPOINTS.gmeet.settings);
    return data.data;
  },

  updateSettings: async (payload: Partial<GmeetSettings>): Promise<GmeetSettings> => {
    const { data } = await apiClient.post(API_ENDPOINTS.gmeet.settings, payload);
    return data.data;
  },

  listClasses: async (params?: { staff_id?: string | number; session_id?: number }): Promise<Gmeet[]> => {
    const { data } = await apiClient.get(API_ENDPOINTS.gmeet.classes, { params });
    return data.data;
  },

  createClass: async (payload: Partial<Gmeet> & { class_sections: number[] }): Promise<Gmeet> => {
    const { data } = await apiClient.post(API_ENDPOINTS.gmeet.classes, payload);
    return data.data;
  },

  deleteClass: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.gmeet.classDetail(id));
  },

  listMeetings: async (params?: { staff_id?: string | number; session_id?: number }): Promise<Gmeet[]> => {
    const { data } = await apiClient.get(API_ENDPOINTS.gmeet.meetings, { params });
    return data.data;
  },

  createMeeting: async (payload: Partial<Gmeet> & { staff_ids: number[] }): Promise<Gmeet> => {
    const { data } = await apiClient.post(API_ENDPOINTS.gmeet.meetings, payload);
    return data.data;
  },

  deleteMeeting: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.gmeet.meetingDetail(id));
  },

  join: async (id: number, payload?: { student_id?: number; staff_id?: number }): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.gmeet.join(id), payload);
  },

  getClassReport: async (params: { class_id: number; section_id: number; session_id?: number }): Promise<Gmeet[]> => {
    const { data } = await apiClient.get(API_ENDPOINTS.gmeet.classReport, { params });
    return data.data;
  },

  getMeetingReport: async (params?: { session_id?: number }): Promise<Gmeet[]> => {
    const { data } = await apiClient.get(API_ENDPOINTS.gmeet.meetingReport, { params });
    return data.data;
  },

  getClassViewers: async (id: number, params: { class_id: number; section_id: number }): Promise<GmeetViewerHistory[]> => {
    const { data } = await apiClient.get(API_ENDPOINTS.gmeet.classViewers(id), { params });
    return data.data;
  },

  getMeetingViewers: async (id: number): Promise<GmeetViewerHistory[]> => {
    const { data } = await apiClient.get(API_ENDPOINTS.gmeet.meetingViewers(id));
    return data.data;
  },
};
