export interface PhoneCallLog {
  id: number;
  name: string;
  contact: string;
  date: string | null;
  description: string;
  follow_up_date: string | null;
  call_duration: string;
  note: string;
  call_type: 'Incoming' | 'Outgoing' | string;
  created_at: string | null;
}

export interface CreatePhoneCallLogPayload {
  name: string;
  contact: string;
  date: string;
  description?: string;
  follow_up_date?: string;
  call_duration?: string;
  note?: string;
  call_type: 'Incoming' | 'Outgoing';
}

export type UpdatePhoneCallLogPayload = CreatePhoneCallLogPayload;

export interface VisitorPurpose {
  id: number;
  visitors_purpose: string;
  name: string;
  description: string;
  created_at: string | null;
}

export interface CreateVisitorPurposePayload {
  visitors_purpose: string;
  description?: string;
}

export type UpdateVisitorPurposePayload = CreateVisitorPurposePayload;
