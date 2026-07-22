import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type {
  AdmitCardTemplate,
  CreateAdmitCardTemplatePayload,
  CreateMarksheetTemplatePayload,
  MarksheetTemplate,
  UpdateAdmitCardTemplatePayload,
  UpdateMarksheetTemplatePayload,
} from '@app-types/examinations/exam-templates';
import { type BackendPayload, extractList } from '@utils/api-response';

export const examTemplatesService = {
  listAdmitCards: async (): Promise<AdmitCardTemplate[]> => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.examinations.admitCards, {
      params: { page_size: 100 },
    });
    return extractList<AdmitCardTemplate>(data);
  },
  createAdmitCard: async (payload: CreateAdmitCardTemplatePayload): Promise<AdmitCardTemplate> => {
    const { data } = await apiClient.post<ApiSuccessResponse<AdmitCardTemplate>>(
      API_ENDPOINTS.examinations.admitCards,
      payload,
    );
    return data.data;
  },
  updateAdmitCard: async (
    id: number,
    payload: UpdateAdmitCardTemplatePayload,
  ): Promise<AdmitCardTemplate> => {
    const { data } = await apiClient.patch<ApiSuccessResponse<AdmitCardTemplate>>(
      API_ENDPOINTS.examinations.admitCardDetail(id),
      payload,
    );
    return data.data;
  },
  deleteAdmitCard: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.examinations.admitCardDetail(id));
  },

  listMarksheets: async (): Promise<MarksheetTemplate[]> => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.examinations.marksheets, {
      params: { page_size: 100 },
    });
    return extractList<MarksheetTemplate>(data);
  },
  createMarksheet: async (payload: CreateMarksheetTemplatePayload): Promise<MarksheetTemplate> => {
    const { data } = await apiClient.post<ApiSuccessResponse<MarksheetTemplate>>(
      API_ENDPOINTS.examinations.marksheets,
      payload,
    );
    return data.data;
  },
  updateMarksheet: async (
    id: number,
    payload: UpdateMarksheetTemplatePayload,
  ): Promise<MarksheetTemplate> => {
    const { data } = await apiClient.patch<ApiSuccessResponse<MarksheetTemplate>>(
      API_ENDPOINTS.examinations.marksheetDetail(id),
      payload,
    );
    return data.data;
  },
  deleteMarksheet: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.examinations.marksheetDetail(id));
  },
};
