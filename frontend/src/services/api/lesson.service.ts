import { apiClient } from './client';
import type { ApiSuccessResponse, PaginatedResponse } from '@/types/api';
import type { Lesson, LessonCreatePayload, LessonUpdatePayload } from '@/types/academics/lesson';

const BASE_PATH = '/academics/lessons';

export const lessonService = {
  getLessonList: async (params?: Record<string, any>) => {
    const response = await apiClient.get<ApiSuccessResponse<PaginatedResponse<Lesson>>>(
      `${BASE_PATH}/`,
      { params },
    );
    return response.data.data;
  },

  createLesson: async (data: LessonCreatePayload) => {
    const response = await apiClient.post<ApiSuccessResponse<Lesson>>(`${BASE_PATH}/`, data);
    return response.data.data;
  },

  updateLesson: async (id: number, data: LessonUpdatePayload) => {
    const response = await apiClient.put<ApiSuccessResponse<Lesson>>(`${BASE_PATH}/${id}/`, data);
    return response.data.data;
  },

  deleteLesson: async (id: number) => {
    const response = await apiClient.delete<ApiSuccessResponse<null>>(`${BASE_PATH}/${id}/`);
    return response.data;
  },
};
