import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@constants/query-keys';
import { libraryService } from '@services/api/library.service';
import type {
  CreateLibraryBookPayload,
  CreateLibraryMemberPayload,
  IssueBookPayload,
  UpdateLibraryBookPayload,
} from '@app-types/library';
import { getApiErrorMessage } from '@utils/session';

export function useLibraryBooks(query = '') {
  return useQuery({
    queryKey: queryKeys.library.books.list(query),
    queryFn: () => libraryService.listBooks(query || undefined),
  });
}

export function useCreateLibraryBook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateLibraryBookPayload) => libraryService.createBook(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.library.all });
      toast.success('Book created');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to create book')),
  });
}

export function useUpdateLibraryBook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateLibraryBookPayload }) =>
      libraryService.updateBook(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.library.all });
      toast.success('Book updated');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to update book')),
  });
}

export function useDeleteLibraryBook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => libraryService.deleteBook(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.library.all });
      toast.success('Book deleted');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to delete book')),
  });
}

export function useBookIssues(status = 'open', query = '') {
  return useQuery({
    queryKey: queryKeys.library.issues.list(status, query),
    queryFn: () => libraryService.listIssues(status, query || undefined),
  });
}

export function useIssueBook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: IssueBookPayload) => libraryService.issueBook(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.library.all });
      toast.success('Book issued');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to issue book')),
  });
}

export function useReturnBook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => libraryService.returnBook(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.library.all });
      toast.success('Book returned');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to return book')),
  });
}

export function useLibraryMembers() {
  return useQuery({
    queryKey: queryKeys.library.members.list(),
    queryFn: () => libraryService.listMembers(),
  });
}

export function useCreateLibraryMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateLibraryMemberPayload) => libraryService.createMember(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.library.members.list() });
      toast.success('Member added');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to add member')),
  });
}
