export interface EmailConfig {
  id: number;
  email_type?: string | null;
  smtp_server?: string | null;
  smtp_port?: string | null;
  smtp_username?: string | null;
  smtp_password?: string | null;
  ssl_tls?: string | null;
  smtp_auth: string;
  api_key?: string | null;
  api_secret?: string | null;
  region?: string | null;
  is_active: 'yes' | 'no';
  created_at: string;
}

export type EmailConfigUpdatePayload = Partial<Omit<EmailConfig, 'id' | 'created_at'>>;
