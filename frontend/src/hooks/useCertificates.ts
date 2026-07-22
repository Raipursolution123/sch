import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@constants/query-keys';
import { certificatesService } from '@services/api/certificates.service';
import type {
  CreateCertificateTemplatePayload,
  UpdateCertificateTemplatePayload,
} from '@app-types/certificates';
import { getApiErrorMessage } from '@utils/session';

export function useCertificateTemplates(query = '') {
  return useQuery({
    queryKey: queryKeys.certificates.templates.list(query),
    queryFn: () => certificatesService.list(query || undefined),
  });
}

export function useCreateCertificateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCertificateTemplatePayload) => certificatesService.create(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.certificates.all });
      toast.success('Certificate template created');
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Failed to create template')),
  });
}

export function useUpdateCertificateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateCertificateTemplatePayload }) =>
      certificatesService.update(id, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.certificates.all });
      toast.success('Certificate template updated');
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Failed to update template')),
  });
}

export function useDeleteCertificateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => certificatesService.delete(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.certificates.all });
      toast.success('Certificate template deleted');
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Failed to delete template')),
  });
}

export function useGenerateCertificate() {
  return useMutation({
    mutationFn: ({ certificateId, studentId }: { certificateId: number; studentId: number }) =>
      certificatesService.generate(certificateId, studentId),
    onError: (e) => toast.error(getApiErrorMessage(e, 'Failed to generate certificate')),
  });
}
