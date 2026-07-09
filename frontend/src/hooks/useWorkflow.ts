import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@constants/query-keys';
import { workflowService } from '@services/api/workflow.service';
import type { WorkflowStatus } from '@app-types/workflow';

export function useWorkflowRecord(entityType: string, entityId: number) {
  return useQuery({
    queryKey: queryKeys.workflows.record(entityType, entityId),
    queryFn: () => workflowService.get(entityType, entityId),
  });
}

export function useWorkflowTransition(entityType: string, entityId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      status,
      actor,
      note,
    }: {
      status: WorkflowStatus;
      actor: { name: string; role?: string };
      note?: string;
    }) => workflowService.transition(entityType, entityId, status, actor, note),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.workflows.all });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.workflows.record(entityType, entityId),
      });
    },
  });
}

export function useExamWorkflows() {
  return useQuery({
    queryKey: queryKeys.workflows.exams(),
    queryFn: () => workflowService.listByType('exam'),
  });
}
