import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@constants/query-keys';
import { onlineExamsService } from '@services/api/online-exams.service';
import type {
  AddExamQuestionsPayload,
  CreateOnlineExamPayload,
  CreateQuestionPayload,
  UpdateOnlineExamPayload,
  UpdateQuestionPayload,
} from '@app-types/examinations/online-exams';
import { getApiErrorMessage } from '@utils/session';

export function useQuestions(query = '') {
  return useQuery({
    queryKey: queryKeys.onlineExams.questions.list(query),
    queryFn: () => onlineExamsService.listQuestions(query || undefined),
  });
}

export function useCreateQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateQuestionPayload) => onlineExamsService.createQuestion(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.onlineExams.all });
      toast.success('Question created');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to create question')),
  });
}

export function useUpdateQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateQuestionPayload }) =>
      onlineExamsService.updateQuestion(id, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.onlineExams.all });
      toast.success('Question updated');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to update question')),
  });
}

export function useDeleteQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => onlineExamsService.deleteQuestion(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.onlineExams.all });
      toast.success('Question deleted');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to delete question')),
  });
}

export function useOnlineExams(query = '') {
  return useQuery({
    queryKey: queryKeys.onlineExams.exams.list(query),
    queryFn: () => onlineExamsService.listExams(query || undefined),
  });
}

export function useCreateOnlineExam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateOnlineExamPayload) => onlineExamsService.createExam(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.onlineExams.all });
      toast.success('Online exam created');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to create online exam')),
  });
}

export function useUpdateOnlineExam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateOnlineExamPayload }) =>
      onlineExamsService.updateExam(id, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.onlineExams.all });
      toast.success('Online exam updated');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to update online exam')),
  });
}

export function useDeleteOnlineExam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => onlineExamsService.deleteExam(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.onlineExams.all });
      toast.success('Online exam deleted');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to delete online exam')),
  });
}

export function useOnlineExamQuestions(examId: number, enabled = true) {
  return useQuery({
    queryKey: queryKeys.onlineExams.exams.questions(examId),
    queryFn: () => onlineExamsService.listExamQuestions(examId),
    enabled: enabled && examId > 0,
  });
}

export function useAddOnlineExamQuestions(examId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddExamQuestionsPayload) =>
      onlineExamsService.addExamQuestions(examId, payload),
    onSuccess: (result) => {
      void qc.invalidateQueries({ queryKey: queryKeys.onlineExams.all });
      toast.success(
        result.created > 0
          ? `Added ${result.created} question(s)`
          : result.skipped > 0
            ? 'Selected questions already linked'
            : 'Questions updated',
      );
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to add questions')),
  });
}

export function useRemoveOnlineExamQuestion(examId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (linkId: number) => onlineExamsService.removeExamQuestion(examId, linkId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.onlineExams.all });
      toast.success('Question removed from exam');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to remove question')),
  });
}

export function useOnlineExamRoster(
  examId: number,
  classId: number,
  sectionId: number,
  enabled = true,
) {
  return useQuery({
    queryKey: queryKeys.onlineExams.exams.roster(examId, classId, sectionId),
    queryFn: () => onlineExamsService.getRoster(examId, classId, sectionId),
    enabled: enabled && examId > 0 && classId > 0 && sectionId > 0,
  });
}

export function useAssignOnlineExamStudents(examId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (studentSessionIds: number[]) =>
      onlineExamsService.assignStudents(examId, studentSessionIds),
    onSuccess: (result) => {
      void qc.invalidateQueries({ queryKey: queryKeys.onlineExams.all });
      toast.success(
        result.assigned_count > 0
          ? `Assigned ${result.assigned_count} student(s)`
          : 'No new students assigned',
      );
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to assign students')),
  });
}

export function useUnassignOnlineExamStudent(examId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (assignmentId: number) => onlineExamsService.unassignStudent(examId, assignmentId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.onlineExams.all });
      toast.success('Student unassigned');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to unassign student')),
  });
}
