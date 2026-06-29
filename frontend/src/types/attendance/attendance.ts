import type { ActiveFlag } from '@app-types/settings/session';

export type AttendanceStatusKey = 'present' | 'absent' | 'late' | 'half_day' | 'holiday';

export interface AttendanceType {
  id: number;
  key: AttendanceStatusKey;
  label: string;
  is_active: ActiveFlag;
}

export interface AttendanceRosterEntry {
  student_id: number;
  admission_no: string;
  full_name: string;
  roll_no: number | null;
  attendence_type_id: number;
  status_key: AttendanceStatusKey;
  status_label: string;
  remark: string;
}

export interface AttendanceRoster {
  class_id: number;
  class_name: string;
  section_id: number;
  section_name: string;
  date: string;
  entries: AttendanceRosterEntry[];
}

export interface MarkAttendanceEntryPayload {
  student_id: number;
  attendence_type_id: number;
  remark?: string;
}

export interface MarkAttendancePayload {
  class_id: number;
  section_id: number;
  date: string;
  entries: MarkAttendanceEntryPayload[];
}

export interface AttendanceReportRow {
  id: number;
  student_id: number;
  student_name: string;
  roll_no: number | null;
  class_name: string;
  section_name: string;
  date: string;
  status_key: AttendanceStatusKey;
  status_label: string;
  remark: string;
}

export interface AttendanceReportFilters {
  class_id?: number;
  section_id?: number;
  from_date: string;
  to_date: string;
}

export interface AttendanceReportSummary {
  total_records: number;
  present: number;
  absent: number;
  late: number;
  half_day: number;
  holiday: number;
  rows: AttendanceReportRow[];
}
