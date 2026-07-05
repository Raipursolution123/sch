export interface Currency {
  id: number;
  name: string;
  short_name: string;
  symbol: string;
  base_price: string;
  is_active: boolean;
  created_at: string;
}

export interface CreateCurrencyPayload {
  name: string;
  short_name: string;
  symbol: string;
  base_price: string;
  is_active: boolean;
}

export type UpdateCurrencyPayload = CreateCurrencyPayload;
