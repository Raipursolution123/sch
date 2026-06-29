import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type { GeneralSettings, GeneralSettingsUpdatePayload } from '@app-types/settings/general';

// TODO: Remove mock when GET /api/v1/settings/general/ is available
let mockSettings: GeneralSettings = {
  id: 1,
  name: 'Demo Public School',
  email: 'office@demo.com',
  phone: '+91 98765 43210',
  address: '123 Education Lane, Raipur, Chhattisgarh 492001',
  dise_code: '22100100101',
  timezone: 'Asia/Kolkata',
  date_format: 'd-m-Y',
  time_format: '12-hour',
  start_month: 'April',
  start_week: 'Monday',
  day_off: 'Sunday',
  is_rtl: 'disabled',
  attendence_type: 0,
  low_attendance_limit: 75,
  class_teacher: 'enabled',
  currency: 'INR',
  currency_symbol: '₹',
  currency_place: 'before_number',
  collect_back_date_fees: 1,
  fee_due_days: 7,
  is_duplicate_fees_invoice: '0',
  maintenance_mode: 0,
  lock_grace_period: 0,
  student_panel_login: 1,
  parent_panel_login: 1,
};

const USE_MOCK = true; // TODO: Set to false when backend general settings API is deployed

function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export const generalSettingsService = {
  get: async (): Promise<GeneralSettings> => {
    if (USE_MOCK) {
      return delay({ ...mockSettings });
    }
    // TODO: Wire when backend exposes GET /api/v1/settings/general/
    const { data } = await apiClient.get<ApiSuccessResponse<GeneralSettings>>(
      API_ENDPOINTS.settings.general,
    );
    return data.data;
  },

  update: async (payload: GeneralSettingsUpdatePayload): Promise<GeneralSettings> => {
    if (USE_MOCK) {
      mockSettings = { ...mockSettings, ...payload };
      return delay({ ...mockSettings });
    }
    // TODO: Wire when backend exposes PATCH /api/v1/settings/general/
    const { data } = await apiClient.patch<ApiSuccessResponse<GeneralSettings>>(
      API_ENDPOINTS.settings.general,
      payload,
    );
    return data.data;
  },
};
