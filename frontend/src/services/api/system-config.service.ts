import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type {
  EmailConfig,
  EmailConfigPayload,
  NotificationSetting,
  NotificationSettingPayload,
  PaymentMethod,
  PaymentMethodPayload,
  PrintHeaderFooter,
  PrintHeaderFooterPayload,
  SmsConfig,
  SmsConfigPayload,
} from '@app-types/settings/system-config';
import { type BackendPayload, extractCount, extractList } from '@utils/api-response';

async function listResource<T>(
  url: string,
  page: number,
  search = '',
): Promise<{ results: T[]; count: number }> {
  const params = new URLSearchParams({ page: String(page) });
  if (search) params.set('search', search);
  const { data } = await apiClient.get<BackendPayload>(`${url}?${params.toString()}`);
  const raw = extractList<T>(data);
  return { results: raw, count: extractCount(data, raw.length) };
}

export const notificationSettingsService = {
  list: (page = 1, search = '') =>
    listResource<NotificationSetting>(API_ENDPOINTS.settings.notificationSettings, page, search),
  create: async (payload: NotificationSettingPayload) => {
    const { data } = await apiClient.post<ApiSuccessResponse<NotificationSetting>>(
      API_ENDPOINTS.settings.notificationSettings,
      payload,
    );
    return data.data;
  },
  update: async (id: number, payload: NotificationSettingPayload) => {
    const { data } = await apiClient.patch<ApiSuccessResponse<NotificationSetting>>(
      API_ENDPOINTS.settings.notificationSettingDetail(id),
      payload,
    );
    return data.data;
  },
  delete: async (id: number) => {
    await apiClient.delete(API_ENDPOINTS.settings.notificationSettingDetail(id));
  },
};

export const smsConfigService = {
  list: (page = 1) => listResource<SmsConfig>(API_ENDPOINTS.settings.smsConfig, page),
  create: async (payload: SmsConfigPayload) => {
    const { data } = await apiClient.post<ApiSuccessResponse<SmsConfig>>(
      API_ENDPOINTS.settings.smsConfig,
      payload,
    );
    return data.data;
  },
  update: async (id: number, payload: SmsConfigPayload) => {
    const { data } = await apiClient.patch<ApiSuccessResponse<SmsConfig>>(
      API_ENDPOINTS.settings.smsConfigDetail(id),
      payload,
    );
    return data.data;
  },
  activate: async (id: number) => {
    const { data } = await apiClient.post<ApiSuccessResponse<SmsConfig>>(
      API_ENDPOINTS.settings.smsConfigActivate(id),
    );
    return data.data;
  },
  delete: async (id: number) => {
    await apiClient.delete(API_ENDPOINTS.settings.smsConfigDetail(id));
  },
};

export const emailConfigService = {
  list: (page = 1) => listResource<EmailConfig>(API_ENDPOINTS.settings.emailConfig, page),
  create: async (payload: EmailConfigPayload) => {
    const { data } = await apiClient.post<ApiSuccessResponse<EmailConfig>>(
      API_ENDPOINTS.settings.emailConfig,
      payload,
    );
    return data.data;
  },
  update: async (id: number, payload: EmailConfigPayload) => {
    const { data } = await apiClient.patch<ApiSuccessResponse<EmailConfig>>(
      API_ENDPOINTS.settings.emailConfigDetail(id),
      payload,
    );
    return data.data;
  },
  activate: async (id: number) => {
    const { data } = await apiClient.post<ApiSuccessResponse<EmailConfig>>(
      API_ENDPOINTS.settings.emailConfigActivate(id),
    );
    return data.data;
  },
  delete: async (id: number) => {
    await apiClient.delete(API_ENDPOINTS.settings.emailConfigDetail(id));
  },
};

export const paymentMethodsService = {
  list: (page = 1) => listResource<PaymentMethod>(API_ENDPOINTS.settings.paymentMethods, page),
  create: async (payload: PaymentMethodPayload) => {
    const { data } = await apiClient.post<ApiSuccessResponse<PaymentMethod>>(
      API_ENDPOINTS.settings.paymentMethods,
      payload,
    );
    return data.data;
  },
  update: async (id: number, payload: PaymentMethodPayload) => {
    const { data } = await apiClient.patch<ApiSuccessResponse<PaymentMethod>>(
      API_ENDPOINTS.settings.paymentMethodDetail(id),
      payload,
    );
    return data.data;
  },
  activate: async (id: number) => {
    const { data } = await apiClient.post<ApiSuccessResponse<PaymentMethod>>(
      API_ENDPOINTS.settings.paymentMethodActivate(id),
    );
    return data.data;
  },
  delete: async (id: number) => {
    await apiClient.delete(API_ENDPOINTS.settings.paymentMethodDetail(id));
  },
};

export const printHeaderFooterService = {
  list: (page = 1) =>
    listResource<PrintHeaderFooter>(API_ENDPOINTS.settings.printHeaderFooter, page),
  create: async (payload: PrintHeaderFooterPayload) => {
    const { data } = await apiClient.post<ApiSuccessResponse<PrintHeaderFooter>>(
      API_ENDPOINTS.settings.printHeaderFooter,
      payload,
    );
    return data.data;
  },
  update: async (id: number, payload: Partial<PrintHeaderFooterPayload>) => {
    const { data } = await apiClient.patch<ApiSuccessResponse<PrintHeaderFooter>>(
      API_ENDPOINTS.settings.printHeaderFooterDetail(id),
      payload,
    );
    return data.data;
  },
  delete: async (id: number) => {
    await apiClient.delete(API_ENDPOINTS.settings.printHeaderFooterDetail(id));
  },
};
