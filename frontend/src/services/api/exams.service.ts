import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type { CreateExamPayload, Exam, UpdateExamPayload } from '@app-types/examinations/exam';
import { examGroupsService } from './exam-groups.service';
import { sessionsService } from './sessions.service';

interface ExamRecord {
  id: number;
  name: string;
  exam_group_id: number;
  session_id: number;
  date_from: string | null;
  date_to: string | null;
  passing_percentage: number | null;
  is_published: boolean;
  is_active: Exam['is_active'];
  description: string | null;
  created_at: string;
  updated_at: string | null;
}

// TODO: Remove mock store when GET /api/v1/examinations/exams/ is available
let mockExams: ExamRecord[] = [
  {
    id: 1,
    name: 'Mid Term Examination',
    exam_group_id: 1,
    session_id: 1,
    date_from: '2025-09-01',
    date_to: '2025-09-15',
    passing_percentage: 33,
    is_published: true,
    is_active: 'yes',
    description: 'First term mid examination',
    created_at: '2025-04-01T00:00:00Z',
    updated_at: null,
  },
  {
    id: 2,
    name: 'Final Term Examination',
    exam_group_id: 1,
    session_id: 1,
    date_from: '2026-02-15',
    date_to: '2026-03-01',
    passing_percentage: 33,
    is_published: false,
    is_active: 'yes',
    description: 'Annual final examination',
    created_at: '2025-04-01T00:00:00Z',
    updated_at: null,
  },
  {
    id: 3,
    name: 'Unit Test — June',
    exam_group_id: 2,
    session_id: 1,
    date_from: '2025-06-20',
    date_to: '2025-06-25',
    passing_percentage: 40,
    is_published: true,
    is_active: 'yes',
    description: null,
    created_at: '2025-04-01T00:00:00Z',
    updated_at: null,
  },
];
let nextMockId = 4;

const USE_MOCK = true;

function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

async function enrich(record: ExamRecord): Promise<Exam> {
  const [groups, sessions] = await Promise.all([
    examGroupsService.list(),
    sessionsService.list(),
  ]);
  const group = groups.find((g) => g.id === record.exam_group_id);
  const session = sessions.find((s) => s.id === record.session_id);
  return {
    id: record.id,
    name: record.name,
    exam_group_id: record.exam_group_id,
    exam_group_name: group?.name ?? '—',
    session_id: record.session_id,
    session_name: session?.session ?? '—',
    date_from: record.date_from,
    date_to: record.date_to,
    passing_percentage: record.passing_percentage,
    is_published: record.is_published,
    is_active: record.is_active,
    description: record.description,
    created_at: record.created_at,
    updated_at: record.updated_at,
  };
}

export const examsService = {
  list: async (): Promise<Exam[]> => {
    if (USE_MOCK) {
      const enriched = await Promise.all(mockExams.map(enrich));
      return delay(enriched.sort((a, b) => a.name.localeCompare(b.name)));
    }
    // TODO: Wire when backend exposes GET /api/v1/examinations/exams/
    const { data } = await apiClient.get<ApiSuccessResponse<Exam[]>>(
      API_ENDPOINTS.examinations.exams,
    );
    return data.data;
  },

  create: async (payload: CreateExamPayload): Promise<Exam> => {
    if (USE_MOCK) {
      const groups = await examGroupsService.list();
      if (!groups.some((g) => g.id === payload.exam_group_id && g.is_active === 'yes')) {
        throw new Error('Selected exam group is not available');
      }
      const sessions = await sessionsService.list();
      if (!sessions.some((s) => s.id === payload.session_id)) {
        throw new Error('Selected session is not available');
      }
      const created: ExamRecord = {
        id: nextMockId++,
        name: payload.name.trim(),
        exam_group_id: payload.exam_group_id,
        session_id: payload.session_id,
        date_from: payload.date_from,
        date_to: payload.date_to,
        passing_percentage: payload.passing_percentage,
        is_published: payload.is_published,
        is_active: payload.is_active,
        description: payload.description?.trim() || null,
        created_at: new Date().toISOString(),
        updated_at: null,
      };
      mockExams = [...mockExams, created];
      return delay(await enrich(created));
    }
    // TODO: Wire when backend exposes POST /api/v1/examinations/exams/
    const { data } = await apiClient.post<ApiSuccessResponse<Exam>>(
      API_ENDPOINTS.examinations.exams,
      payload,
    );
    return data.data;
  },

  update: async (id: number, payload: UpdateExamPayload): Promise<Exam> => {
    if (USE_MOCK) {
      const index = mockExams.findIndex((e) => e.id === id);
      if (index === -1) throw new Error('Exam not found');
      const groups = await examGroupsService.list();
      if (!groups.some((g) => g.id === payload.exam_group_id && g.is_active === 'yes')) {
        throw new Error('Selected exam group is not available');
      }
      const updated: ExamRecord = {
        ...mockExams[index],
        name: payload.name.trim(),
        exam_group_id: payload.exam_group_id,
        session_id: payload.session_id,
        date_from: payload.date_from,
        date_to: payload.date_to,
        passing_percentage: payload.passing_percentage,
        is_published: payload.is_published,
        is_active: payload.is_active,
        description: payload.description?.trim() || null,
        updated_at: new Date().toISOString(),
      };
      mockExams = mockExams.map((e) => (e.id === id ? updated : e));
      return delay(await enrich(updated));
    }
    // TODO: Wire when backend exposes PATCH /api/v1/examinations/exams/{id}/
    const { data } = await apiClient.patch<ApiSuccessResponse<Exam>>(
      API_ENDPOINTS.examinations.examDetail(id),
      payload,
    );
    return data.data;
  },

  delete: async (id: number): Promise<void> => {
    if (USE_MOCK) {
      const record = mockExams.find((e) => e.id === id);
      if (!record) throw new Error('Exam not found');
      if (record.is_active === 'yes') {
        throw new Error('Deactivate the exam before deleting');
      }
      mockExams = mockExams.filter((e) => e.id !== id);
      return delay(undefined);
    }
    // TODO: Wire when backend exposes DELETE /api/v1/examinations/exams/{id}/
    await apiClient.delete(API_ENDPOINTS.examinations.examDetail(id));
  },
};
