import type { Course, CreateCoursePayload, UpdateCoursePayload } from '@app-types/lms';
import type { PaginatedResponse } from '@app-types/index';
import { apiClient } from './client';

export interface CourseCategory {
  id: number;
  category_name: string;
  slug: string;
  is_active: number;
}

export interface OfflinePayment {
  id: number;
  student_id: number;
  online_courses_id: number;
  course_name: string;
  paid_amount: number;
  payment_mode: string;
  transaction_id: string;
  date: string;
}

export interface LMSSettings {
  id: number;
  guest_prefix: string;
  guest_id_start_from: number;
  guest_login: number;
}

export const lmsService = {
  list: async (page = 1, pageSize = 20): Promise<PaginatedResponse<Course>> => {
    const { data } = await apiClient.get('/lms/courses/', {
      params: { page, page_size: pageSize },
    });
    return data;
  },

  getById: async (id: number): Promise<Course> => {
    const { data } = await apiClient.get(`/lms/courses/${id}/`);
    return data.data;
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

  // Category Management
  listCategories: async (): Promise<CourseCategory[]> => {
    const { data } = await apiClient.get('/lms/categories/');
    return data.data.categories;
  },

  createCategory: async (categoryName: string): Promise<CourseCategory> => {
    const { data } = await apiClient.post('/lms/categories/', { category_name: categoryName });
    return data.data;
  },

  deleteCategory: async (id: number): Promise<void> => {
    await apiClient.delete(`/lms/categories/${id}/`);
  },

  // Offline Payment Management
  listOfflinePayments: async (): Promise<OfflinePayment[]> => {
    const { data } = await apiClient.get('/lms/offline-payments/');
    return data.data.payments;
  },

  createOfflinePayment: async (payload: Partial<OfflinePayment>): Promise<OfflinePayment> => {
    const { data } = await apiClient.post('/lms/offline-payments/', payload);
    return data.data;
  },

  // LMS Settings
  getSettings: async (): Promise<LMSSettings> => {
    const { data } = await apiClient.get('/lms/settings/');
    return data.data;
  },

  updateSettings: async (payload: Partial<LMSSettings>): Promise<void> => {
    await apiClient.post('/lms/settings/', payload);
  },

  // Reports
  getReports: async (type: string): Promise<any[]> => {
    const { data } = await apiClient.get(`/lms/reports/?type=${type}`);
    return data.data.reports;
  },
};
