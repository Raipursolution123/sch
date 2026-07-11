import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type {
  CreateSubjectGroupPayload,
  SubjectGroup,
  SyncSubjectGroupClassSectionsPayload,
  SyncSubjectGroupSubjectsPayload,
  UpdateSubjectGroupPayload,
} from '@app-types/academics/subject-group';
import { type BackendPayload, extractCount, extractList } from '@utils/api-response';

export const subjectGroupsService = {
  list: async (
    sessionId?: number,
    page = 1,
  ): Promise<{ results: SubjectGroup[]; count: number }> => {
    const sessionQuery = sessionId ? `&session_id=${sessionId}` : '';
    const { data } = await apiClient.get<BackendPayload>(
      `${API_ENDPOINTS.academics.subjectGroups}?page=${page}${sessionQuery}`,
    );
    const results = extractList<SubjectGroup>(data, 'subject_groups');
    return { results, count: extractCount(data, results.length) };
  },

  get: async (id: number): Promise<SubjectGroup> => {
    const { data } = await apiClient.get<ApiSuccessResponse<SubjectGroup>>(
      API_ENDPOINTS.academics.subjectGroupDetail(id),
    );
    return data.data;
  },

  create: async (payload: CreateSubjectGroupPayload): Promise<SubjectGroup> => {
    const { data } = await apiClient.post<ApiSuccessResponse<SubjectGroup>>(
      API_ENDPOINTS.academics.subjectGroups,
      payload,
    );
    return data.data;
  },

  update: async (id: number, payload: UpdateSubjectGroupPayload): Promise<SubjectGroup> => {
    const { data } = await apiClient.patch<ApiSuccessResponse<SubjectGroup>>(
      API_ENDPOINTS.academics.subjectGroupDetail(id),
      payload,
    );
    return data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.academics.subjectGroupDetail(id));
  },

  syncSubjects: async (
    id: number,
    payload: SyncSubjectGroupSubjectsPayload,
  ): Promise<SubjectGroup> => {
    const { data } = await apiClient.put<ApiSuccessResponse<SubjectGroup>>(
      API_ENDPOINTS.academics.subjectGroupSubjects(id),
      payload,
    );
    return data.data;
  },

  syncClassSections: async (
    id: number,
    payload: SyncSubjectGroupClassSectionsPayload,
  ): Promise<SubjectGroup> => {
    const { data } = await apiClient.put<ApiSuccessResponse<SubjectGroup>>(
      API_ENDPOINTS.academics.subjectGroupClassSections(id),
      payload,
    );
    return data.data;
  },
};
