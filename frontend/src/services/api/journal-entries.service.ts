import { apiClient } from './client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse, PaginatedResponse } from '@app-types/api';
import type { EntryType, JournalEntry, JournalEntryCreatePayload } from '@app-types/finance';

export const journalEntriesService = {
  listEntryTypes: async (): Promise<EntryType[]> => {
    const response = await apiClient.get<ApiSuccessResponse<EntryType[]>>(
      API_ENDPOINTS.finance.entryTypes,
    );
    return response.data.data ?? [];
  },

  list: async (page = 1): Promise<PaginatedResponse<JournalEntry>> => {
    const response = await apiClient.get<ApiSuccessResponse<PaginatedResponse<JournalEntry>>>(
      API_ENDPOINTS.finance.entries,
      { params: { page } },
    );
    return response.data.data;
  },

  get: async (id: number): Promise<JournalEntry> => {
    const response = await apiClient.get<ApiSuccessResponse<JournalEntry>>(
      API_ENDPOINTS.finance.entryDetail(id),
    );
    return response.data.data;
  },

  create: async (payload: JournalEntryCreatePayload) => {
    const response = await apiClient.post<{ data: JournalEntry; message: string }>(
      API_ENDPOINTS.finance.entries,
      payload,
    );
    return response.data;
  },

  delete: async (id: number) => {
    const response = await apiClient.delete<{ message: string }>(
      API_ENDPOINTS.finance.entryDetail(id),
    );
    return response.data;
  },
};
