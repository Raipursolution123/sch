import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type {
  CreateEnquiryPayload,
  Enquiry,
  UpdateEnquiryPayload,
} from '@app-types/front-office/enquiry';
import { type BackendPayload, extractList } from '@utils/api-response';

export const enquiryService = {
  list: async (): Promise<Enquiry[]> => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.frontOffice.enquiries);
    return extractList<Enquiry>(data);
  },

  create: async (payload: CreateEnquiryPayload): Promise<Enquiry> => {
    const { data } = await apiClient.post<ApiSuccessResponse<Enquiry>>(
      API_ENDPOINTS.frontOffice.enquiries,
      payload,
    );
    return data.data;
  },

  update: async (id: number, payload: UpdateEnquiryPayload): Promise<Enquiry> => {
    const { data } = await apiClient.patch<ApiSuccessResponse<Enquiry>>(
      API_ENDPOINTS.frontOffice.enquiryDetail(id),
      payload,
    );
    return data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.frontOffice.enquiryDetail(id));
  },
};
