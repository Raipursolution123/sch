import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@constants/query-keys';
import { leadsService } from '@services/api/leads.service';
import type {
  LeadCampaignCreatePayload,
  LeadCampaignUpdatePayload,
  LeadCreatePayload,
  LeadFollowupCreatePayload,
  LeadFollowupStatusPayload,
  LeadFollowupUpdatePayload,
  LeadPromoterCreatePayload,
  LeadSourceRenamePayload,
  LeadUpdatePayload,
} from '@app-types/leads';
import { getApiErrorMessage } from '@utils/session';

function invalidateLeads(qc: ReturnType<typeof useQueryClient>) {
  void qc.invalidateQueries({ queryKey: queryKeys.leads.all });
}

export function useLeads(query = '', campaignId?: number) {
  return useQuery({
    queryKey: queryKeys.leads.list(query, campaignId ? String(campaignId) : ''),
    queryFn: () => leadsService.list(query || undefined, campaignId),
  });
}

export function useCreateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: LeadCreatePayload) => leadsService.create(payload),
    onSuccess: () => {
      invalidateLeads(qc);
      toast.success('Lead created');
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Failed to create lead')),
  });
}

export function useUpdateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: LeadUpdatePayload }) =>
      leadsService.update(id, payload),
    onSuccess: () => {
      invalidateLeads(qc);
      toast.success('Lead updated');
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Failed to update lead')),
  });
}

export function useDeleteLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => leadsService.delete(id),
    onSuccess: () => {
      invalidateLeads(qc);
      toast.success('Lead deleted');
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Failed to delete lead')),
  });
}

export function useLeadCampaigns(query = '') {
  return useQuery({
    queryKey: queryKeys.leads.campaigns.list(query),
    queryFn: () => leadsService.listCampaigns(query || undefined),
  });
}

export function useCreateLeadCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: LeadCampaignCreatePayload) => leadsService.createCampaign(payload),
    onSuccess: () => {
      invalidateLeads(qc);
      toast.success('Campaign created');
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Failed to create campaign')),
  });
}

export function useUpdateLeadCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: LeadCampaignUpdatePayload }) =>
      leadsService.updateCampaign(id, payload),
    onSuccess: () => {
      invalidateLeads(qc);
      toast.success('Campaign updated');
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Failed to update campaign')),
  });
}

export function useDeleteLeadCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => leadsService.deleteCampaign(id),
    onSuccess: () => {
      invalidateLeads(qc);
      toast.success('Campaign deleted');
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Failed to delete campaign')),
  });
}

export function useLeadFollowupStatuses(query = '') {
  return useQuery({
    queryKey: queryKeys.leads.followupStatuses.list(query),
    queryFn: () => leadsService.listFollowupStatuses(query || undefined),
  });
}

export function useCreateLeadFollowupStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: LeadFollowupStatusPayload) => leadsService.createFollowupStatus(payload),
    onSuccess: () => {
      invalidateLeads(qc);
      toast.success('Follow-up status created');
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Failed to create status')),
  });
}

export function useUpdateLeadFollowupStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: LeadFollowupStatusPayload }) =>
      leadsService.updateFollowupStatus(id, payload),
    onSuccess: () => {
      invalidateLeads(qc);
      toast.success('Follow-up status updated');
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Failed to update status')),
  });
}

export function useDeleteLeadFollowupStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => leadsService.deleteFollowupStatus(id),
    onSuccess: () => {
      invalidateLeads(qc);
      toast.success('Follow-up status deleted');
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Failed to delete status')),
  });
}

export function useLeadFollowups(query = '', leadId?: number) {
  return useQuery({
    queryKey: queryKeys.leads.followups.list(query, leadId ? String(leadId) : ''),
    queryFn: () => leadsService.listFollowups(query || undefined, leadId),
  });
}

export function useCreateLeadFollowup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: LeadFollowupCreatePayload) => leadsService.createFollowup(payload),
    onSuccess: () => {
      invalidateLeads(qc);
      toast.success('Follow-up created');
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Failed to create follow-up')),
  });
}

export function useUpdateLeadFollowup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: LeadFollowupUpdatePayload }) =>
      leadsService.updateFollowup(id, payload),
    onSuccess: () => {
      invalidateLeads(qc);
      toast.success('Follow-up updated');
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Failed to update follow-up')),
  });
}

export function useDeleteLeadFollowup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => leadsService.deleteFollowup(id),
    onSuccess: () => {
      invalidateLeads(qc);
      toast.success('Follow-up deleted');
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Failed to delete follow-up')),
  });
}

export function useLeadSources() {
  return useQuery({
    queryKey: queryKeys.leads.sources.list(),
    queryFn: () => leadsService.listSources(),
  });
}

export function useRenameLeadSource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: LeadSourceRenamePayload) => leadsService.renameSource(payload),
    onSuccess: () => {
      invalidateLeads(qc);
      toast.success('Source renamed');
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Failed to rename source')),
  });
}

export function useLeadPromoters() {
  return useQuery({
    queryKey: queryKeys.leads.promoters.list(),
    queryFn: () => leadsService.listPromoters(),
  });
}

export function useCreateLeadPromoter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: LeadPromoterCreatePayload) => leadsService.createPromoter(payload),
    onSuccess: () => {
      invalidateLeads(qc);
      toast.success('Promoter assigned');
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Failed to assign promoter')),
  });
}

export function useDeleteLeadPromoter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => leadsService.deletePromoter(id),
    onSuccess: () => {
      invalidateLeads(qc);
      toast.success('Promoter removed');
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Failed to remove promoter')),
  });
}

export function useLeadReport(enabled = true) {
  return useQuery({
    queryKey: queryKeys.leads.report(),
    queryFn: () => leadsService.getReport(),
    enabled,
  });
}
