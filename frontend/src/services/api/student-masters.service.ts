import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type {
  CreateStudentCategoryPayload,
  CreateStudentHousePayload,
  StudentCategory,
  StudentHouse,
  StudentImportResult,
  StudentImportRow,
  StudentImportTemplate,
  UpdateStudentCategoryPayload,
  UpdateStudentHousePayload,
} from '@app-types/students/masters';
import { type BackendPayload, extractList } from '@utils/api-response';

export const studentMastersService = {
  listCategories: async (query?: string): Promise<StudentCategory[]> => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.students.categories, {
      params: { page_size: 100, ...(query ? { q: query } : {}) },
    });
    const rawList = extractList<any>(data);
    return rawList.map((item) => ({
      id: item.id,
      name: item.category || '',
      is_active: item.is_active || 'yes',
      created_at: item.created_at || null,
    }));
  },

  createCategory: async (payload: CreateStudentCategoryPayload): Promise<StudentCategory> => {
    const { data } = await apiClient.post<ApiSuccessResponse<any>>(
      API_ENDPOINTS.students.categories,
      {
        category: payload.name,
        is_active: payload.is_active,
      },
    );
    const item = data.data;
    return {
      id: item.id,
      name: item.category || '',
      is_active: item.is_active || 'yes',
      created_at: item.created_at || null,
    };
  },

  updateCategory: async (
    id: number,
    payload: UpdateStudentCategoryPayload,
  ): Promise<StudentCategory> => {
    const { data } = await apiClient.put<ApiSuccessResponse<any>>(
      API_ENDPOINTS.students.categoryDetail(id),
      {
        category: payload.name,
        is_active: payload.is_active,
      },
    );
    const item = data.data;
    return {
      id: id,
      name: item?.category || payload.name || '',
      is_active: item?.is_active || payload.is_active || 'yes',
      created_at: item?.created_at || null,
    };
  },

  deleteCategory: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.students.categoryDetail(id));
  },

  listHouses: async (query?: string): Promise<StudentHouse[]> => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.students.houses, {
      params: { page_size: 100, ...(query ? { q: query } : {}) },
    });
    return extractList<StudentHouse>(data);
  },

  createHouse: async (payload: CreateStudentHousePayload): Promise<StudentHouse> => {
    const { data } = await apiClient.post<ApiSuccessResponse<StudentHouse>>(
      API_ENDPOINTS.students.houses,
      payload,
    );
    return data.data;
  },

  updateHouse: async (id: number, payload: UpdateStudentHousePayload): Promise<StudentHouse> => {
    const { data } = await apiClient.patch<ApiSuccessResponse<StudentHouse>>(
      API_ENDPOINTS.students.houseDetail(id),
      payload,
    );
    return data.data;
  },

  deleteHouse: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.students.houseDetail(id));
  },

  importTemplate: async (): Promise<StudentImportTemplate> => {
    const { data } = await apiClient.get<ApiSuccessResponse<StudentImportTemplate>>(
      API_ENDPOINTS.students.importTemplate,
    );
    return data.data;
  },

  importRows: async (rows: StudentImportRow[]): Promise<StudentImportResult> => {
    const { data } = await apiClient.post<ApiSuccessResponse<StudentImportResult>>(
      API_ENDPOINTS.students.import,
      { rows },
    );
    return data.data;
  },
};
