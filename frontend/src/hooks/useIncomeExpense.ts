import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@constants/query-keys';
import { incomeExpenseService } from '@services/api/income-expense.service';
import type {
  CreateExpenseHeadPayload,
  CreateExpensePayload,
  CreateIncomeHeadPayload,
  CreateIncomePayload,
  UpdateExpenseHeadPayload,
  UpdateExpensePayload,
  UpdateIncomeHeadPayload,
  UpdateIncomePayload,
} from '@app-types/income-expense';
import { getApiErrorMessage } from '@utils/session';

function invalidate(qc: ReturnType<typeof useQueryClient>) {
  void qc.invalidateQueries({ queryKey: queryKeys.incomeExpense.all });
}

export function useIncomeHeads() {
  return useQuery({
    queryKey: queryKeys.incomeExpense.incomeHeads.list(),
    queryFn: () => incomeExpenseService.listIncomeHeads(),
  });
}

export function useCreateIncomeHead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: CreateIncomeHeadPayload) => incomeExpenseService.createIncomeHead(p),
    onSuccess: () => {
      invalidate(qc);
      toast.success('Income head created');
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Failed to create income head')),
  });
}

export function useUpdateIncomeHead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateIncomeHeadPayload }) =>
      incomeExpenseService.updateIncomeHead(id, payload),
    onSuccess: () => {
      invalidate(qc);
      toast.success('Income head updated');
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Failed to update income head')),
  });
}

export function useDeleteIncomeHead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => incomeExpenseService.deleteIncomeHead(id),
    onSuccess: () => {
      invalidate(qc);
      toast.success('Income head deleted');
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Failed to delete income head')),
  });
}

export function useIncomeList(query = '') {
  return useQuery({
    queryKey: queryKeys.incomeExpense.income.list(query),
    queryFn: () => incomeExpenseService.listIncome(query || undefined),
  });
}

export function useCreateIncome() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: CreateIncomePayload) => incomeExpenseService.createIncome(p),
    onSuccess: () => {
      invalidate(qc);
      toast.success('Income added');
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Failed to add income')),
  });
}

export function useUpdateIncome() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateIncomePayload }) =>
      incomeExpenseService.updateIncome(id, payload),
    onSuccess: () => {
      invalidate(qc);
      toast.success('Income updated');
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Failed to update income')),
  });
}

export function useDeleteIncome() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => incomeExpenseService.deleteIncome(id),
    onSuccess: () => {
      invalidate(qc);
      toast.success('Income deleted');
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Failed to delete income')),
  });
}

export function useExpenseHeads() {
  return useQuery({
    queryKey: queryKeys.incomeExpense.expenseHeads.list(),
    queryFn: () => incomeExpenseService.listExpenseHeads(),
  });
}

export function useCreateExpenseHead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: CreateExpenseHeadPayload) => incomeExpenseService.createExpenseHead(p),
    onSuccess: () => {
      invalidate(qc);
      toast.success('Expense head created');
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Failed to create expense head')),
  });
}

export function useUpdateExpenseHead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateExpenseHeadPayload }) =>
      incomeExpenseService.updateExpenseHead(id, payload),
    onSuccess: () => {
      invalidate(qc);
      toast.success('Expense head updated');
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Failed to update expense head')),
  });
}

export function useDeleteExpenseHead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => incomeExpenseService.deleteExpenseHead(id),
    onSuccess: () => {
      invalidate(qc);
      toast.success('Expense head deleted');
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Failed to delete expense head')),
  });
}

export function useExpenseList(query = '') {
  return useQuery({
    queryKey: queryKeys.incomeExpense.expense.list(query),
    queryFn: () => incomeExpenseService.listExpense(query || undefined),
  });
}

export function useCreateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: CreateExpensePayload) => incomeExpenseService.createExpense(p),
    onSuccess: () => {
      invalidate(qc);
      toast.success('Expense added');
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Failed to add expense')),
  });
}

export function useUpdateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateExpensePayload }) =>
      incomeExpenseService.updateExpense(id, payload),
    onSuccess: () => {
      invalidate(qc);
      toast.success('Expense updated');
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Failed to update expense')),
  });
}

export function useDeleteExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => incomeExpenseService.deleteExpense(id),
    onSuccess: () => {
      invalidate(qc);
      toast.success('Expense deleted');
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Failed to delete expense')),
  });
}
