import { apiClient } from './client';
import type { PaymentGateway, PaymentGatewayUpdatePayload } from '@/types/settings/payment-methods';
import type { ApiSuccessResponse } from '@/types/api';

const BASE_PATH = '/fees/payment-gateways/';

export const paymentMethodsService = {
  getGateways: async () => {
    const response = await apiClient.get<ApiSuccessResponse<PaymentGateway[]>>(BASE_PATH);
    return response.data.data;
  },

  updateGateway: async (id: number, data: PaymentGatewayUpdatePayload) => {
    const response = await apiClient.put<{ data: PaymentGateway; message: string }>(`${BASE_PATH}${id}/`, data);
    return response.data;
  },
};
