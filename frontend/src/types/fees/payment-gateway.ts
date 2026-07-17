export interface PaymentGateway {
  id: number;
  payment_type: string;
  api_username: string | null;
  api_secret_key: string | null;
  api_publishable_key: string | null;
  api_email: string | null;
  account_no: string | null;
  is_active: string | null;
  gateway_mode: number;
  paypal_demo: string | null;
  paytm_website: string | null;
  paytm_industrytype: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}
