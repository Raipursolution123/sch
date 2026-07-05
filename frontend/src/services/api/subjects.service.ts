import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type {
  CreateSubjectPayload,
  Subject,
  UpdateSubjectPayload,
} from '@app-types/academics/subject';
import { classesService } from './classes.service';

interface SubjectRecord {
  id: number;
  name: string;
  code: string;
  type: string;
  is_active: Subject['is_active'];
  linked_class: string | null;
  created_at: string;
  updated_at: string | null;
}

// TODO: Remove mock store when GET /api/v1/academics/subjects/ is available
let mockSubjects: SubjectRecord[] = [
  {
    id: 1,
    name: 'Mathematics',
    code: 'MATH',
    type: 'theory',
    is_active: 'yes',
    linked_class: '4,5',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: null,
  },
  {
    id: 2,
    name: 'English',
    code: 'ENG',
    type: 'theory',
    is_active: 'yes',
    linked_class: '4,5,6',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: null,
  },
  {
    id: 3,
    name: 'Science',
    code: 'SCI',
    type: 'theory',
    is_active: 'yes',
    linked_class: '4,5',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: null,
  },
  {
    id: 4,
    name: 'Computer Lab',
    code: 'COMP-LAB',
    type: 'practical',
    is_active: 'yes',
    linked_class: '5,6',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: null,
  },
  {
    id: 5,
    name: 'Physical Education',
    code: 'PE',
    type: 'practical',
    is_active: 'no',
    linked_class: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: null,
  },
];
let nextMockId = 6;

const USE_MOCK = false; // TODO: Set to false when backend subjects API is deployed

function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export function parseLinkedClassIds(value: string | null): number[] {
  if (!value) return [];
  return value
    .split(',')
    .map((part) => Number(part.trim()))
    .filter((id) => !Number.isNaN(id) && id > 0);
}

function formatLinkedClass(ids: number[]): string | null {
  const unique = [...new Set(ids)].sort((a, b) => a - b);
  return unique.length > 0 ? unique.join(',') : null;
}

function normalizeCode(value: string): string {
  return value.trim().toUpperCase();
}

async function enrich(records: SubjectRecord[]): Promise<Subject[]> {
  const { results: classes } = await classesService.list();
  const classMap = new Map(classes.map((c) => [c.id, c.class_name]));

  return records.map((record) => {
    const linkedClassIds = parseLinkedClassIds(record.linked_class);
    return {
      ...record,
      linked_class_ids: linkedClassIds,
      linked_class_labels: linkedClassIds.map((id) => classMap.get(id) ?? `Class #${id}`),
    };
  });
}

function mockList(): SubjectRecord[] {
  return [...mockSubjects];
}

export const subjectsService = {
  list: async (page = 1): Promise<{ results: Subject[]; count: number }> => {
    if (USE_MOCK) {
      const enriched = await enrich(mockList());
      const sorted = enriched.sort((a, b) => a.name.localeCompare(b.name));
      return delay({ results: sorted, count: sorted.length });
    }
    // TODO: Wire when backend exposes GET /api/v1/academics/subjects/
    const { data } = await apiClient.get<any>(
      `${API_ENDPOINTS.academics.subjects}?page=${page}`,
    );
    let results: Subject[] = [];
    if (data?.results?.subjects && Array.isArray(data.results.subjects)) results = data.results.subjects;
    else if (data?.data?.subjects && Array.isArray(data.data.subjects)) results = data.data.subjects;
    else if (data?.subjects && Array.isArray(data.subjects)) results = data.subjects;
    else if (data?.data && Array.isArray(data.data)) results = data.data;
    else if (data?.results && Array.isArray(data.results)) results = data.results;

    // We must ensure the linked_class string from the backend is parsed properly
    // backend sends `linked_class`, frontend uses `linked_class_ids` and `linked_class_labels`.
    // Instead of doing it here, we will just use `enrich` function if we needed to, but `enrich` was defined up top.
    const finalResults = await enrich(results as unknown as SubjectRecord[]);

    const count = data?.count || data?.data?.count || finalResults.length;
    return { results: finalResults, count };
  },

  create: async (payload: CreateSubjectPayload): Promise<Subject> => {
    if (USE_MOCK) {
      const code = normalizeCode(payload.code);
      if (mockSubjects.some((s) => s.code.toUpperCase() === code)) {
        throw new Error('A subject with this code already exists');
      }
      const created: SubjectRecord = {
        id: nextMockId++,
        name: payload.name.trim(),
        code,
        type: payload.type,
        is_active: payload.is_active,
        linked_class: formatLinkedClass(payload.linked_class_ids),
        created_at: new Date().toISOString(),
        updated_at: null,
      };
      mockSubjects = [...mockSubjects, created];
      const [enriched] = await enrich([created]);
      return delay(enriched);
    }
    // TODO: Wire when backend exposes POST /api/v1/academics/subjects/
    const apiPayload = {
      ...payload,
      linked_class: formatLinkedClass(payload.linked_class_ids)
    };
    const { data } = await apiClient.post<any>(
      API_ENDPOINTS.academics.subjects,
      apiPayload,
    );
    return data.data;
  },

  update: async (id: number, payload: UpdateSubjectPayload): Promise<Subject> => {
    if (USE_MOCK) {
      const index = mockSubjects.findIndex((s) => s.id === id);
      if (index === -1) throw new Error('Subject not found');
      const code = normalizeCode(payload.code);
      const duplicate = mockSubjects.some((s) => s.id !== id && s.code.toUpperCase() === code);
      if (duplicate) {
        throw new Error('A subject with this code already exists');
      }
      const updated: SubjectRecord = {
        ...mockSubjects[index],
        name: payload.name.trim(),
        code,
        type: payload.type,
        is_active: payload.is_active,
        linked_class: formatLinkedClass(payload.linked_class_ids),
        updated_at: new Date().toISOString().slice(0, 10),
      };
      mockSubjects = mockSubjects.map((s) => (s.id === id ? updated : s));
      const [enriched] = await enrich([updated]);
      return delay(enriched);
    }
    // TODO: Wire when backend exposes PATCH /api/v1/academics/subjects/{id}/
    const apiPayload = {
      ...payload,
      linked_class: formatLinkedClass(payload.linked_class_ids)
    };
    const { data } = await apiClient.put<any>(
      API_ENDPOINTS.academics.subjectDetail(id),
      apiPayload,
    );
    return data.data;
  },

  delete: async (id: number): Promise<void> => {
    if (USE_MOCK) {
      const target = mockSubjects.find((s) => s.id === id);
      if (!target) throw new Error('Subject not found');
      if (target.is_active === 'yes') {
        throw new Error('Cannot delete an active subject. Deactivate it first.');
      }
      mockSubjects = mockSubjects.filter((s) => s.id !== id);
      return delay(undefined);
    }
    // TODO: Wire when backend exposes DELETE /api/v1/academics/subjects/{id}/
    await apiClient.delete(API_ENDPOINTS.academics.subjectDetail(id));
  },
};
