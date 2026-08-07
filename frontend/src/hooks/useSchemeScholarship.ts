import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  schemeScholarshipService,
  type SchemeValue,
} from '@services/api/scheme-scholarship.service';
import { getApiErrorMessage } from '@utils/session';

export function useFeeSchemes() {
  return useQuery({
    queryKey: ['fees', 'schemes'],
    queryFn: schemeScholarshipService.listSchemes,
  });
}

export function useCreateFeeScheme() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: schemeScholarshipService.createScheme,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['fees', 'schemes'] });
      toast.success('Scheme created');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to create scheme')),
  });
}

export function useDeleteFeeScheme() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: schemeScholarshipService.deleteScheme,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['fees', 'schemes'] });
      toast.success('Scheme deleted');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to delete scheme')),
  });
}

export function useSchemeConfig(schemeId: number | null) {
  return useQuery({
    queryKey: ['fees', 'schemes', schemeId, 'config'],
    queryFn: () => schemeScholarshipService.getSchemeConfig(schemeId!),
    enabled: schemeId !== null && schemeId > 0,
  });
}

export function useSaveSchemeConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: { values: SchemeValue[]; feetype_ids: number[] };
    }) => schemeScholarshipService.saveSchemeConfig(id, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['fees', 'schemes'] });
      toast.success('Scheme configuration saved');
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, 'Failed to save scheme configuration')),
  });
}

export function useSchemeApplications(
  filters?: {
    ss_id?: number;
    applied_status?: number;
    class_id?: number;
    section_id?: number;
  },
  enabled = true,
) {
  return useQuery({
    queryKey: ['fees', 'scheme-applications', filters],
    queryFn: () => schemeScholarshipService.listApplications(filters),
    enabled,
  });
}

export function useApplyScheme() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: schemeScholarshipService.apply,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['fees', 'scheme-applications'] });
      toast.success('Scheme applied');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to apply scheme')),
  });
}

export function useApproveSchemeApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: schemeScholarshipService.approve,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['fees', 'scheme-applications'] });
      toast.success('Application approved');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to approve')),
  });
}

export function useRejectSchemeApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: schemeScholarshipService.reject,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['fees', 'scheme-applications'] });
      toast.success('Application rejected');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to reject')),
  });
}
