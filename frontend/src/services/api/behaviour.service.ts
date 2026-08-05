import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import { type BackendPayload, extractList } from '@utils/api-response';

export interface BehaviourIncidentType {
  id: number;
  title: string;
  point: number;
  description: string;
  created_at: string | null;
}

export interface BehaviourAssignment {
  id: number;
  session_id: number;
  student_id: number;
  student_name: string;
  admission_no: string | null;
  incident_id: number;
  incident_title: string | null;
  incident_point: number | null;
  assign_by: number;
  created_at: string | null;
}

export interface CreateIncidentPayload {
  title: string;
  point: number;
  description?: string;
}

export interface AssignIncidentPayload {
  student_id: number;
  incident_id: number;
  session_id: number;
}

export const behaviourService = {
  listIncidents: async (): Promise<BehaviourIncidentType[]> => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.behaviour.incidents);
    return extractList<BehaviourIncidentType>(data);
  },

  createIncident: async (payload: CreateIncidentPayload): Promise<BehaviourIncidentType> => {
    const { data } = await apiClient.post<ApiSuccessResponse<BehaviourIncidentType>>(
      API_ENDPOINTS.behaviour.incidents,
      payload,
    );
    return data.data;
  },

  updateIncident: async (
    id: number,
    payload: CreateIncidentPayload,
  ): Promise<BehaviourIncidentType> => {
    const { data } = await apiClient.put<ApiSuccessResponse<BehaviourIncidentType>>(
      API_ENDPOINTS.behaviour.incidentDetail(id),
      payload,
    );
    return data.data;
  },

  deleteIncident: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.behaviour.incidentDetail(id));
  },

  listAssignments: async (sessionId?: number): Promise<BehaviourAssignment[]> => {
    const params = sessionId ? `?session_id=${sessionId}` : '';
    const { data } = await apiClient.get<BackendPayload>(
      `${API_ENDPOINTS.behaviour.assignments}${params}`,
    );
    return extractList<BehaviourAssignment>(data);
  },

  assign: async (payload: AssignIncidentPayload): Promise<BehaviourAssignment> => {
    const { data } = await apiClient.post<ApiSuccessResponse<BehaviourAssignment>>(
      API_ENDPOINTS.behaviour.assignments,
      payload,
    );
    return data.data;
  },

  deleteAssignment: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.behaviour.assignmentDetail(id));
  },
};
