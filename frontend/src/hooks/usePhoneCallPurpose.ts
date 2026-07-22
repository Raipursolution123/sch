import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@constants/query-keys';
import {
  phoneCallLogService,
  visitorPurposeService,
} from '@services/api/phone-call-purpose.service';
import type {
  CreatePhoneCallLogPayload,
  CreateVisitorPurposePayload,
  UpdatePhoneCallLogPayload,
  UpdateVisitorPurposePayload,
} from '@app-types/front-office/phone-call-purpose';
import { getApiErrorMessage } from '@utils/session';

export function usePhoneCallLogs() {
  return useQuery({
    queryKey: queryKeys.frontOffice.phoneCalls.list(),
    queryFn: phoneCallLogService.list,
  });
}

export function useCreatePhoneCallLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePhoneCallLogPayload) => phoneCallLogService.create(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.frontOffice.phoneCalls.list() });
      toast.success('Phone call logged');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to log call')),
  });
}

export function useUpdatePhoneCallLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdatePhoneCallLogPayload }) =>
      phoneCallLogService.update(id, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.frontOffice.phoneCalls.list() });
      toast.success('Phone call updated');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to update call')),
  });
}

export function useDeletePhoneCallLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => phoneCallLogService.delete(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.frontOffice.phoneCalls.list() });
      toast.success('Phone call deleted');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to delete call')),
  });
}

export function useVisitorPurposes() {
  return useQuery({
    queryKey: queryKeys.frontOffice.visitorPurposes.list(),
    queryFn: visitorPurposeService.list,
  });
}

export function useCreateVisitorPurpose() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateVisitorPurposePayload) => visitorPurposeService.create(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.frontOffice.visitorPurposes.list() });
      toast.success('Visitor purpose created');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to create purpose')),
  });
}

export function useUpdateVisitorPurpose() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateVisitorPurposePayload }) =>
      visitorPurposeService.update(id, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.frontOffice.visitorPurposes.list() });
      toast.success('Visitor purpose updated');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to update purpose')),
  });
}

export function useDeleteVisitorPurpose() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => visitorPurposeService.delete(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.frontOffice.visitorPurposes.list() });
      toast.success('Visitor purpose deleted');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to delete purpose')),
  });
}
