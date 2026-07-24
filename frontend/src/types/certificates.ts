export interface CertificateTemplate {
  id: number;
  certificate_name: string;
  certificate_text: string;
  left_header: string;
  center_header: string;
  right_header: string;
  left_footer: string;
  right_footer: string;
  center_footer: string;
  background_image: string | null;
  created_for: number;
  status: number;
  header_height: number;
  content_height: number;
  footer_height: number;
  content_width: number;
  enable_student_image: number;
  enable_image_height: number;
  created_at: string | null;
  updated_at: string | null;
}

export type CreateCertificateTemplatePayload = {
  certificate_name: string;
  certificate_text: string;
  left_header?: string;
  center_header?: string;
  right_header?: string;
  left_footer?: string;
  right_footer?: string;
  center_footer?: string;
  background_image?: string | null;
  created_for?: number;
  status?: number;
  header_height?: number;
  content_height?: number;
  footer_height?: number;
  content_width?: number;
  enable_student_image?: number;
  enable_image_height?: number;
};

export type UpdateCertificateTemplatePayload = Partial<CreateCertificateTemplatePayload>;

export interface CertificatePreview {
  certificate_id: number;
  certificate_name: string;
  student_id: number;
  student_name: string;
  left_header: string;
  center_header: string;
  right_header: string;
  left_footer: string;
  center_footer: string;
  right_footer: string;
  certificate_text: string;
  background_image: string | null;
  header_height: number;
  content_height: number;
  footer_height: number;
  content_width: number;
  enable_student_image: number;
  enable_image_height: number;
  student_image: string | null;
}
