import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@constants/query-keys';
import { paymentGatewaysService } from '@services/api';

export function usePaymentGateways() {
  return useQuery({
    queryKey: queryKeys.fees.paymentGateways.list(),
    queryFn: paymentGatewaysService.list,
  });
}
