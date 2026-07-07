import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type {
  CreateCurrencyPayload,
  Currency,
  UpdateCurrencyPayload,
} from '@app-types/settings/currency';
import { type BackendPayload, extractCount, extractList } from '@utils/api-response';

interface BackendCurrency {
  id: number;
  name: string;
  short_name: string;
  symbol: string;
  base_price: string;
  is_active: number;
  created_at: string;
}

function mapCurrency(c: BackendCurrency): Currency {
  return {
    ...c,
    is_active: Boolean(c.is_active),
  };
}

export const currenciesService = {
  list: async (page: number = 1): Promise<{ results: Currency[]; count: number }> => {
    const { data } = await apiClient.get<BackendPayload>(
      `${API_ENDPOINTS.settings.currencies}?page=${page}`,
    );
    const raw = extractList<BackendCurrency>(data, 'currencies');
    return {
      results: raw.map(mapCurrency),
      count: extractCount(data, raw.length),
    };
  },

  create: async (payload: CreateCurrencyPayload): Promise<Currency> => {
    const backendPayload = {
      ...payload,
      is_active: payload.is_active ? 1 : 0,
    };
    const { data } = await apiClient.post<ApiSuccessResponse<BackendCurrency>>(
      API_ENDPOINTS.settings.currencies,
      backendPayload,
    );
    return mapCurrency(data.data);
  },

  update: async (id: number, payload: UpdateCurrencyPayload): Promise<Currency> => {
    const backendPayload = {
      ...payload,
      is_active: payload.is_active ? 1 : 0,
    };
    const { data } = await apiClient.patch<ApiSuccessResponse<BackendCurrency>>(
      API_ENDPOINTS.settings.currencyDetail(id),
      backendPayload,
    );
    return mapCurrency(data.data);
  },

  activate: async (id: number): Promise<Currency> => {
    const { data } = await apiClient.post<ApiSuccessResponse<BackendCurrency>>(
      API_ENDPOINTS.settings.currencyActivate(id),
    );
    return mapCurrency(data.data);
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.settings.currencyDetail(id));
  },
};
