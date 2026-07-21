import { apiClient } from './client';
import type { JournalEntry, JournalEntryCreatePayload } from '@/types/finance';
import type { ApiSuccessResponse, PaginatedResponse } from '@/types/api';

const BASE_PATH = '/finance/entries/';

export const journalEntriesService = {
  getEntries: async (page = 1) => {
    const response = await apiClient.get<ApiSuccessResponse<PaginatedResponse<JournalEntry>>>(
      BASE_PATH,
      {
        params: { page },
      },
    );
    return response.data.data;
  },

  createEntry: async (data: JournalEntryCreatePayload) => {
    const response = await apiClient.post<{ data: JournalEntry; message: string }>(BASE_PATH, data);
    return response.data;
  },

  getEntry: async (id: number) => {
    const response = await apiClient.get<{ data: JournalEntry; message: string }>(
      `${BASE_PATH}${id}/`,
    );
    return response.data.data;
  },

  deleteEntry: async (id: number) => {
    const response = await apiClient.delete<{ message: string }>(`${BASE_PATH}${id}/`);
    return response.data;
  },

  updateEntry: async (id: number, data: JournalEntryCreatePayload) => {
    const response = await apiClient.put<{ data: JournalEntry; message: string }>(
      `${BASE_PATH}${id}/`,
      data,
    );
    return response.data;
  },
};
