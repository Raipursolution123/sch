import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type {
  CreateSubjectPayload,
  Subject,
  UpdateSubjectPayload,
} from '@app-types/academics/subject';
import { type BackendPayload, extractCount, extractList } from '@utils/api-response';

export function parseLinkedClassIds(value: string | null): number[] {
  if (!value) return [];
  return value
    .split(',')
    .map((part) => Number(part.trim()))
    .filter((id) => !Number.isNaN(id) && id > 0);
}

function ensureSubjectShape(raw: Subject): Subject {
  const linkedClassIds = Array.isArray(raw.linked_class_ids)
    ? raw.linked_class_ids
    : parseLinkedClassIds(raw.linked_class);
  return {
    ...raw,
    linked_class_ids: linkedClassIds,
    linked_class_labels: raw.linked_class_labels ?? [],
  };
}

export const subjectsService = {
  list: async (page = 1): Promise<{ results: Subject[]; count: number }> => {
    const { data } = await apiClient.get<BackendPayload>(
      `${API_ENDPOINTS.academics.subjects}?page=${page}`,
    );
    const raw = extractList<Subject>(data, 'subjects');
    const results = raw.map(ensureSubjectShape);
    return { results, count: extractCount(data, results.length) };
  },

  create: async (payload: CreateSubjectPayload): Promise<Subject> => {
    const { data } = await apiClient.post<ApiSuccessResponse<Subject>>(
      API_ENDPOINTS.academics.subjects,
      payload,
    );
    return ensureSubjectShape(data.data);
  },

  update: async (id: number, payload: UpdateSubjectPayload): Promise<Subject> => {
    const { data } = await apiClient.patch<ApiSuccessResponse<Subject>>(
      API_ENDPOINTS.academics.subjectDetail(id),
      payload,
    );
    return ensureSubjectShape(data.data);
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.academics.subjectDetail(id));
  },
};
