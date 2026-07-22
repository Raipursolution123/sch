export interface ContentType {
  id: number;
  name: string;
  description: string | null;
  is_active: number | null;
  created_at: string | null;
}

export type CreateContentTypePayload = {
  name: string;
  description?: string | null;
  is_active?: number;
};

export type UpdateContentTypePayload = Partial<CreateContentTypePayload>;

export interface UploadContent {
  id: number;
  content_type_id: number;
  class_id: number | null;
  section_id: number | null;
  subject_id: number | null;
  lesson_id: number | null;
  image: string | null;
  thumb_path: string | null;
  dir_path: string | null;
  real_name: string;
  img_name: string | null;
  thumb_name: string | null;
  file_type: string;
  mime_type: string;
  file_size: string;
  vid_url: string;
  vid_title: string;
  upload_by: number;
  created_at: string | null;
}

export type CreateUploadContentPayload = {
  content_type_id: number;
  real_name: string;
  dir_path?: string;
  file_type?: string;
  mime_type?: string;
  file_size?: string;
  vid_url?: string;
  vid_title?: string;
};
