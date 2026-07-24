import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type {
  CertificatePreview,
  CertificateTemplate,
  CreateCertificateTemplatePayload,
  UpdateCertificateTemplatePayload,
} from '@app-types/certificates';
import { type BackendPayload, extractList } from '@utils/api-response';

export const certificatesService = {
  list: async (query?: string): Promise<CertificateTemplate[]> => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.documents.certificates, {
      params: { page_size: 100, created_for: 2, ...(query ? { q: query } : {}) },
    });
    return extractList<CertificateTemplate>(data);
  },

  create: async (payload: CreateCertificateTemplatePayload): Promise<CertificateTemplate> => {
    const { data } = await apiClient.post<ApiSuccessResponse<CertificateTemplate>>(
      API_ENDPOINTS.documents.certificates,
      payload,
    );
    return data.data;
  },

  update: async (
    id: number,
    payload: UpdateCertificateTemplatePayload,
  ): Promise<CertificateTemplate> => {
    const { data } = await apiClient.patch<ApiSuccessResponse<CertificateTemplate>>(
      API_ENDPOINTS.documents.certificateDetail(id),
      payload,
    );
    return data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.documents.certificateDetail(id));
  },

  generate: async (certificateId: number, studentId: number): Promise<CertificatePreview> => {
    const { data } = await apiClient.post<ApiSuccessResponse<CertificatePreview>>(
      API_ENDPOINTS.documents.certificateGenerate,
      { certificate_id: certificateId, student_id: studentId },
    );
    return data.data;
  },
};
