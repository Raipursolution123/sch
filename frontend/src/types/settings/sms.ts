export interface SmsConfig {
  id: number;
  type: string;
  name: string;
  api_id: string;
  authkey: string;
  senderid: string;
  contact?: string | null;
  username?: string | null;
  url?: string | null;
  password?: string | null;
  is_active: 'enabled' | 'disabled';
  created_at: string;
  updated_at?: string | null;
}

export type SmsConfigUpdatePayload = Partial<Omit<SmsConfig, 'id' | 'created_at'>>;
