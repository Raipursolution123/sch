import type { ActiveFlag } from '@app-types/settings/session';

export interface StaffDepartment {
  id: number;
  name: string;
}

export interface StaffDesignation {
  id: number;
  name: string;
}

export interface StaffListItem {
  id: number;
  employee_id: string;
  name: string;
  surname: string;
  full_name: string;
  email: string;
  contact_no: string;
  gender: string;
  department_id: number;
  department_name: string;
  designation_id: number;
  designation_name: string;
  date_of_joining: string | null;
  is_active: ActiveFlag;
}

export interface StaffDetail extends StaffListItem {
  qualification: string;
  work_exp: string;
  father_name: string;
  mother_name: string;
  emergency_contact_no: string;
  dob: string;
  marital_status: string;
  date_of_leaving: string | null;
  local_address: string;
  permanent_address: string;
  contract_type: string;
  basic_salary: number | null;
  note: string;
  resume: Array<{ id: number; name: string; file_path: string }>;
  joining_letter: Array<{ id: number; name: string; file_path: string }>;
  resignation_letter: Array<{ id: number; name: string; file_path: string }>;
  other_documents: Array<{
    id: number;
    name: string;
    file_path: string;
    created_at?: string;
  }>;
  updated_at: string | null;
}

export interface CreateStaffPayload {
  employee_id: string;
  name: string;
  surname: string;
  gender: string;
  dob: string;
  email: string;
  contact_no: string;
  emergency_contact_no: string;
  department_id: number;
  designation_id: number;
  qualification: string;
  work_exp: string;
  date_of_joining: string | null;
  date_of_leaving: string | null;
  father_name: string | null;
  mother_name: string | null;
  local_address: string;
  permanent_address: string;
  marital_status: string;
  contract_type: string;
  basic_salary: number | null;
  is_active: ActiveFlag;
}

export type UpdateStaffPayload = CreateStaffPayload;
