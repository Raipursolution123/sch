export interface NotificationSetting {
  id: number;
  type: string;
  is_mail: string;
  is_sms: string;
  is_notification: number;
  display_notification: number;
  display_sms: number;
  is_student_recipient: number | null;
  is_guardian_recipient: number | null;
  is_staff_recipient: number | null;
  display_student_recipient: number | null;
  display_guardian_recipient: number | null;
  display_staff_recipient: number | null;
  subject: string;
  template_id: string;
  template: string;
  variables: string;
  created_at: string | null;
}

export type NotificationSettingPayload = Partial<Omit<NotificationSetting, 'id' | 'created_at'>> & {
  subject?: string;
  template?: string;
};

export interface SmsConfig {
  id: number;
  type: string;
  name: string;
  api_id: string;
  authkey: string | null;
  senderid: string;
  contact: string;
  username: string;
  url: string;
  password: string | null;
  is_active: string;
  created_at: string | null;
  updated_at: string | null;
}

export type SmsConfigPayload = Partial<Omit<SmsConfig, 'id' | 'created_at' | 'updated_at'>> & {
  name?: string;
  type?: string;
};

export interface EmailConfig {
  id: number;
  email_type: string;
  smtp_server: string;
  smtp_port: string;
  smtp_username: string;
  smtp_password: string | null;
  ssl_tls: string;
  smtp_auth: string;
  api_key: string | null;
  api_secret: string | null;
  region: string;
  is_active: string;
  created_at: string | null;
}

export type EmailConfigPayload = Partial<Omit<EmailConfig, 'id' | 'created_at'>> & {
  email_type?: string;
};

export interface PaymentMethod {
  id: number;
  payment_type: string;
  api_username: string;
  api_secret_key: string | null;
  salt: string | null;
  api_publishable_key: string;
  api_password: string | null;
  api_signature: string | null;
  api_email: string;
  paypal_demo: string;
  account_no: string;
  is_active: string;
  gateway_mode: number;
  paytm_website: string;
  paytm_industrytype: string;
  created_at: string | null;
  updated_at: string | null;
}

export type PaymentMethodPayload = Partial<
  Omit<PaymentMethod, 'id' | 'created_at' | 'updated_at'>
> & {
  payment_type?: string;
};

export interface PrintHeaderFooter {
  id: number;
  print_type: string;
  header_image: string;
  footer_content: string;
  created_by: number;
  entry_date: string | null;
  created_at: string | null;
}

export type PrintHeaderFooterPayload = {
  print_type: string;
  header_image: string;
  footer_content?: string;
};
