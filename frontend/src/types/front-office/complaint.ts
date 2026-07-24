export interface Complaint {
  id: number;
  complaint_type: string;
  source: string;
  name: string;
  contact: string;
  email: string;
  date: string;
  description: string;
  action_taken: string;
  assigned: string;
  note: string;
  image: string | null;
}

export interface CreateComplaintPayload {
  complaint_type?: string;
  source?: string;
  name: string;
  contact?: string;
  email?: string;
  date: string;
  description?: string;
  action_taken?: string;
  assigned?: string;
  note?: string;
  image?: string | null;
}

export type UpdateComplaintPayload = Partial<CreateComplaintPayload>;
