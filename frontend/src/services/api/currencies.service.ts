import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type {
  CreateCurrencyPayload,
  Currency,
  UpdateCurrencyPayload,
} from '@app-types/settings/currency';

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
    const { data } = await apiClient.get<any>(
      `${API_ENDPOINTS.settings.currencies}?page=${page}`,
    );

    // Standard paginated DRF response (results is array)
    if (data?.results && Array.isArray(data.results)) {
      return {
        results: data.results.map(mapCurrency),
        count: data.count || 0,
      };
    }

    // Standard paginated DRF response: { count, next, previous, results: { currencies: [...] } }
    if (data?.results?.currencies && Array.isArray(data.results.currencies)) {
      return {
        results: data.results.currencies.map(mapCurrency),
        count: data.count || 0,
      };
    }

    // Fallback: raw array wrapper
    if (Array.isArray(data?.data)) {
      return {
        results: (data.data as unknown as BackendCurrency[]).map(mapCurrency),
        count: data.data.length,
      };
    }

    return { results: [], count: 0 };
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
