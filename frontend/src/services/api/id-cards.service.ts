import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type {
  CreateStaffIdCardPayload,
  CreateStudentIdCardPayload,
  IdCardPreview,
  StaffIdCardTemplate,
  StudentIdCardTemplate,
  UpdateStaffIdCardPayload,
  UpdateStudentIdCardPayload,
} from '@app-types/id-cards';
import { type BackendPayload, extractList } from '@utils/api-response';

export const idCardsService = {
  listStudent: async (query?: string): Promise<StudentIdCardTemplate[]> => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.documents.studentIdCards, {
      params: { page_size: 100, ...(query ? { q: query } : {}) },
    });
    return extractList<StudentIdCardTemplate>(data);
  },

  createStudent: async (payload: CreateStudentIdCardPayload): Promise<StudentIdCardTemplate> => {
    const { data } = await apiClient.post<ApiSuccessResponse<StudentIdCardTemplate>>(
      API_ENDPOINTS.documents.studentIdCards,
      payload,
    );
    return data.data;
  },

  updateStudent: async (
    id: number,
    payload: UpdateStudentIdCardPayload,
  ): Promise<StudentIdCardTemplate> => {
    const { data } = await apiClient.patch<ApiSuccessResponse<StudentIdCardTemplate>>(
      API_ENDPOINTS.documents.studentIdCardDetail(id),
      payload,
    );
    return data.data;
  },

  deleteStudent: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.documents.studentIdCardDetail(id));
  },

  generateStudent: async (templateId: number, personId: number): Promise<IdCardPreview> => {
    const { data } = await apiClient.post<ApiSuccessResponse<IdCardPreview>>(
      API_ENDPOINTS.documents.studentIdCardGenerate,
      { template_id: templateId, person_id: personId },
    );
    return data.data;
  },

  listStaff: async (query?: string): Promise<StaffIdCardTemplate[]> => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.documents.staffIdCards, {
      params: { page_size: 100, ...(query ? { q: query } : {}) },
    });
    return extractList<StaffIdCardTemplate>(data);
  },

  createStaff: async (payload: CreateStaffIdCardPayload): Promise<StaffIdCardTemplate> => {
    const { data } = await apiClient.post<ApiSuccessResponse<StaffIdCardTemplate>>(
      API_ENDPOINTS.documents.staffIdCards,
      payload,
    );
    return data.data;
  },

  updateStaff: async (
    id: number,
    payload: UpdateStaffIdCardPayload,
  ): Promise<StaffIdCardTemplate> => {
    const { data } = await apiClient.patch<ApiSuccessResponse<StaffIdCardTemplate>>(
      API_ENDPOINTS.documents.staffIdCardDetail(id),
      payload,
    );
    return data.data;
  },

  deleteStaff: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.documents.staffIdCardDetail(id));
  },

  generateStaff: async (templateId: number, personId: number): Promise<IdCardPreview> => {
    const { data } = await apiClient.post<ApiSuccessResponse<IdCardPreview>>(
      API_ENDPOINTS.documents.staffIdCardGenerate,
      { template_id: templateId, person_id: personId },
    );
    return data.data;
  },
};
