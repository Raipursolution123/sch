import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type {
  CreateVisitorsBookPayload,
  UpdateVisitorsBookPayload,
  VisitorsBookEntry,
} from '@app-types/front-office/visitors-book';
import { type BackendPayload, extractList } from '@utils/api-response';

export const visitorsBookService = {
  list: async (): Promise<VisitorsBookEntry[]> => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.frontOffice.visitors);
    return extractList<VisitorsBookEntry>(data);
  },

  create: async (payload: CreateVisitorsBookPayload): Promise<VisitorsBookEntry> => {
    const { data } = await apiClient.post<ApiSuccessResponse<VisitorsBookEntry>>(
      API_ENDPOINTS.frontOffice.visitors,
      payload,
    );
    return data.data;
  },

  update: async (id: number, payload: UpdateVisitorsBookPayload): Promise<VisitorsBookEntry> => {
    const { data } = await apiClient.patch<ApiSuccessResponse<VisitorsBookEntry>>(
      API_ENDPOINTS.frontOffice.visitorDetail(id),
      payload,
    );
    return data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.frontOffice.visitorDetail(id));
  },
};
