export interface ComplaintType {
  id: number;
  complaint_type: string;
  description: string;
  created_at: string | null;
}

export interface CreateComplaintTypePayload {
  complaint_type: string;
  description?: string;
}

export type UpdateComplaintTypePayload = CreateComplaintTypePayload;

export interface Source {
  id: number;
  source: string;
  description: string;
}

export interface CreateSourcePayload {
  source: string;
  description?: string;
}

export type UpdateSourcePayload = CreateSourcePayload;

export interface Reference {
  id: number;
  reference: string;
  description: string;
}

export interface CreateReferencePayload {
  reference: string;
  description?: string;
}

export type UpdateReferencePayload = CreateReferencePayload;
