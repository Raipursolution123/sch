import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@constants/query-keys';
import { examTemplatesService } from '@services/api/exam-templates.service';
import type {
  CreateAdmitCardTemplatePayload,
  CreateMarksheetTemplatePayload,
  UpdateAdmitCardTemplatePayload,
  UpdateMarksheetTemplatePayload,
} from '@app-types/examinations/exam-templates';
import { getApiErrorMessage } from '@utils/session';

export function useAdmitCardTemplates() {
  return useQuery({
    queryKey: queryKeys.examinations.admitCards.list(),
    queryFn: examTemplatesService.listAdmitCards,
  });
}

export function useCreateAdmitCardTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAdmitCardTemplatePayload) =>
      examTemplatesService.createAdmitCard(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.examinations.admitCards.list() });
      toast.success('Admit card template created');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to create template')),
  });
}

export function useUpdateAdmitCardTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateAdmitCardTemplatePayload }) =>
      examTemplatesService.updateAdmitCard(id, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.examinations.admitCards.list() });
      toast.success('Admit card template updated');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to update template')),
  });
}

export function useDeleteAdmitCardTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => examTemplatesService.deleteAdmitCard(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.examinations.admitCards.list() });
      toast.success('Admit card template deleted');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to delete template')),
  });
}

export function useMarksheetTemplates() {
  return useQuery({
    queryKey: queryKeys.examinations.marksheets.list(),
    queryFn: examTemplatesService.listMarksheets,
  });
}

export function useCreateMarksheetTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateMarksheetTemplatePayload) =>
      examTemplatesService.createMarksheet(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.examinations.marksheets.list() });
      toast.success('Marksheet template created');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to create template')),
  });
}

export function useUpdateMarksheetTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateMarksheetTemplatePayload }) =>
      examTemplatesService.updateMarksheet(id, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.examinations.marksheets.list() });
      toast.success('Marksheet template updated');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to update template')),
  });
}

export function useDeleteMarksheetTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => examTemplatesService.deleteMarksheet(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.examinations.marksheets.list() });
      toast.success('Marksheet template deleted');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to delete template')),
  });
}
