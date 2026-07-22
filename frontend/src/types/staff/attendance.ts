import type { ActiveFlag } from '@app-types/settings/session';

export interface StaffAttendanceType {
  id: number;
  type: string;
  key_value: string;
  key: string;
  label: string;
  is_active: ActiveFlag;
}

export interface StaffAttendanceRosterEntry {
  staff_id: number;
  employee_id: string;
  name: string;
  staff_attendance_type_id: number;
  status_key: string;
  status_label: string;
  remark: string;
  attendance_id: number | null;
}

export interface StaffAttendanceRoster {
  date: string;
  entries: StaffAttendanceRosterEntry[];
}

export interface MarkStaffAttendancePayload {
  date: string;
  entries: Array<{
    staff_id: number;
    staff_attendance_type_id: number;
    remark?: string;
  }>;
}
