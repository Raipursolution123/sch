export interface Enquiry {
  id: number;
  name: string;
  contact: string;
  address: string;
  reference: string;
  date: string;
  description: string;
  follow_up_date: string;
  note: string;
  source: string;
  email: string | null;
  assigned: number | null;
  class_id: number | null;
  no_of_child: string | null;
  status: string;
  created_by: number;
  created_at: string;
  referral_staff: string | null;
  is_converted_to_admission: number;
}

export interface CreateEnquiryPayload {
  name: string;
  contact: string;
  address?: string;
  reference?: string;
  date?: string;
  description?: string;
  follow_up_date?: string;
  note?: string;
  source?: string;
  email?: string | null;
  assigned?: number | null;
  class_id?: number | null;
  no_of_child?: string | null;
  status?: string;
  referral_staff?: string | null;
  is_converted_to_admission?: number;
}

export type UpdateEnquiryPayload = Partial<CreateEnquiryPayload>;
