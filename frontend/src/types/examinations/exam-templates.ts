export interface AdmitCardTemplate {
  id: number;
  template: string;
  heading: string;
  title: string;
  exam_name: string;
  school_name: string;
  exam_center: string;
  content_footer: string;
  is_letter_head: number;
  is_name: number;
  is_father_name: number;
  is_mother_name: number;
  is_dob: number;
  is_admission_no: number;
  is_roll_no: number;
  is_address: number;
  is_gender: number;
  is_photo: number;
  is_class: number;
  is_section: number;
}

export type CreateAdmitCardTemplatePayload = Omit<AdmitCardTemplate, 'id'>;
export type UpdateAdmitCardTemplatePayload = CreateAdmitCardTemplatePayload;

export interface MarksheetTemplate {
  id: number;
  template: string;
  heading: string;
  title: string;
  exam_name: string;
  school_name: string;
  exam_center: string;
  content: string;
  content_footer: string;
  exam_session: number;
  is_name: number;
  is_father_name: number;
  is_mother_name: number;
  is_dob: number;
  is_admission_no: number;
  is_roll_no: number;
  is_photo: number;
  is_division: number;
  is_rank: number;
  is_customfield: number;
  is_class: number;
  is_teacher_remark: number;
  is_section: number;
}

export type CreateMarksheetTemplatePayload = Omit<MarksheetTemplate, 'id'>;
export type UpdateMarksheetTemplatePayload = CreateMarksheetTemplatePayload;
