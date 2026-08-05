import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import { type BackendPayload, extractCount, extractList } from '@utils/api-response';

export interface UserLogRow {
  id: number;
  user: string;
  role: string;
  class_section_id: number | null;
  ipaddress: string;
  user_agent: string;
  login_datetime: string | null;
}

export interface AuditTrailRow {
  id: number;
  message: string;
  record_id: number | null;
  user_id: number | null;
  user_name: string;
  action: string;
  ip_address: string;
  platform: string;
  agent: string;
  time: string | null;
}

export interface ReportListParams {
  role?: string;
  action?: string;
  q?: string;
  from_date?: string;
  to_date?: string;
  page?: number;
  page_size?: number;
}

function buildQuery(params: ReportListParams): string {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      sp.set(key, String(value));
    }
  });
  const qs = sp.toString();
  return qs ? `?${qs}` : '';
}

export interface PaginatedReport<T> {
  results: T[];
  count: number;
}

export const systemReportsService = {
  listUserLogs: async (params: ReportListParams = {}): Promise<PaginatedReport<UserLogRow>> => {
    const { data } = await apiClient.get<BackendPayload>(
      `${API_ENDPOINTS.reportsApi.userLogs}${buildQuery({ ...params, page_size: params.page_size ?? 100 })}`,
    );
    const results = extractList<UserLogRow>(data);
    return { results, count: extractCount(data, results.length) };
  },

  listAuditTrail: async (
    params: ReportListParams = {},
  ): Promise<PaginatedReport<AuditTrailRow>> => {
    const { data } = await apiClient.get<BackendPayload>(
      `${API_ENDPOINTS.reportsApi.auditTrail}${buildQuery({ ...params, page_size: params.page_size ?? 100 })}`,
    );
    const results = extractList<AuditTrailRow>(data);
    return { results, count: extractCount(data, results.length) };
  },
};
