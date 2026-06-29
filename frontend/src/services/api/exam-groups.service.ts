import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type {
  CreateExamGroupPayload,
  ExamGroup,
  UpdateExamGroupPayload,
} from '@app-types/examinations/exam-group';

interface ExamGroupRecord {
  id: number;
  name: string;
  exam_type: string;
  description: string | null;
  is_active: ExamGroup['is_active'];
  created_at: string;
  updated_at: string | null;
}

// TODO: Remove mock store when GET /api/v1/examinations/groups/ is available
let mockExamGroups: ExamGroupRecord[] = [
  {
    id: 1,
    name: 'Term Examinations 2025-26',
    exam_type: 'Term',
    description: 'Mid-term and final term assessments',
    is_active: 'yes',
    created_at: '2025-04-01T00:00:00Z',
    updated_at: null,
  },
  {
    id: 2,
    name: 'Unit Tests',
    exam_type: 'Unit Test',
    description: 'Monthly unit assessments',
    is_active: 'yes',
    created_at: '2025-04-01T00:00:00Z',
    updated_at: null,
  },
];
let nextMockId = 3;

const USE_MOCK = true;

function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function mockList(): ExamGroup[] {
  return [...mockExamGroups].sort((a, b) => a.name.localeCompare(b.name));
}

export const examGroupsService = {
  list: async (): Promise<ExamGroup[]> => {
    if (USE_MOCK) return delay(mockList());
    // TODO: Wire when backend exposes GET /api/v1/examinations/groups/
    const { data } = await apiClient.get<ApiSuccessResponse<ExamGroup[]>>(
      API_ENDPOINTS.examinations.groups,
    );
    return data.data;
  },

  create: async (payload: CreateExamGroupPayload): Promise<ExamGroup> => {
    if (USE_MOCK) {
      const name = payload.name.trim();
      if (mockExamGroups.some((g) => g.name.toLowerCase() === name.toLowerCase())) {
        throw new Error('An exam group with this name already exists');
      }
      const created: ExamGroupRecord = {
        id: nextMockId++,
        name,
        exam_type: payload.exam_type,
        description: payload.description?.trim() || null,
        is_active: payload.is_active,
        created_at: new Date().toISOString(),
        updated_at: null,
      };
      mockExamGroups = [...mockExamGroups, created];
      return delay(created);
    }
    // TODO: Wire when backend exposes POST /api/v1/examinations/groups/
    const { data } = await apiClient.post<ApiSuccessResponse<ExamGroup>>(
      API_ENDPOINTS.examinations.groups,
      payload,
    );
    return data.data;
  },

  update: async (id: number, payload: UpdateExamGroupPayload): Promise<ExamGroup> => {
    if (USE_MOCK) {
      const index = mockExamGroups.findIndex((g) => g.id === id);
      if (index === -1) throw new Error('Exam group not found');
      const name = payload.name.trim();
      if (mockExamGroups.some((g) => g.id !== id && g.name.toLowerCase() === name.toLowerCase())) {
        throw new Error('An exam group with this name already exists');
      }
      const updated: ExamGroupRecord = {
        ...mockExamGroups[index],
        name,
        exam_type: payload.exam_type,
        description: payload.description?.trim() || null,
        is_active: payload.is_active,
        updated_at: new Date().toISOString(),
      };
      mockExamGroups = mockExamGroups.map((g) => (g.id === id ? updated : g));
      return delay(updated);
    }
    // TODO: Wire when backend exposes PATCH /api/v1/examinations/groups/{id}/
    const { data } = await apiClient.patch<ApiSuccessResponse<ExamGroup>>(
      API_ENDPOINTS.examinations.groupDetail(id),
      payload,
    );
    return data.data;
  },

  delete: async (id: number): Promise<void> => {
    if (USE_MOCK) {
      const record = mockExamGroups.find((g) => g.id === id);
      if (!record) throw new Error('Exam group not found');
      if (record.is_active === 'yes') {
        throw new Error('Deactivate the exam group before deleting');
      }
      mockExamGroups = mockExamGroups.filter((g) => g.id !== id);
      return delay(undefined);
    }
    // TODO: Wire when backend exposes DELETE /api/v1/examinations/groups/{id}/
    await apiClient.delete(API_ENDPOINTS.examinations.groupDetail(id));
  },
};
