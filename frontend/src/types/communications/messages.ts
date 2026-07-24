export type MessageChannel = 'email' | 'sms';
export type MessageAudience = 'group' | 'individual' | 'class';

export interface CommunicationMessage {
  id: number;
  title: string;
  message: string;
  send_through: string;
  send_mail: boolean;
  send_sms: boolean;
  is_group: boolean;
  is_individual: boolean;
  is_class: boolean;
  is_schedule: boolean;
  sent: number;
  delivery_status: 'queued' | 'sent' | string;
  group_list: string;
  user_list: string;
  class_id: number | null;
  section_id: string;
  created_at: string | null;
  updated_at: string | null;
  recipient_count?: number;
}

export interface ComposeMessagePayload {
  title: string;
  message: string;
  audience: MessageAudience;
  group_list?: string;
  user_list?: string;
  class_id?: number;
  section_id?: number | string;
  template_id?: string;
}

export interface BulkEmailPayload {
  title: string;
  message: string;
  session_id: number;
  class_id: number;
  section_id?: number | null;
}
