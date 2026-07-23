import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@constants/query-keys';
import {
  emailConfigService,
  notificationSettingsService,
  paymentMethodsService,
  printHeaderFooterService,
  smsConfigService,
} from '@services/api';
import type {
  EmailConfigPayload,
  NotificationSettingPayload,
  PaymentMethodPayload,
  PrintHeaderFooterPayload,
  SmsConfigPayload,
} from '@app-types/settings/system-config';
import { getApiErrorMessage } from '@utils/session';

export function useNotificationSettings(page = 1, search = '') {
  return useQuery({
    queryKey: queryKeys.settings.notificationSettings.list(page, search),
    queryFn: () => notificationSettingsService.list(page, search),
  });
}

export function useCreateNotificationSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: NotificationSettingPayload) =>
      notificationSettingsService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.settings.notificationSettings.all,
      });
      toast.success('Notification setting created');
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, 'Failed to create notification setting')),
  });
}

export function useUpdateNotificationSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: NotificationSettingPayload }) =>
      notificationSettingsService.update(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.settings.notificationSettings.all,
      });
      toast.success('Notification setting updated');
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, 'Failed to update notification setting')),
  });
}

export function useDeleteNotificationSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => notificationSettingsService.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.settings.notificationSettings.all,
      });
      toast.success('Notification setting deleted');
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, 'Failed to delete notification setting')),
  });
}

export function useSmsConfigs(page = 1) {
  return useQuery({
    queryKey: queryKeys.settings.smsConfig.list(page),
    queryFn: () => smsConfigService.list(page),
  });
}

export function useCreateSmsConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SmsConfigPayload) => smsConfigService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.settings.smsConfig.all });
      toast.success('SMS config created');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to create SMS config')),
  });
}

export function useUpdateSmsConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: SmsConfigPayload }) =>
      smsConfigService.update(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.settings.smsConfig.all });
      toast.success('SMS config updated');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to update SMS config')),
  });
}

export function useActivateSmsConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => smsConfigService.activate(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.settings.smsConfig.all });
      toast.success('SMS config activated');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to activate SMS config')),
  });
}

export function useDeleteSmsConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => smsConfigService.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.settings.smsConfig.all });
      toast.success('SMS config deleted');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to delete SMS config')),
  });
}

export function useEmailConfigs(page = 1) {
  return useQuery({
    queryKey: queryKeys.settings.emailConfig.list(page),
    queryFn: () => emailConfigService.list(page),
  });
}

export function useCreateEmailConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: EmailConfigPayload) => emailConfigService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.settings.emailConfig.all });
      toast.success('Email config created');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to create email config')),
  });
}

export function useUpdateEmailConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: EmailConfigPayload }) =>
      emailConfigService.update(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.settings.emailConfig.all });
      toast.success('Email config updated');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to update email config')),
  });
}

export function useActivateEmailConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => emailConfigService.activate(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.settings.emailConfig.all });
      toast.success('Email config activated');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to activate email config')),
  });
}

export function useDeleteEmailConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => emailConfigService.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.settings.emailConfig.all });
      toast.success('Email config deleted');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to delete email config')),
  });
}

export function usePaymentMethods(page = 1) {
  return useQuery({
    queryKey: queryKeys.settings.paymentMethods.list(page),
    queryFn: () => paymentMethodsService.list(page),
  });
}

export function useCreatePaymentMethod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PaymentMethodPayload) => paymentMethodsService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.settings.paymentMethods.all });
      toast.success('Payment method created');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to create payment method')),
  });
}

export function useUpdatePaymentMethod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: PaymentMethodPayload }) =>
      paymentMethodsService.update(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.settings.paymentMethods.all });
      toast.success('Payment method updated');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to update payment method')),
  });
}

export function useActivatePaymentMethod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => paymentMethodsService.activate(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.settings.paymentMethods.all });
      toast.success('Payment method activated');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to activate payment method')),
  });
}

export function useDeletePaymentMethod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => paymentMethodsService.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.settings.paymentMethods.all });
      toast.success('Payment method deleted');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to delete payment method')),
  });
}

export function usePrintHeaderFooter(page = 1) {
  return useQuery({
    queryKey: queryKeys.settings.printHeaderFooter.list(page),
    queryFn: () => printHeaderFooterService.list(page),
  });
}

export function useCreatePrintHeaderFooter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PrintHeaderFooterPayload) => printHeaderFooterService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.settings.printHeaderFooter.all,
      });
      toast.success('Print header/footer created');
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, 'Failed to create print header/footer')),
  });
}

export function useUpdatePrintHeaderFooter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<PrintHeaderFooterPayload> }) =>
      printHeaderFooterService.update(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.settings.printHeaderFooter.all,
      });
      toast.success('Print header/footer updated');
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, 'Failed to update print header/footer')),
  });
}

export function useDeletePrintHeaderFooter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => printHeaderFooterService.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.settings.printHeaderFooter.all,
      });
      toast.success('Print header/footer deleted');
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, 'Failed to delete print header/footer')),
  });
}
