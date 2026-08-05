import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@constants/query-keys';
import {
  behaviourService,
  type AssignIncidentPayload,
  type CreateIncidentPayload,
} from '@services/api/behaviour.service';
import { getApiErrorMessage } from '@utils/session';

export function useBehaviourIncidents() {
  return useQuery({
    queryKey: queryKeys.behaviour.incidents(),
    queryFn: behaviourService.listIncidents,
  });
}

export function useCreateBehaviourIncident() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateIncidentPayload) => behaviourService.createIncident(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.behaviour.all });
      toast.success('Incident type created');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to create incident type')),
  });
}

export function useUpdateBehaviourIncident() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CreateIncidentPayload }) =>
      behaviourService.updateIncident(id, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.behaviour.all });
      toast.success('Incident type updated');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to update incident type')),
  });
}

export function useDeleteBehaviourIncident() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => behaviourService.deleteIncident(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.behaviour.all });
      toast.success('Incident type deleted');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to delete incident type')),
  });
}

export function useBehaviourAssignments(sessionId?: number) {
  return useQuery({
    queryKey: queryKeys.behaviour.assignments(sessionId),
    queryFn: () => behaviourService.listAssignments(sessionId),
  });
}

export function useAssignBehaviourIncident() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AssignIncidentPayload) => behaviourService.assign(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.behaviour.all });
      toast.success('Incident assigned');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to assign incident')),
  });
}

export function useDeleteBehaviourAssignment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => behaviourService.deleteAssignment(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.behaviour.all });
      toast.success('Assignment deleted');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to delete assignment')),
  });
}
