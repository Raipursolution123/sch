import type { AttendanceStatusKey } from '@app-types/attendance/attendance';

export interface SubjectAttendancePeriod {
  id: number;
  day: string | null;
  subject_name: string | null;
  subject_code: string | null;
  staff_name: string | null;
  time_from: string | null;
  time_to: string | null;
  start_time: string | null;
  end_time: string | null;
  room_no: string | null;
}

export interface SubjectAttendanceRosterEntry {
  student_id: number;
  student_session_id: number;
  admission_no: string;
  full_name: string;
  roll_no: number | string | null;
  attendence_type_id: number;
  status_key: AttendanceStatusKey | string;
  status_label: string;
  remark: string;
  attendance_id: number | null;
}

export interface SubjectAttendanceRoster {
  subject_timetable_id: number;
  date: string;
  class_id: number;
  class_name: string;
  section_id: number;
  section_name: string;
  period: SubjectAttendancePeriod;
  entries: SubjectAttendanceRosterEntry[];
}

export interface MarkSubjectAttendancePayload {
  subject_timetable_id: number;
  date: string;
  entries: Array<{
    student_id: number;
    attendence_type_id: number;
    remark?: string;
  }>;
}
