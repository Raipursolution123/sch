import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@constants/query-keys';
import { visitorsBookService } from '@services/api/visitors-book.service';
import type {
  CreateVisitorsBookPayload,
  UpdateVisitorsBookPayload,
} from '@app-types/front-office/visitors-book';
import { getApiErrorMessage } from '@utils/session';

export function useVisitorsBook() {
  return useQuery({
    queryKey: queryKeys.frontOffice.visitors.list(),
    queryFn: visitorsBookService.list,
  });
}

export function useCreateVisitor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateVisitorsBookPayload) => visitorsBookService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.frontOffice.all });
      toast.success('Visitor record created');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to create visitor record')),
  });
}

export function useUpdateVisitor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateVisitorsBookPayload }) =>
      visitorsBookService.update(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.frontOffice.all });
      toast.success('Visitor record updated');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to update visitor record')),
  });
}

export function useDeleteVisitor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => visitorsBookService.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.frontOffice.all });
      toast.success('Visitor record deleted');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to delete visitor record')),
  });
}
