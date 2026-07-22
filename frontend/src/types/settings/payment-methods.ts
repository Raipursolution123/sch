export interface PaymentGateway {
  id: number;
  payment_type: string;
  api_username: string | null;
  api_secret_key: string;
  salt: string;
  api_publishable_key: string;
  api_password?: string | null;
  api_signature?: string | null;
  api_email?: string | null;
  paypal_demo: string;
  account_no: string;
  is_active: 'yes' | 'no';
  gateway_mode: number;
  paytm_website: string;
  paytm_industrytype: string;
  created_at: string | null;
  updated_at: string | null;
}

export type PaymentGatewayUpdatePayload = Partial<Omit<PaymentGateway, 'id' | 'payment_type' | 'created_at' | 'updated_at'>>;
