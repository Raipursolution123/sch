import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type {
  CreateFeeDiscountPayload,
  FeeDiscount,
  UpdateFeeDiscountPayload,
} from '@app-types/fees/fee-discount';
import { type BackendPayload, extractList } from '@utils/api-response';

export const feeDiscountsService = {
  list: async (): Promise<FeeDiscount[]> => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.fees.discounts);
    return extractList<FeeDiscount>(data);
  },

  create: async (payload: CreateFeeDiscountPayload): Promise<FeeDiscount> => {
    const { data } = await apiClient.post<ApiSuccessResponse<FeeDiscount>>(
      API_ENDPOINTS.fees.discounts,
      payload,
    );
    return data.data;
  },

  update: async (id: number, payload: UpdateFeeDiscountPayload): Promise<FeeDiscount> => {
    const { data } = await apiClient.patch<ApiSuccessResponse<FeeDiscount>>(
      API_ENDPOINTS.fees.discountDetail(id),
      payload,
    );
    return data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.fees.discountDetail(id));
  },
};
