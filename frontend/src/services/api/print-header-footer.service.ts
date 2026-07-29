import { apiClient } from './client';
import type {
  PrintHeaderFooter,
  PrintHeaderFooterCreatePayload,
  PrintHeaderFooterUpdatePayload,
} from '@/types/settings/print-header-footer';
import type { ApiSuccessResponse } from '@/types/api';

const BASE_PATH = '/settings/print-header-footer/';

export const printHeaderFooterService = {
  getTemplates: async () => {
    const response = await apiClient.get<ApiSuccessResponse<PrintHeaderFooter[]>>(BASE_PATH);
    return response.data.data;
  },

  createTemplate: async (data: PrintHeaderFooterCreatePayload) => {
    const response = await apiClient.post<{ data: PrintHeaderFooter; message: string }>(
      BASE_PATH,
      data,
    );
    return response.data;
  },

  updateTemplate: async (id: number, data: PrintHeaderFooterUpdatePayload) => {
    const response = await apiClient.put<{ data: PrintHeaderFooter; message: string }>(
      `${BASE_PATH}${id}/`,
      data,
    );
    return response.data;
  },

  deleteTemplate: async (id: number) => {
    const response = await apiClient.delete<{ message: string }>(`${BASE_PATH}${id}/`);
    return response.data;
  },
};
