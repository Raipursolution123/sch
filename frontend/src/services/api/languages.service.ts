import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type {
  CreateLanguagePayload,
  Language,
  UpdateLanguagePayload,
} from '@app-types/settings/language';

// TODO: Remove mock store when GET /api/v1/settings/languages/ is available
let mockLanguages: Language[] = [
  {
    id: 1,
    language: 'English',
    short_code: 'en',
    country_code: 'us',
    is_rtl: false,
    is_active: 'yes',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: null,
  },
  {
    id: 2,
    language: 'Arabic',
    short_code: 'ar',
    country_code: 'sa',
    is_rtl: true,
    is_active: 'yes',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: null,
  },
  {
    id: 3,
    language: 'Hindi',
    short_code: 'hi',
    country_code: 'in',
    is_rtl: false,
    is_active: 'no',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: null,
  },
  {
    id: 4,
    language: 'Bengali',
    short_code: 'bn',
    country_code: 'in',
    is_rtl: false,
    is_active: 'no',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: null,
  },
];
let nextMockId = 5;

const USE_MOCK = true; // TODO: Set to false when backend languages API is deployed

function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function mockList(): Language[] {
  return [...mockLanguages].sort((a, b) => a.language.localeCompare(b.language));
}

function normalizeCode(value: string): string {
  return value.trim().toLowerCase();
}

export const languagesService = {
  list: async (): Promise<Language[]> => {
    if (USE_MOCK) {
      return delay(mockList());
    }
    // TODO: Wire when backend exposes GET /api/v1/settings/languages/
    const { data } = await apiClient.get<ApiSuccessResponse<Language[]>>(
      API_ENDPOINTS.settings.languages,
    );
    return data.data;
  },

  create: async (payload: CreateLanguagePayload): Promise<Language> => {
    if (USE_MOCK) {
      const shortCode = normalizeCode(payload.short_code);
      const countryCode = normalizeCode(payload.country_code);
      if (mockLanguages.some((l) => l.short_code === shortCode && l.country_code === countryCode)) {
        throw new Error('A language with this locale code already exists');
      }
      const created: Language = {
        id: nextMockId++,
        language: payload.language.trim(),
        short_code: shortCode,
        country_code: countryCode,
        is_rtl: payload.is_rtl,
        is_active: payload.is_active,
        created_at: new Date().toISOString(),
        updated_at: null,
      };
      mockLanguages = [...mockLanguages, created];
      return delay(created);
    }
    // TODO: Wire when backend exposes POST /api/v1/settings/languages/
    const { data } = await apiClient.post<ApiSuccessResponse<Language>>(
      API_ENDPOINTS.settings.languages,
      payload,
    );
    return data.data;
  },

  update: async (id: number, payload: UpdateLanguagePayload): Promise<Language> => {
    if (USE_MOCK) {
      const index = mockLanguages.findIndex((l) => l.id === id);
      if (index === -1) throw new Error('Language not found');
      const shortCode = normalizeCode(payload.short_code);
      const countryCode = normalizeCode(payload.country_code);
      const duplicate = mockLanguages.some(
        (l) => l.id !== id && l.short_code === shortCode && l.country_code === countryCode,
      );
      if (duplicate) {
        throw new Error('A language with this locale code already exists');
      }
      const updated: Language = {
        ...mockLanguages[index],
        language: payload.language.trim(),
        short_code: shortCode,
        country_code: countryCode,
        is_rtl: payload.is_rtl,
        is_active: payload.is_active,
        updated_at: new Date().toISOString().slice(0, 10),
      };
      mockLanguages = mockLanguages.map((l) => (l.id === id ? updated : l));
      return delay(updated);
    }
    // TODO: Wire when backend exposes PATCH /api/v1/settings/languages/{id}/
    const { data } = await apiClient.patch<ApiSuccessResponse<Language>>(
      API_ENDPOINTS.settings.languageDetail(id),
      payload,
    );
    return data.data;
  },

  delete: async (id: number): Promise<void> => {
    if (USE_MOCK) {
      const target = mockLanguages.find((l) => l.id === id);
      if (!target) throw new Error('Language not found');
      if (target.is_active === 'yes') {
        throw new Error('Cannot delete an active language. Deactivate it first.');
      }
      mockLanguages = mockLanguages.filter((l) => l.id !== id);
      return delay(undefined);
    }
    // TODO: Wire when backend exposes DELETE /api/v1/settings/languages/{id}/
    await apiClient.delete(API_ENDPOINTS.settings.languageDetail(id));
  },
};
