import type { ActiveFlag } from '@app-types/settings/session';

export interface ExamSchedule {
  id: number;
  exam_id: number;
  exam_name: string;
  subject_id: number;
  subject_name: string;
  session_id: number;
  session_name: string;
  date_of_exam: string | null;
  start_time: string | null;
  end_time: string | null;
  room_no: string | null;
  full_marks: number | null;
  passing_marks: number | null;
  note: string | null;
  is_active: ActiveFlag;
  created_at: string;
  updated_at: string | null;
}

export interface CreateExamSchedulePayload {
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
  is_active: ActiveFlag;
}

export type UpdateExamSchedulePayload = CreateExamSchedulePayload;
