import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type {
  Incident,
  StudentIncidentDetail,
  IncidentComment,
  BehaviourSetting,
} from '@app-types/behaviour';
import { type BackendPayload, extractList } from '@utils/api-response';

export const behaviourService = {
  // Incidents CRUD
  listIncidents: async (): Promise<Incident[]> => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.students.behaviour.incidents);
    return extractList<Incident>(data);
  },

  createIncident: async (payload: Omit<Incident, 'id' | 'created_at'>): Promise<Incident> => {
    const { data } = await apiClient.post<ApiSuccessResponse<Incident>>(
      API_ENDPOINTS.students.behaviour.incidents,
      payload,
    );
    return data.data;
  },

  updateIncident: async (id: number, payload: Partial<Incident>): Promise<Incident> => {
    const { data } = await apiClient.put<ApiSuccessResponse<Incident>>(
      API_ENDPOINTS.students.behaviour.incidentDetail(id),
      payload,
    );
    return data.data;
  },

  deleteIncident: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.students.behaviour.incidentDetail(id));
  },

  // Assigned Incidents
  listAssignedIncidents: async (params?: {
    class_id?: number;
    section_id?: number;
  }): Promise<StudentIncidentDetail[]> => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.students.behaviour.assign, {
      params,
    });
    return extractList<StudentIncidentDetail>(data);
  },

  assignIncident: async (payload: {
    student_id: number;
    incident_id: number;
  }): Promise<any> => {
    const { data } = await apiClient.post<ApiSuccessResponse<any>>(
      API_ENDPOINTS.students.behaviour.assign,
      payload,
    );
    return data.data;
  },

  // Incident Comments
  listComments: async (studentIncidentId: number): Promise<IncidentComment[]> => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.students.behaviour.comments, {
      params: { student_incident_id: studentIncidentId },
    });
    return extractList<IncidentComment>(data);
  },

  addComment: async (payload: {
    student_incident_id: number;
    comment: string;
    type: 'staff' | 'student';
  }): Promise<IncidentComment> => {
    const { data } = await apiClient.post<ApiSuccessResponse<IncidentComment>>(
      API_ENDPOINTS.students.behaviour.comments,
      payload,
    );
    return data.data;
  },

  deleteComment: async (commentId: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.students.behaviour.commentDetail(commentId));
  },

  // Settings
  getSetting: async (): Promise<BehaviourSetting> => {
    const { data } = await apiClient.get<ApiSuccessResponse<BehaviourSetting>>(
      API_ENDPOINTS.students.behaviour.settings,
    );
    return data.data;
  },

  updateSetting: async (payload: { comment_option: string }): Promise<BehaviourSetting> => {
    const { data } = await apiClient.put<ApiSuccessResponse<BehaviourSetting>>(
      API_ENDPOINTS.students.behaviour.settings,
      payload,
    );
    return data.data;
  },
};
