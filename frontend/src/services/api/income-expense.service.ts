import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type {
  CreateExpenseHeadPayload,
  CreateExpensePayload,
  CreateIncomeHeadPayload,
  CreateIncomePayload,
  ExpenseHead,
  ExpenseRecord,
  IncomeHead,
  IncomeRecord,
  UpdateExpenseHeadPayload,
  UpdateExpensePayload,
  UpdateIncomeHeadPayload,
  UpdateIncomePayload,
} from '@app-types/income-expense';
import { type BackendPayload, extractList } from '@utils/api-response';

const listParams = (query?: string) => ({
  page_size: 100,
  ...(query ? { q: query } : {}),
});

export const incomeExpenseService = {
  listIncomeHeads: async (query?: string) => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.income.heads, {
      params: listParams(query),
    });
    return extractList<IncomeHead>(data);
  },
  createIncomeHead: async (payload: CreateIncomeHeadPayload) => {
    const { data } = await apiClient.post<ApiSuccessResponse<IncomeHead>>(
      API_ENDPOINTS.income.heads,
      payload,
    );
    return data.data;
  },
  updateIncomeHead: async (id: number, payload: UpdateIncomeHeadPayload) => {
    const { data } = await apiClient.patch<ApiSuccessResponse<IncomeHead>>(
      API_ENDPOINTS.income.headDetail(id),
      payload,
    );
    return data.data;
  },
  deleteIncomeHead: async (id: number) => {
    await apiClient.delete(API_ENDPOINTS.income.headDetail(id));
  },

  listIncome: async (query?: string) => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.income.list, {
      params: listParams(query),
    });
    return extractList<IncomeRecord>(data);
  },
  createIncome: async (payload: CreateIncomePayload) => {
    const { data } = await apiClient.post<ApiSuccessResponse<IncomeRecord>>(
      API_ENDPOINTS.income.list,
      payload,
    );
    return data.data;
  },
  updateIncome: async (id: number, payload: UpdateIncomePayload) => {
    const { data } = await apiClient.patch<ApiSuccessResponse<IncomeRecord>>(
      API_ENDPOINTS.income.detail(id),
      payload,
    );
    return data.data;
  },
  deleteIncome: async (id: number) => {
    await apiClient.delete(API_ENDPOINTS.income.detail(id));
  },

  listExpenseHeads: async (query?: string) => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.expense.heads, {
      params: listParams(query),
    });
    return extractList<ExpenseHead>(data);
  },
  createExpenseHead: async (payload: CreateExpenseHeadPayload) => {
    const { data } = await apiClient.post<ApiSuccessResponse<ExpenseHead>>(
      API_ENDPOINTS.expense.heads,
      payload,
    );
    return data.data;
  },
  updateExpenseHead: async (id: number, payload: UpdateExpenseHeadPayload) => {
    const { data } = await apiClient.patch<ApiSuccessResponse<ExpenseHead>>(
      API_ENDPOINTS.expense.headDetail(id),
      payload,
    );
    return data.data;
  },
  deleteExpenseHead: async (id: number) => {
    await apiClient.delete(API_ENDPOINTS.expense.headDetail(id));
  },

  listExpense: async (query?: string) => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.expense.list, {
      params: listParams(query),
    });
    return extractList<ExpenseRecord>(data);
  },
  createExpense: async (payload: CreateExpensePayload) => {
    const { data } = await apiClient.post<ApiSuccessResponse<ExpenseRecord>>(
      API_ENDPOINTS.expense.list,
      payload,
    );
    return data.data;
  },
  updateExpense: async (id: number, payload: UpdateExpensePayload) => {
    const { data } = await apiClient.patch<ApiSuccessResponse<ExpenseRecord>>(
      API_ENDPOINTS.expense.detail(id),
      payload,
    );
    return data.data;
  },
  deleteExpense: async (id: number) => {
    await apiClient.delete(API_ENDPOINTS.expense.detail(id));
  },
};
