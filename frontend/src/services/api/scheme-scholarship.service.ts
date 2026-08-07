import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import { type BackendPayload, extractEntity, extractList } from '@utils/api-response';

export interface FeeScheme {
  id: number;
  ss_name: string;
  ss_type: string;
  ss_applicable_on: string;
  ss_status: number;
  is_active: boolean;
  value_count: number;
}

export interface SchemeValue {
  id?: number;
  fee_concession_type: string;
  fee_concession: number;
  applicable_class?: number | null;
  is_active?: boolean;
}

export interface SchemeConfig extends FeeScheme {
  values: SchemeValue[];
  feetype_ids: number[];
  feetypes: Array<{ id: number; name: string }>;
}

export interface SchemeApplication {
  id: number;
  ss_id: number;
  scheme_name: string | null;
  student_id: number;
  student_name: string;
  admission_no: string | null;
  class_name: string;
  section_name: string;
  applied_on: string | null;
  applied_status: number;
  status_label: string;
}

export const schemeScholarshipService = {
  listSchemes: async (): Promise<FeeScheme[]> => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.fees.schemes);
    return extractList<FeeScheme>(data);
  },

  createScheme: async (payload: {
    ss_name: string;
    ss_type?: string;
    ss_applicable_on?: string;
  }): Promise<FeeScheme> => {
    const { data } = await apiClient.post<ApiSuccessResponse<FeeScheme>>(
      API_ENDPOINTS.fees.schemes,
      payload,
    );
    return data.data;
  },

  updateScheme: async (id: number, payload: Partial<FeeScheme>): Promise<FeeScheme> => {
    const { data } = await apiClient.put<ApiSuccessResponse<FeeScheme>>(
      API_ENDPOINTS.fees.schemeDetail(id),
      payload,
    );
    return data.data;
  },

  deleteScheme: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.fees.schemeDetail(id));
  },

  getSchemeConfig: async (id: number): Promise<SchemeConfig> => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.fees.schemeConfig(id));
    return extractEntity<SchemeConfig>(data);
  },

  saveSchemeConfig: async (
    id: number,
    payload: { values: SchemeValue[]; feetype_ids: number[] },
  ): Promise<SchemeConfig> => {
    const { data } = await apiClient.put<ApiSuccessResponse<SchemeConfig>>(
      API_ENDPOINTS.fees.schemeConfig(id),
      payload,
    );
    return data.data;
  },

  listApplications: async (filters?: {
    ss_id?: number;
    applied_status?: number;
    class_id?: number;
    section_id?: number;
  }): Promise<SchemeApplication[]> => {
    const params = new URLSearchParams();
    if (filters?.ss_id) params.set('ss_id', String(filters.ss_id));
    if (filters?.applied_status !== undefined)
      params.set('applied_status', String(filters.applied_status));
    if (filters?.class_id) params.set('class_id', String(filters.class_id));
    if (filters?.section_id) params.set('section_id', String(filters.section_id));
    const qs = params.toString() ? `?${params.toString()}` : '';
    const { data } = await apiClient.get<BackendPayload>(
      `${API_ENDPOINTS.fees.schemeApplications}${qs}`,
    );
    return extractList<SchemeApplication>(data);
  },

  apply: async (payload: { ss_id: number; student_id: number }): Promise<SchemeApplication> => {
    const { data } = await apiClient.post<ApiSuccessResponse<SchemeApplication>>(
      API_ENDPOINTS.fees.schemeApplications,
      payload,
    );
    return data.data;
  },

  approve: async (id: number): Promise<SchemeApplication> => {
    const { data } = await apiClient.post<ApiSuccessResponse<SchemeApplication>>(
      API_ENDPOINTS.fees.schemeApplicationApprove(id),
    );
    return data.data;
  },

  reject: async (id: number): Promise<SchemeApplication> => {
    const { data } = await apiClient.post<ApiSuccessResponse<SchemeApplication>>(
      API_ENDPOINTS.fees.schemeApplicationReject(id),
    );
    return data.data;
  },
};
