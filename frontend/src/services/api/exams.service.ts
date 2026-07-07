import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse, PaginatedResponse } from '@app-types/api';
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

async function enrich(record: ExamRecord): Promise<Exam> {
  const [groups, sessions] = await Promise.all([examGroupsService.list(), sessionsService.list()]);
  const group = groups.results.find((g) => g.id === record.exam_group_id);
  const session = sessions.results.find((s) => s.id === record.session_id);
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
  list: async (): Promise<PaginatedResponse<Exam>> => {
    const { data } = await apiClient.get<ApiSuccessResponse<PaginatedResponse<ExamRecord>>>(
      API_ENDPOINTS.examinations.exams,
    );
    const enrichedResults = await Promise.all(data.data.results.map(enrich));
    return {
      ...data.data,
      results: enrichedResults,
    };
  },

  create: async (payload: CreateExamPayload): Promise<Exam> => {
    const { data } = await apiClient.post<ApiSuccessResponse<ExamRecord>>(
      API_ENDPOINTS.examinations.exams,
      payload,
    );
    return enrich(data.data);
  },

  update: async (id: number, payload: UpdateExamPayload): Promise<Exam> => {
    const { data } = await apiClient.put<ApiSuccessResponse<ExamRecord>>(
      API_ENDPOINTS.examinations.examDetail(id),
      payload,
    );
    return enrich(data.data);
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.examinations.examDetail(id));
  },
};
