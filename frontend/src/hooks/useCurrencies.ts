import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@constants/query-keys';
import { currenciesService } from '@services/api';
import type { CreateCurrencyPayload, UpdateCurrencyPayload } from '@app-types/settings/currency';
import { getApiErrorMessage } from '@utils/session';

export function useCurrencies() {
  return useQuery({
    queryKey: queryKeys.settings.currencies.list(),
    queryFn: currenciesService.list,
  });
}

export function useCreateCurrency() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCurrencyPayload) => currenciesService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.settings.currencies.all });
      toast.success('Currency created');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to create currency')),
  });
}

export function useUpdateCurrency() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateCurrencyPayload }) =>
      currenciesService.update(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.settings.currencies.all });
      toast.success('Currency updated');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to update currency')),
  });
}

export function useActivateCurrency() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => currenciesService.activate(id),
    onSuccess: (currency) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.settings.currencies.all });
      toast.success(`${currency.short_name} is now the active currency`);
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to activate currency')),
  });
}

export function useDeleteCurrency() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => currenciesService.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.settings.currencies.all });
      toast.success('Currency deleted');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to delete currency')),
  });
}
