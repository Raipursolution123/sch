export interface StaffLeaveAllotmentRow {
  id: number | null;
  leave_type_id: number;
  leave_type_name: string | null;
  leave_type_active: 'yes' | 'no';
  alloted_leave: string;
  used_leave: number;
  remaining_leave: number;
}

export interface StaffLeaveAllotmentRoster {
  staff_id: number;
  staff_name: string | null;
  employee_id: string | null;
  allotments: StaffLeaveAllotmentRow[];
}

export interface SaveStaffLeaveAllotmentsPayload {
  staff_id: number;
  entries: Array<{
    leave_type_id: number;
    alloted_leave: string | number;
  }>;
}
