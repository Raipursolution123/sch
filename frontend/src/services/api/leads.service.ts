import { apiClient } from './client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type {
  Lead,
  LeadCampaign,
  LeadCampaignCreatePayload,
  LeadCampaignUpdatePayload,
  LeadCreatePayload,
  LeadFollowup,
  LeadFollowupCreatePayload,
  LeadFollowupStatus,
  LeadFollowupStatusPayload,
  LeadFollowupUpdatePayload,
  LeadPromoter,
  LeadPromoterCreatePayload,
  LeadReportSummary,
  LeadSource,
  LeadSourceRenamePayload,
  LeadUpdatePayload,
} from '@app-types/leads';
import { type BackendPayload, extractList } from '@utils/api-response';

const listParams = (query?: string, extra?: Record<string, string | number>) => ({
  page_size: 100,
  ...(query ? { q: query } : {}),
  ...extra,
});

export const leadsService = {
  list: async (query?: string, campaignId?: number) => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.leads.list, {
      params: listParams(query, campaignId ? { c_id: campaignId } : undefined),
    });
    return extractList<Lead>(data);
  },

  create: async (payload: LeadCreatePayload) => {
    const { data } = await apiClient.post<ApiSuccessResponse<Lead>>(
      API_ENDPOINTS.leads.list,
      payload,
    );
    return data.data;
  },

  update: async (id: number, payload: LeadUpdatePayload) => {
    const { data } = await apiClient.patch<ApiSuccessResponse<Lead>>(
      API_ENDPOINTS.leads.detail(id),
      payload,
    );
    return data.data;
  },

  delete: async (id: number) => {
    await apiClient.delete(API_ENDPOINTS.leads.detail(id));
  },

  listCampaigns: async (query?: string) => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.leads.campaigns, {
      params: listParams(query),
    });
    return extractList<LeadCampaign>(data);
  },

  createCampaign: async (payload: LeadCampaignCreatePayload) => {
    const { data } = await apiClient.post<ApiSuccessResponse<LeadCampaign>>(
      API_ENDPOINTS.leads.campaigns,
      payload,
    );
    return data.data;
  },

  updateCampaign: async (id: number, payload: LeadCampaignUpdatePayload) => {
    const { data } = await apiClient.patch<ApiSuccessResponse<LeadCampaign>>(
      API_ENDPOINTS.leads.campaignDetail(id),
      payload,
    );
    return data.data;
  },

  deleteCampaign: async (id: number) => {
    await apiClient.delete(API_ENDPOINTS.leads.campaignDetail(id));
  },

  listFollowupStatuses: async (query?: string) => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.leads.followupStatuses, {
      params: listParams(query),
    });
    return extractList<LeadFollowupStatus>(data);
  },

  createFollowupStatus: async (payload: LeadFollowupStatusPayload) => {
    const { data } = await apiClient.post<ApiSuccessResponse<LeadFollowupStatus>>(
      API_ENDPOINTS.leads.followupStatuses,
      payload,
    );
    return data.data;
  },

  updateFollowupStatus: async (id: number, payload: LeadFollowupStatusPayload) => {
    const { data } = await apiClient.patch<ApiSuccessResponse<LeadFollowupStatus>>(
      API_ENDPOINTS.leads.followupStatusDetail(id),
      payload,
    );
    return data.data;
  },

  deleteFollowupStatus: async (id: number) => {
    await apiClient.delete(API_ENDPOINTS.leads.followupStatusDetail(id));
  },

  listFollowups: async (query?: string, leadId?: number) => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.leads.followups, {
      params: listParams(query, leadId ? { l_id: leadId } : undefined),
    });
    return extractList<LeadFollowup>(data);
  },

  createFollowup: async (payload: LeadFollowupCreatePayload) => {
    const { data } = await apiClient.post<ApiSuccessResponse<LeadFollowup>>(
      API_ENDPOINTS.leads.followups,
      payload,
    );
    return data.data;
  },

  updateFollowup: async (id: number, payload: LeadFollowupUpdatePayload) => {
    const { data } = await apiClient.patch<ApiSuccessResponse<LeadFollowup>>(
      API_ENDPOINTS.leads.followupDetail(id),
      payload,
    );
    return data.data;
  },

  deleteFollowup: async (id: number) => {
    await apiClient.delete(API_ENDPOINTS.leads.followupDetail(id));
  },

  listSources: async () => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.leads.sources);
    return extractList<LeadSource>(data);
  },

  renameSource: async (payload: LeadSourceRenamePayload) => {
    const { data } = await apiClient.post<ApiSuccessResponse<{ updated: number; source: string }>>(
      API_ENDPOINTS.leads.sources,
      payload,
    );
    return data.data;
  },

  listPromoters: async () => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.leads.promoters);
    return extractList<LeadPromoter>(data);
  },

  createPromoter: async (payload: LeadPromoterCreatePayload) => {
    const { data } = await apiClient.post<ApiSuccessResponse<LeadPromoter>>(
      API_ENDPOINTS.leads.promoters,
      payload,
    );
    return data.data;
  },

  deletePromoter: async (id: number) => {
    await apiClient.delete(API_ENDPOINTS.leads.promoterDetail(id));
  },

  getReport: async () => {
    const { data } = await apiClient.get<ApiSuccessResponse<LeadReportSummary>>(
      API_ENDPOINTS.leads.report,
    );
    return data.data;
  },
};
