import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { PaymentGateway } from '@app-types/fees/payment-gateway';
import { type BackendPayload, extractList } from '@utils/api-response';

export const paymentGatewaysService = {
  list: async (): Promise<PaymentGateway[]> => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.fees.paymentGateways);
    return extractList<PaymentGateway>(data);
  },
};
