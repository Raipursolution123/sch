import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@constants/query-keys';
import { behaviourService } from '@services/api/behaviour.service';
import type { Incident } from '@app-types/index';

export function useIncidents() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.behaviour.incidents.list(),
    queryFn: () => behaviourService.listIncidents(),
  });

  const createMutation = useMutation({
    mutationFn: (payload: Omit<Incident, 'id' | 'created_at'>) =>
      behaviourService.createIncident(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.behaviour.incidents.list() });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<Incident> }) =>
      behaviourService.updateIncident(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.behaviour.incidents.list() });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => behaviourService.deleteIncident(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.behaviour.incidents.list() });
    },
  });

  return {
    ...query,
    createIncident: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateIncident: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteIncident: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}

export function useAssignedIncidents(params?: { class_id?: number; section_id?: number }) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.behaviour.assignments.list(params?.class_id, params?.section_id),
    queryFn: () => behaviourService.listAssignedIncidents(params),
  });

  const assignMutation = useMutation({
    mutationFn: (payload: { student_id: number; incident_id: number }) =>
      behaviourService.assignIncident(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.behaviour.all });
    },
  });

  return {
    ...query,
    assignIncident: assignMutation.mutateAsync,
    isAssigning: assignMutation.isPending,
  };
}

export function useIncidentComments(studentIncidentId: number) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.behaviour.comments.list(studentIncidentId),
    queryFn: () => behaviourService.listComments(studentIncidentId),
    enabled: studentIncidentId > 0,
  });

  const addCommentMutation = useMutation({
    mutationFn: (payload: { student_incident_id: number; comment: string; type: 'staff' | 'student' }) =>
      behaviourService.addComment(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.behaviour.comments.list(studentIncidentId) });
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: number) => behaviourService.deleteComment(commentId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.behaviour.comments.list(studentIncidentId) });
    },
  });

  return {
    ...query,
    addComment: addCommentMutation.mutateAsync,
    isAdding: addCommentMutation.isPending,
    deleteComment: deleteCommentMutation.mutateAsync,
    isDeleting: deleteCommentMutation.isPending,
  };
}

export function useBehaviourSetting() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.behaviour.settings.detail(),
    queryFn: () => behaviourService.getSetting(),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: { comment_option: string }) => behaviourService.updateSetting(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.behaviour.settings.detail() });
    },
  });

  return {
    ...query,
    updateSetting: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}
