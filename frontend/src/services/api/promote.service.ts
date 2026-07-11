import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type {
  PromoteExecutePayload,
  PromoteExecuteResult,
  PromotePreview,
  PromotePreviewParams,
} from '@app-types/academics/promote';

function previewQuery(params: PromotePreviewParams): string {
  const search = new URLSearchParams({
    from_session_id: String(params.from_session_id),
    from_class_id: String(params.from_class_id),
    from_section_id: String(params.from_section_id),
    to_session_id: String(params.to_session_id),
    to_class_id: String(params.to_class_id),
    to_section_id: String(params.to_section_id),
  });
  return search.toString();
}

export const promoteService = {
  preview: async (params: PromotePreviewParams): Promise<PromotePreview> => {
    const { data } = await apiClient.get<ApiSuccessResponse<PromotePreview>>(
      `${API_ENDPOINTS.academics.promotePreview}?${previewQuery(params)}`,
    );
    return data.data;
  },

  execute: async (payload: PromoteExecutePayload): Promise<PromoteExecuteResult> => {
    const { data } = await apiClient.post<ApiSuccessResponse<PromoteExecuteResult>>(
      API_ENDPOINTS.academics.promote,
      payload,
    );
    return data.data;
  },
};
