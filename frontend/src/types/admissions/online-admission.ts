export interface OnlineAdmission {
  id: number;
  admission_no: string | null;
  roll_no: string | null;
  reference_no: string;
  admission_date: string | null;
  firstname: string | null;
  middlename: string;
  lastname: string | null;
  rte: string;
  image: string | null;
  mobileno: string | null;
  email: string | null;
  state: string | null;
  city: string | null;
  pincode: string | null;
  religion: string | null;
  cast: string;
  dob: string | null;
  gender: string | null;
  current_address: string | null;
  permanent_address: string | null;
  category_id: number | null;
  class_section_id: number | null;
  route_id: number;
  school_house_id: number | null;
  blood_group: string;
  vehroute_id: number;
  hostel_room_id: number | null;
  adhar_no: string | null;
  samagra_id: string | null;
  bank_account_no: string | null;
  bank_name: string | null;
  ifsc_code: string | null;
  guardian_is: string;
  father_name: string | null;
  father_phone: string | null;
  father_occupation: string | null;
  mother_name: string | null;
  mother_phone: string | null;
  mother_occupation: string | null;
  guardian_name: string | null;
  guardian_relation: string | null;
  guardian_phone: string | null;
  guardian_occupation: string;
  guardian_address: string | null;
  guardian_email: string;
  father_pic: string;
  mother_pic: string;
  guardian_pic: string;
  is_enroll: number;
  previous_school: string | null;
  height: string;
  weight: string;
  note: string;
  form_status: number;
  paid_status: number;
  measurement_date: string | null;
  app_key: string | null;
  document: string | null;
  submit_date: string | null;
  disable_at: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface CreateOnlineAdmissionPayload {
  reference_no: string;
  admission_no?: string | null;
  roll_no?: string | null;
  admission_date?: string | null;
  firstname?: string | null;
  middlename?: string;
  lastname?: string | null;
  mobileno?: string | null;
  email?: string | null;
  gender?: string | null;
  class_section_id?: number | null;
  note?: string;
  form_status?: number;
  paid_status?: number;
}

export type UpdateOnlineAdmissionPayload = Partial<CreateOnlineAdmissionPayload>;

export interface ConvertOnlineAdmissionPayload {
  admission_no?: string;
  roll_no?: string | null;
  admission_date?: string | null;
  class_id?: number | null;
  section_id?: number | null;
}

export interface ConvertOnlineAdmissionResult {
  online_admission_id: number;
  student: {
    id: number;
    admission_no: string;
    firstname?: string;
    lastname?: string;
  };
}
