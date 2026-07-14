import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type {
  CreateExamSchedulePayload,
  ExamSchedule,
  UpdateExamSchedulePayload,
} from '@app-types/examinations/exam-schedule';
import { examsService } from './exams.service';
import { sessionsService } from './sessions.service';
import { subjectsService } from './subjects.service';

interface ScheduleRecord {
  id: number;
  exam_id: number;
  subject_id: number;
  session_id: number | null;
  date_of_exam: string | null;
  start_time: string | null;
  end_time: string | null;
  room_no: string | null;
  full_marks: number | null;
  passing_marks: number | null;
  note: string | null;
  is_active: ExamSchedule['is_active'];
  created_at: string | null;
  updated_at: string | null;
}

async function enrich(record: ScheduleRecord): Promise<ExamSchedule> {
  const [exams, subjectsResult, sessions] = await Promise.all([
    examsService.list(),
    subjectsService.list(),
    sessionsService.list(),
  ]);
  const subjects = subjectsResult.results;
  const exam = exams.results.find((e) => e.id === record.exam_id);
  const subject = subjects.find((s) => s.id === record.subject_id);
  const sessionId = record.session_id ?? exam?.session_id ?? 0;
  const session = sessions.results.find((s) => s.id === sessionId);
  return {
    id: record.id,
    exam_id: record.exam_id,
    exam_name: exam?.name ?? '—',
    subject_id: record.subject_id,
    subject_name: subject?.name ?? '—',
    session_id: sessionId,
    session_name: session?.session ?? '—',
    date_of_exam: record.date_of_exam,
    start_time: record.start_time,
    end_time: record.end_time,
    room_no: record.room_no,
    full_marks: record.full_marks,
    passing_marks: record.passing_marks,
    note: record.note,
    is_active: record.is_active,
    created_at: record.created_at ?? '',
    updated_at: record.updated_at,
  };
}

export const examSchedulesService = {
  list: async (): Promise<ExamSchedule[]> => {
    const { data } = await apiClient.get<ApiSuccessResponse<ScheduleRecord[]>>(
      API_ENDPOINTS.examinations.schedules,
    );
    const enriched = await Promise.all(data.data.map(enrich));
    return enriched.sort(
      (a, b) =>
        (a.date_of_exam ?? '').localeCompare(b.date_of_exam ?? '') ||
        a.exam_name.localeCompare(b.exam_name),
    );
  },

  create: async (payload: CreateExamSchedulePayload): Promise<ExamSchedule> => {
    const { data } = await apiClient.post<ApiSuccessResponse<ScheduleRecord>>(
      API_ENDPOINTS.examinations.schedules,
      payload,
    );
    return enrich(data.data);
  },

  update: async (id: number, payload: UpdateExamSchedulePayload): Promise<ExamSchedule> => {
    const { data } = await apiClient.patch<ApiSuccessResponse<ScheduleRecord>>(
      API_ENDPOINTS.examinations.scheduleDetail(id),
      payload,
    );
    return enrich(data.data);
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.examinations.scheduleDetail(id));
  },
};
