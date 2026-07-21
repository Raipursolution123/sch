import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type { MarksheetTemplate, AdmitCardTemplate } from '@hooks/useExamTemplates';

export const examTemplatesService = {
  listMarksheets: async (): Promise<MarksheetTemplate[]> => {
    const { data } = await apiClient.get<ApiSuccessResponse<{ results: MarksheetTemplate[] }>>(
      API_ENDPOINTS.examinations.marksheetTemplates,
    );
    return data.data.results;
  },

  deleteMarksheet: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.examinations.marksheetTemplateDetail(id));
  },

  listAdmitCards: async (): Promise<AdmitCardTemplate[]> => {
    const { data } = await apiClient.get<ApiSuccessResponse<{ results: AdmitCardTemplate[] }>>(
      API_ENDPOINTS.examinations.admitCardTemplates,
    );
    return data.data.results;
  },

  deleteAdmitCard: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.examinations.admitCardTemplateDetail(id));
  },
};
