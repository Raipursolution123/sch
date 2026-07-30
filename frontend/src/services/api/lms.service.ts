import type { Course, CreateCoursePayload, UpdateCoursePayload } from '@app-types/lms';
import type { PaginatedResponse } from '@app-types/index';
import { apiClient } from './client';

export const lmsService = {
  list: async (page = 1, pageSize = 20): Promise<PaginatedResponse<Course>> => {
    const { data } = await apiClient.get('/lms/courses/', {
      params: { page, page_size: pageSize },
    });
    return data;
  },

  getById: async (id: number): Promise<Course> => {
    const { data } = await apiClient.get(`/lms/courses/${id}/`);
    return data.data; // APIResponse wraps data inside .data
  },

  create: async (payload: CreateCoursePayload): Promise<Course> => {
    const { data } = await apiClient.post('/lms/courses/', payload);
    return data.data;
  },

  update: async (id: number, payload: UpdateCoursePayload): Promise<Course> => {
    const { data } = await apiClient.put(`/lms/courses/${id}/`, payload);
    return data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/lms/courses/${id}/`);
  },
};
