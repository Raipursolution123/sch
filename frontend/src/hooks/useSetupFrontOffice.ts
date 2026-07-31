import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { setupFrontOfficeService } from '@services/api';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@utils/error-message';
import type {
  CreateComplaintTypePayload,
  UpdateComplaintTypePayload,
  CreateSourcePayload,
  UpdateSourcePayload,
  CreateReferencePayload,
  UpdateReferencePayload,
} from '@app-types/front-office/setup';

export const SETUP_FO_KEYS = {
  complaintTypes: ['setup-fo', 'complaint-types'] as const,
  sources: ['setup-fo', 'sources'] as const,
  references: ['setup-fo', 'references'] as const,
};

// --- Complaint Types ---
export const useComplaintTypes = () => {
  return useQuery({
    queryKey: SETUP_FO_KEYS.complaintTypes,
    queryFn: () => setupFrontOfficeService.getComplaintTypes(),
  });
};

export const useCreateComplaintType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateComplaintTypePayload) =>
      setupFrontOfficeService.createComplaintType(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SETUP_FO_KEYS.complaintTypes });
      toast.success('Complaint type created successfully');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to create complaint type')),
  });
};

export const useUpdateComplaintType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateComplaintTypePayload }) =>
      setupFrontOfficeService.updateComplaintType(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SETUP_FO_KEYS.complaintTypes });
      toast.success('Complaint type updated successfully');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to update complaint type')),
  });
};

export const useDeleteComplaintType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => setupFrontOfficeService.deleteComplaintType(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SETUP_FO_KEYS.complaintTypes });
      toast.success('Complaint type deleted successfully');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to delete complaint type')),
  });
};

// --- Sources ---
export const useSources = () => {
  return useQuery({
    queryKey: SETUP_FO_KEYS.sources,
    queryFn: () => setupFrontOfficeService.getSources(),
  });
};

export const useCreateSource = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSourcePayload) => setupFrontOfficeService.createSource(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SETUP_FO_KEYS.sources });
      toast.success('Source created successfully');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to create source')),
  });
};

export const useUpdateSource = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateSourcePayload }) =>
      setupFrontOfficeService.updateSource(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SETUP_FO_KEYS.sources });
      toast.success('Source updated successfully');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to update source')),
  });
};

export const useDeleteSource = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => setupFrontOfficeService.deleteSource(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SETUP_FO_KEYS.sources });
      toast.success('Source deleted successfully');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to delete source')),
  });
};

// --- References ---
export const useReferences = () => {
  return useQuery({
    queryKey: SETUP_FO_KEYS.references,
    queryFn: () => setupFrontOfficeService.getReferences(),
  });
};

export const useCreateReference = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateReferencePayload) => setupFrontOfficeService.createReference(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SETUP_FO_KEYS.references });
      toast.success('Reference created successfully');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to create reference')),
  });
};

export const useUpdateReference = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateReferencePayload }) =>
      setupFrontOfficeService.updateReference(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SETUP_FO_KEYS.references });
      toast.success('Reference updated successfully');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to update reference')),
  });
};

export const useDeleteReference = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => setupFrontOfficeService.deleteReference(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SETUP_FO_KEYS.references });
      toast.success('Reference deleted successfully');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to delete reference')),
  });
};
