import { apiClient } from './client';
import type { EntryType } from '@/types/finance';
import type { ApiSuccessResponse } from '@/types/api';

const BASE_PATH = '/finance/entry-types/';

export const entryTypesService = {
  getEntryTypes: async () => {
    const response = await apiClient.get<ApiSuccessResponse<EntryType[]>>(BASE_PATH);
    return response.data.data;
  },
};
