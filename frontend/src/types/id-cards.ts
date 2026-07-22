export interface StudentIdCardTemplate {
  id: number;
  title: string;
  school_name: string;
  school_address: string;
  background: string;
  logo: string;
  sign_image: string;
  header_color: string;
  enable_vertical_card: number;
  enable_admission_no: number;
  enable_student_name: number;
  enable_class: number;
  enable_fathers_name: number;
  enable_mothers_name: number;
  enable_address: number;
  enable_phone: number;
  enable_dob: number;
  enable_blood_group: number;
  enable_student_barcode: number;
  status: number;
}

export type CreateStudentIdCardPayload = Omit<StudentIdCardTemplate, 'id'> & {
  title: string;
};

export type UpdateStudentIdCardPayload = Partial<CreateStudentIdCardPayload>;

export interface StaffIdCardTemplate {
  id: number;
  title: string;
  school_name: string;
  school_address: string;
  background: string;
  logo: string;
  sign_image: string;
  header_color: string;
  enable_vertical_card: number;
  enable_staff_role: number;
  enable_staff_id: number;
  enable_staff_department: number;
  enable_designation: number;
  enable_name: number;
  enable_fathers_name: number;
  enable_mothers_name: number;
  enable_date_of_joining: number;
  enable_permanent_address: number;
  enable_staff_dob: number;
  enable_staff_phone: number;
  enable_staff_barcode: number;
  status: number;
}

export type CreateStaffIdCardPayload = Omit<StaffIdCardTemplate, 'id'> & {
  title: string;
};

export type UpdateStaffIdCardPayload = Partial<CreateStaffIdCardPayload>;

export interface IdCardPreviewField {
  label: string;
  value: string;
}

export interface IdCardPreview {
  kind: 'student' | 'staff' | string;
  template_id: number;
  title: string;
  school_name: string;
  school_address: string;
  background: string;
  logo: string;
  sign_image: string;
  header_color: string;
  enable_vertical_card: number;
  person_id: number;
  person_name: string;
  photo: string | null;
  barcode: string;
  fields: IdCardPreviewField[];
}
