export const TIMETABLE_DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

export type TimetableDay = (typeof TIMETABLE_DAYS)[number];

export interface TimetablePeriod {
  id: number;
  session_id: number | null;
  class_id: number | null;
  section_id: number | null;
  class_name: string | null;
  section_name: string | null;
  subject_group_id: number | null;
  subject_group_subject_id: number | null;
  subject_id: number | null;
  subject_name: string | null;
  subject_code: string | null;
  staff_id: number | null;
  staff_name: string | null;
  day: TimetableDay | string | null;
  start_time: string | null;
  end_time: string | null;
  time_from: string | null;
  time_to: string | null;
  room_no: string | null;
  created_at: string | null;
}

export interface TimetableSubjectOption {
  subject_group_subject_id: number;
  subject_group_id: number | null;
  subject_id: number;
  subject_name: string;
  subject_code: string;
  subject_type: string;
}

export interface CreateTimetablePeriodPayload {
  session_id: number;
  class_id: number;
  section_id: number;
  subject_group_subject_id: number;
  staff_id: number;
  day: TimetableDay;
  start_time: string;
  end_time: string;
  room_no?: string | null;
}

export interface UpdateTimetablePeriodPayload {
  subject_group_subject_id?: number;
  staff_id?: number;
  day?: TimetableDay;
  start_time?: string;
  end_time?: string;
  room_no?: string | null;
}
