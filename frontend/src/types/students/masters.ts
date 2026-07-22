export interface StudentCategory {
  id: number;
  name: string;
  is_active: string;
  created_at: string | null;
}

export type CreateStudentCategoryPayload = {
  name: string;
  is_active?: string;
};

export type UpdateStudentCategoryPayload = Partial<CreateStudentCategoryPayload>;

export interface StudentHouse {
  id: number;
  house_name: string;
  description: string;
  house_incharge: number | null;
  house_president: number | null;
  is_active: string;
}

export type CreateStudentHousePayload = {
  house_name: string;
  description?: string;
  house_incharge?: number | null;
  house_president?: number | null;
  is_active?: string;
};

export type UpdateStudentHousePayload = Partial<CreateStudentHousePayload>;

export interface StudentImportTemplate {
  columns: string[];
  required: string[];
  notes: string;
}

export type StudentImportRow = Record<string, string | number | null | undefined>;

export interface StudentImportResult {
  created_count: number;
  error_count: number;
  created: Array<{ row: number; id: number; admission_no: string }>;
  errors: Array<{ row: number; message: string }>;
}
