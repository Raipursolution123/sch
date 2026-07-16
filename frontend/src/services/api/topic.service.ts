import { apiClient } from './client';
import type { ApiSuccessResponse, PaginatedResponse } from '@/types/api';
import type { Topic, TopicCreatePayload, TopicUpdatePayload } from '@/types/academics/topic';

const BASE_PATH = '/academics/topics';

export const topicService = {
  getTopicList: async (params?: Record<string, any>) => {
    const response = await apiClient.get<ApiSuccessResponse<PaginatedResponse<Topic>>>(
      `${BASE_PATH}/`,
      { params },
    );
    return response.data.data;
  },

  createTopic: async (data: TopicCreatePayload) => {
    const response = await apiClient.post<ApiSuccessResponse<Topic>>(`${BASE_PATH}/`, data);
    return response.data.data;
  },

  updateTopic: async (id: number, data: TopicUpdatePayload) => {
    const response = await apiClient.put<ApiSuccessResponse<Topic>>(`${BASE_PATH}/${id}/`, data);
    return response.data.data;
  },

  deleteTopic: async (id: number) => {
    const response = await apiClient.delete<ApiSuccessResponse<null>>(`${BASE_PATH}/${id}/`);
    return response.data;
  },
};
