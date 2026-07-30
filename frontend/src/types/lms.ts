export interface Course {
  id: number;
  title: string;
  slug: string;
  description: string;
  price: number;
  discount: number;
  free_course: number;
  front_side_visibility: string;
  status: number;
  created_date: string;
  updated_date: string;
}

export interface CreateCoursePayload {
  title: string;
  description?: string;
  price?: number;
  discount?: number;
  free_course?: number;
  front_side_visibility?: string;
  status?: number;
}

export interface UpdateCoursePayload extends Partial<CreateCoursePayload> {}
