import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type {
  CreateCurrencyPayload,
  Currency,
  UpdateCurrencyPayload,
} from '@app-types/settings/currency';

// TODO: Remove mock store when GET /api/v1/settings/currencies/ is available
let mockCurrencies: Currency[] = [
  {
    id: 68,
    name: 'INR',
    short_name: 'INR',
    symbol: '₹',
    base_price: '1',
    is_active: true,
    created_at: '2023-12-21T05:58:42Z',
  },
  {
    id: 150,
    name: 'USD',
    short_name: 'USD',
    symbol: '$',
    base_price: '1',
    is_active: false,
    created_at: '2023-12-21T06:20:21Z',
  },
  {
    id: 53,
    name: 'GBP',
    short_name: 'GBP',
    symbol: '£',
    base_price: '1',
    is_active: false,
    created_at: '2022-12-30T06:20:29Z',
  },
  {
    id: 74,
    name: 'JPY',
    short_name: 'JPY',
    symbol: '¥',
    base_price: '1',
    is_active: false,
    created_at: '2022-12-30T06:19:56Z',
  },
];
let nextMockId = 200;

const USE_MOCK = true; // TODO: Set to false when backend currencies API is deployed

function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function mockList(): Currency[] {
  return [...mockCurrencies].sort((a, b) => a.short_name.localeCompare(b.short_name));
}

function normalizeShortName(value: string): string {
  return value.trim().toUpperCase();
}

function applyActiveCurrency(id: number | null): void {
  mockCurrencies = mockCurrencies.map((currency) => ({
    ...currency,
    is_active: id !== null && currency.id === id,
  }));
}

export const currenciesService = {
  list: async (): Promise<Currency[]> => {
    if (USE_MOCK) {
      return delay(mockList());
    }
    // TODO: Wire when backend exposes GET /api/v1/settings/currencies/
    const { data } = await apiClient.get<ApiSuccessResponse<Currency[]>>(
      API_ENDPOINTS.settings.currencies,
    );
    return data.data;
  },

  create: async (payload: CreateCurrencyPayload): Promise<Currency> => {
    if (USE_MOCK) {
      const shortName = normalizeShortName(payload.short_name);
      if (mockCurrencies.some((c) => c.short_name === shortName)) {
        throw new Error('A currency with this short name already exists');
      }
      const created: Currency = {
        id: nextMockId++,
        name: payload.name.trim(),
        short_name: shortName,
        symbol: payload.symbol.trim(),
        base_price: payload.base_price.trim(),
        is_active: payload.is_active,
        created_at: new Date().toISOString(),
      };
      mockCurrencies = [...mockCurrencies, created];
      if (payload.is_active) {
        applyActiveCurrency(created.id);
      }
      return delay(mockCurrencies.find((c) => c.id === created.id)!);
    }
    // TODO: Wire when backend exposes POST /api/v1/settings/currencies/
    const { data } = await apiClient.post<ApiSuccessResponse<Currency>>(
      API_ENDPOINTS.settings.currencies,
      payload,
    );
    return data.data;
  },

  update: async (id: number, payload: UpdateCurrencyPayload): Promise<Currency> => {
    if (USE_MOCK) {
      const index = mockCurrencies.findIndex((c) => c.id === id);
      if (index === -1) throw new Error('Currency not found');
      const shortName = normalizeShortName(payload.short_name);
      const duplicate = mockCurrencies.some((c) => c.id !== id && c.short_name === shortName);
      if (duplicate) {
        throw new Error('A currency with this short name already exists');
      }
      const updated: Currency = {
        ...mockCurrencies[index],
        name: payload.name.trim(),
        short_name: shortName,
        symbol: payload.symbol.trim(),
        base_price: payload.base_price.trim(),
        is_active: payload.is_active,
      };
      mockCurrencies = mockCurrencies.map((c) => (c.id === id ? updated : c));
      if (payload.is_active) {
        applyActiveCurrency(id);
      } else if (mockCurrencies.filter((c) => c.is_active).length === 0) {
        throw new Error('At least one currency must remain active');
      }
      return delay(mockCurrencies.find((c) => c.id === id)!);
    }
    // TODO: Wire when backend exposes PATCH /api/v1/settings/currencies/{id}/
    const { data } = await apiClient.patch<ApiSuccessResponse<Currency>>(
      API_ENDPOINTS.settings.currencyDetail(id),
      payload,
    );
    return data.data;
  },

  activate: async (id: number): Promise<Currency> => {
    if (USE_MOCK) {
      const target = mockCurrencies.find((c) => c.id === id);
      if (!target) throw new Error('Currency not found');
      applyActiveCurrency(id);
      return delay(mockCurrencies.find((c) => c.id === id)!);
    }
    // TODO: Wire when backend exposes POST /api/v1/settings/currencies/{id}/activate/
    const { data } = await apiClient.post<ApiSuccessResponse<Currency>>(
      API_ENDPOINTS.settings.currencyActivate(id),
    );
    return data.data;
  },

  delete: async (id: number): Promise<void> => {
    if (USE_MOCK) {
      const target = mockCurrencies.find((c) => c.id === id);
      if (!target) throw new Error('Currency not found');
      if (target.is_active) {
        throw new Error('Cannot delete the active currency. Activate another currency first.');
      }
      mockCurrencies = mockCurrencies.filter((c) => c.id !== id);
      return delay(undefined);
    }
    // TODO: Wire when backend exposes DELETE /api/v1/settings/currencies/{id}/
    await apiClient.delete(API_ENDPOINTS.settings.currencyDetail(id));
  },
};
