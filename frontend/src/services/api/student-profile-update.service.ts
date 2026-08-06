import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';

export interface StudentProfileUpdateField {
  id: number;
  name: string;
  status: number;
}

export const studentProfileUpdateService = {
  getFields: async (): Promise<StudentProfileUpdateField[]> => {
    const { data } = await apiClient.get<ApiSuccessResponse<StudentProfileUpdateField[]>>(
      API_ENDPOINTS.settings.studentProfileUpdateFields,
    );
    return data.data;
  },

  updateField: async (id: number, status: number): Promise<void> => {
    await apiClient.patch(API_ENDPOINTS.settings.studentProfileUpdateFields, {
      id,
      status,
    });
  },

  updateFieldsBatch: async (fields: { id: number; status: number }[]): Promise<void> => {
    await apiClient.patch(API_ENDPOINTS.settings.studentProfileUpdateFields, {
      fields,
    });
  },
};
