import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type {
  CreateLanguagePayload,
  Language,
  UpdateLanguagePayload,
} from '@app-types/settings/language';
import { type BackendPayload, extractCount, extractList } from '@utils/api-response';

// The backend returns is_rtl as 0 or 1. Let's map it to boolean for the frontend.
interface BackendLanguage extends Omit<Language, 'is_rtl'> {
  is_rtl: number | boolean;
}

const mapLanguage = (l: BackendLanguage): Language => ({
  ...l,
  is_rtl: Boolean(l.is_rtl),
});

export const languagesService = {
  list: async (page: number = 1): Promise<{ results: Language[]; count: number }> => {
    const { data } = await apiClient.get<BackendPayload>(
      `${API_ENDPOINTS.settings.languages}?page=${page}`,
    );
    const raw = extractList<BackendLanguage>(data, 'languages');
    return {
      results: raw.map(mapLanguage),
      count: extractCount(data, raw.length),
    };
  },

  create: async (payload: CreateLanguagePayload): Promise<Language> => {
    const backendPayload = {
      ...payload,
      is_rtl: payload.is_rtl ? 1 : 0,
    };
    const { data } = await apiClient.post<ApiSuccessResponse<BackendLanguage>>(
      API_ENDPOINTS.settings.languages,
      backendPayload,
    );
    return mapLanguage(data.data);
  },

  update: async (id: number, payload: UpdateLanguagePayload): Promise<Language> => {
    const backendPayload = {
      ...payload,
      is_rtl: payload.is_rtl ? 1 : 0,
    };
    const { data } = await apiClient.patch<ApiSuccessResponse<BackendLanguage>>(
      API_ENDPOINTS.settings.languageDetail(id),
      backendPayload,
    );
    return mapLanguage(data.data);
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.settings.languageDetail(id));
  },
};
