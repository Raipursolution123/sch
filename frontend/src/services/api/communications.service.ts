import { apiClient } from './client';
import { type BackendPayload, extractList } from '@utils/api-response';

export interface Template {
  id: number;
  title: string;
  message: string;
  created_at: string;
}

export interface MessageLog {
  id: number;
  title: string;
  message: string;
  send_through: 'email' | 'sms' | 'both';
  send_mail: boolean;
  send_sms: boolean;
  is_group: boolean;
  is_individual: boolean;
  is_class: boolean;
  is_schedule: boolean;
  sent: number;
  schedule_date_time: string | null;
  group_list: string;
  user_list: string;
  class_id: number | null;
  section_id: string;
  created_at: string;
}

export interface SendMessagePayload {
  title: string;
  message: string;
  send_through: 'email' | 'sms' | 'both';
  is_schedule: number;
  schedule_date_time?: string;
  recipient_type: 'group' | 'individual' | 'class';
  group_list?: string;
  user_list?: string;
  schedule_class?: number;
  schedule_section?: string;
}

export const communicationsService = {
  // Email Templates
  getEmailTemplates: async () => {
    const { data } = await apiClient.get<BackendPayload>('/communications/email-templates/');
    return extractList<Template>(data);
  },
  createEmailTemplate: async (payload: { title: string; message: string }) => {
    const response = await apiClient.post<{ data: Template }>(
      '/communications/email-templates/',
      payload,
    );
    return response.data.data;
  },
  updateEmailTemplate: async (id: number, payload: { title: string; message: string }) => {
    const response = await apiClient.put<{ data: Template }>(
      `/communications/email-templates/${id}/`,
      payload,
    );
    return response.data.data;
  },
  deleteEmailTemplate: async (id: number) => {
    await apiClient.delete(`/communications/email-templates/${id}/`);
  },

  // SMS Templates
  getSmsTemplates: async () => {
    const { data } = await apiClient.get<BackendPayload>('/communications/sms-templates/');
    return extractList<Template>(data);
  },
  createSmsTemplate: async (payload: { title: string; message: string }) => {
    const response = await apiClient.post<{ data: Template }>(
      '/communications/sms-templates/',
      payload,
    );
    return response.data.data;
  },
  updateSmsTemplate: async (id: number, payload: { title: string; message: string }) => {
    const response = await apiClient.put<{ data: Template }>(
      `/communications/sms-templates/${id}/`,
      payload,
    );
    return response.data.data;
  },
  deleteSmsTemplate: async (id: number) => {
    await apiClient.delete(`/communications/sms-templates/${id}/`);
  },

  // Message Logs / Schedules
  getMessages: async (isSchedule?: number) => {
    const { data } = await apiClient.get<BackendPayload>('/communications/messages/', {
      params: isSchedule !== undefined ? { is_schedule: isSchedule } : {},
    });
    return extractList<MessageLog>(data);
  },
  deleteMessage: async (id: number) => {
    await apiClient.delete(`/communications/messages/${id}/`);
  },
  sendMessage: async (payload: SendMessagePayload) => {
    const channel = payload.send_through === 'sms' ? 'sms' : 'email';
    const response = await apiClient.post<{ data: MessageLog }>(
      `/communications/messages/${channel}/`,
      payload,
    );
    return response.data.data;
  },
};
