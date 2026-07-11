import type { ActiveFlag } from '@app-types/settings/session';

export interface StudentListItem {
  id: number;
  admission_no: string;
  roll_no: number | null;
  firstname: string;
  middlename: string | null;
  lastname: string | null;
  full_name: string;
  gender: string | null;
  mobileno: string | null;
  email: string | null;
  dob: string | null;
  is_active: ActiveFlag;
  class_id: number | null;
  section_id: number | null;
  class_name: string | null;
  section_name: string | null;
  admission_date: string | null;
  created_at: string;
  disable_reason_id?: number | null;
  disable_reason_name?: string | null;
  disable_note?: string | null;
  disabled_at?: string | null;
}

export interface StudentDetail extends StudentListItem {
  father_name: string | null;
  mother_name: string | null;
  guardian_name: string | null;
  guardian_phone: string | null;
  current_address: string | null;
  permanent_address: string | null;
  blood_group: string | null;
  religion: string | null;
  category_id: string | null;
  rte: string | null;
  updated_at: string | null;
}

export interface CreateStudentPayload {
  admission_no: string;
  admission_date: string;
  firstname: string;
  middlename: string | null;
  lastname: string;
  gender: string;
  dob: string;
  class_id: number;
  section_id: number;
  roll_no: number | null;
  mobileno: string | null;
  email: string | null;
  father_name: string | null;
  mother_name: string | null;
  guardian_name: string | null;
  guardian_phone: string | null;
  current_address: string | null;
  blood_group: string | null;
  religion: string | null;
  category_id: string | null;
  rte: string;
  is_active: ActiveFlag;
}

export type UpdateStudentPayload = CreateStudentPayload;
