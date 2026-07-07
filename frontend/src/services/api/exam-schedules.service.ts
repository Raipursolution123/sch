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
  session_id: number;
  date_of_exam: string | null;
  start_time: string | null;
  end_time: string | null;
  room_no: string | null;
  full_marks: number | null;
  passing_marks: number | null;
  note: string | null;
  is_active: ExamSchedule['is_active'];
  created_at: string;
  updated_at: string | null;
}

// TODO: Remove mock store when GET /api/v1/examinations/schedules/ is available
let mockSchedules: ScheduleRecord[] = [
  {
    id: 1,
    exam_id: 1,
    subject_id: 2,
    session_id: 1,
    date_of_exam: '2025-09-05',
    start_time: '09:00',
    end_time: '12:00',
    room_no: '101',
    full_marks: 100,
    passing_marks: 33,
    note: null,
    is_active: 'yes',
    created_at: '2025-04-01T00:00:00Z',
    updated_at: null,
  },
  {
    id: 2,
    exam_id: 1,
    subject_id: 1,
    session_id: 1,
    date_of_exam: '2025-09-07',
    start_time: '09:00',
    end_time: '12:00',
    room_no: '102',
    full_marks: 100,
    passing_marks: 33,
    note: null,
    is_active: 'yes',
    created_at: '2025-04-01T00:00:00Z',
    updated_at: null,
  },
  {
    id: 3,
    exam_id: 1,
    subject_id: 3,
    session_id: 1,
    date_of_exam: '2025-09-10',
    start_time: '09:00',
    end_time: '12:00',
    room_no: '103',
    full_marks: 100,
    passing_marks: 33,
    note: 'Practical in lab',
    is_active: 'yes',
    created_at: '2025-04-01T00:00:00Z',
    updated_at: null,
  },
];
let nextMockId = 4;

const USE_MOCK = true;

function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

async function enrich(record: ScheduleRecord): Promise<ExamSchedule> {
  const [exams, subjects, sessions] = await Promise.all([
    examsService.list(),
    subjectsService.list(),
    sessionsService.list(),
  ]);
  const exam = exams.find((e) => e.id === record.exam_id);
  const subject = subjects.find((s) => s.id === record.subject_id);
  const session = sessions.results.find((s) => s.id === record.session_id);
  return {
    id: record.id,
    exam_id: record.exam_id,
    exam_name: exam?.name ?? '—',
    subject_id: record.subject_id,
    subject_name: subject?.name ?? '—',
    session_id: record.session_id,
    session_name: session?.session ?? '—',
    date_of_exam: record.date_of_exam,
    start_time: record.start_time,
    end_time: record.end_time,
    room_no: record.room_no,
    full_marks: record.full_marks,
    passing_marks: record.passing_marks,
    note: record.note,
    is_active: record.is_active,
    created_at: record.created_at,
    updated_at: record.updated_at,
  };
}

export const examSchedulesService = {
  list: async (): Promise<ExamSchedule[]> => {
    if (USE_MOCK) {
      const enriched = await Promise.all(mockSchedules.map(enrich));
      return delay(
        enriched.sort(
          (a, b) =>
            (a.date_of_exam ?? '').localeCompare(b.date_of_exam ?? '') ||
            a.exam_name.localeCompare(b.exam_name),
        ),
      );
    }
    // TODO: Wire when backend exposes GET /api/v1/examinations/schedules/
    const { data } = await apiClient.get<ApiSuccessResponse<ExamSchedule[]>>(
      API_ENDPOINTS.examinations.schedules,
    );
    return data.data;
  },

  create: async (payload: CreateExamSchedulePayload): Promise<ExamSchedule> => {
    if (USE_MOCK) {
      const [exams, subjects, sessions] = await Promise.all([
        examsService.list(),
        subjectsService.list(),
        sessionsService.list(),
      ]);
      if (!exams.some((e) => e.id === payload.exam_id && e.is_active === 'yes')) {
        throw new Error('Selected exam is not available');
      }
      if (!subjects.some((s) => s.id === payload.subject_id && s.is_active === 'yes')) {
        throw new Error('Selected subject is not available');
      }
      if (!sessions.results.some((s) => s.id === payload.session_id)) {
        throw new Error('Selected session is not available');
      }
      const duplicate = mockSchedules.some(
        (s) =>
          s.exam_id === payload.exam_id &&
          s.subject_id === payload.subject_id &&
          s.session_id === payload.session_id,
      );
      if (duplicate) {
        throw new Error('A schedule for this exam and subject already exists');
      }
      const created: ScheduleRecord = {
        id: nextMockId++,
        exam_id: payload.exam_id,
        subject_id: payload.subject_id,
        session_id: payload.session_id,
        date_of_exam: payload.date_of_exam,
        start_time: payload.start_time?.trim() || null,
        end_time: payload.end_time?.trim() || null,
        room_no: payload.room_no?.trim() || null,
        full_marks: payload.full_marks,
        passing_marks: payload.passing_marks,
        note: payload.note?.trim() || null,
        is_active: payload.is_active,
        created_at: new Date().toISOString(),
        updated_at: null,
      };
      mockSchedules = [...mockSchedules, created];
      return delay(await enrich(created));
    }
    // TODO: Wire when backend exposes POST /api/v1/examinations/schedules/
    const { data } = await apiClient.post<ApiSuccessResponse<ExamSchedule>>(
      API_ENDPOINTS.examinations.schedules,
      payload,
    );
    return data.data;
  },

  update: async (id: number, payload: UpdateExamSchedulePayload): Promise<ExamSchedule> => {
    if (USE_MOCK) {
      const index = mockSchedules.findIndex((s) => s.id === id);
      if (index === -1) throw new Error('Schedule not found');
      const updated: ScheduleRecord = {
        ...mockSchedules[index],
        exam_id: payload.exam_id,
        subject_id: payload.subject_id,
        session_id: payload.session_id,
        date_of_exam: payload.date_of_exam,
        start_time: payload.start_time?.trim() || null,
        end_time: payload.end_time?.trim() || null,
        room_no: payload.room_no?.trim() || null,
        full_marks: payload.full_marks,
        passing_marks: payload.passing_marks,
        note: payload.note?.trim() || null,
        is_active: payload.is_active,
        updated_at: new Date().toISOString(),
      };
      mockSchedules = mockSchedules.map((s) => (s.id === id ? updated : s));
      return delay(await enrich(updated));
    }
    // TODO: Wire when backend exposes PATCH /api/v1/examinations/schedules/{id}/
    const { data } = await apiClient.patch<ApiSuccessResponse<ExamSchedule>>(
      API_ENDPOINTS.examinations.scheduleDetail(id),
      payload,
    );
    return data.data;
  },

  delete: async (id: number): Promise<void> => {
    if (USE_MOCK) {
      const record = mockSchedules.find((s) => s.id === id);
      if (!record) throw new Error('Schedule not found');
      if (record.is_active === 'yes') {
        throw new Error('Deactivate the schedule before deleting');
      }
      mockSchedules = mockSchedules.filter((s) => s.id !== id);
      return delay(undefined);
    }
    // TODO: Wire when backend exposes DELETE /api/v1/examinations/schedules/{id}/
    await apiClient.delete(API_ENDPOINTS.examinations.scheduleDetail(id));
  },
};
