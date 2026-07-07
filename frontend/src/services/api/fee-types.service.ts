import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type {
  CreateFeeTypePayload,
  FeeCategory,
  FeeType,
  UpdateFeeTypePayload,
} from '@app-types/fees/fee-type';
import { type BackendPayload, extractList } from '@utils/api-response';

export interface CreateFeeCategoryPayload {
  name: string;
  is_active: 'yes' | 'no';
}

export type UpdateFeeCategoryPayload = Partial<CreateFeeCategoryPayload>;

export const feeTypesService = {
  // ── Fee Categories ────────────────────────────────────────────
  listCategories: async (): Promise<FeeCategory[]> => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.fees.categories);
    return extractList<FeeCategory>(data);
  },

  createCategory: async (payload: CreateFeeCategoryPayload): Promise<FeeCategory> => {
    const { data } = await apiClient.post<ApiSuccessResponse<FeeCategory>>(
      API_ENDPOINTS.fees.categories,
      payload,
    );
    return data.data;
  },

  updateCategory: async (id: number, payload: UpdateFeeCategoryPayload): Promise<FeeCategory> => {
    const { data } = await apiClient.patch<ApiSuccessResponse<FeeCategory>>(
      API_ENDPOINTS.fees.categoryDetail(id),
      payload,
    );
    return data.data;
  },

  deleteCategory: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.fees.categoryDetail(id));
  },

  // ── Fee Types ─────────────────────────────────────────────────
  list: async (): Promise<FeeType[]> => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.fees.feeTypes);
    return extractList<FeeType>(data);
  },

  create: async (payload: CreateFeeTypePayload): Promise<FeeType> => {
    const { data } = await apiClient.post<ApiSuccessResponse<FeeType>>(
      API_ENDPOINTS.fees.feeTypes,
      payload,
    );
    return data.data;
  },

  update: async (id: number, payload: UpdateFeeTypePayload): Promise<FeeType> => {
    const { data } = await apiClient.patch<ApiSuccessResponse<FeeType>>(
      API_ENDPOINTS.fees.feeTypeDetail(id),
      payload,
    );
    return data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.fees.feeTypeDetail(id));
  },
};
