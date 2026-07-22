import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentMethodsService } from '@/services/api';
import type { PaymentGatewayUpdatePayload } from '@/types/settings/payment-methods';
import { toast } from 'sonner';

export const usePaymentGateways = () => {
  return useQuery({
    queryKey: ['payment-gateways'],
    queryFn: () => paymentMethodsService.getGateways(),
  });
};

export const useUpdatePaymentGateway = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PaymentGatewayUpdatePayload }) =>
      paymentMethodsService.updateGateway(id, data),
    onSuccess: (response) => {
      toast.success(response.message || 'Payment gateway updated successfully');
      queryClient.invalidateQueries({ queryKey: ['payment-gateways'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update payment gateway');
    },
  });
};
