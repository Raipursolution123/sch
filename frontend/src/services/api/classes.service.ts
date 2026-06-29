import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type {
  CreateClassPayload,
  SchoolClass,
  UpdateClassPayload,
} from '@app-types/academics/class';

// TODO: Remove mock store when GET /api/v1/academics/classes/ is available
let mockClasses: SchoolClass[] = [
  {
    id: 1,
    class_name: 'Nursery',
    sort_order: 1,
    is_hedu_program: false,
    is_active: 'yes',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: null,
  },
  {
    id: 2,
    class_name: 'LKG',
    sort_order: 2,
    is_hedu_program: false,
    is_active: 'yes',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: null,
  },
  {
    id: 3,
    class_name: 'UKG',
    sort_order: 3,
    is_hedu_program: false,
    is_active: 'yes',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: null,
  },
  {
    id: 4,
    class_name: 'Class 1',
    sort_order: 4,
    is_hedu_program: false,
    is_active: 'yes',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: null,
  },
  {
    id: 5,
    class_name: 'Class 2',
    sort_order: 5,
    is_hedu_program: false,
    is_active: 'yes',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: null,
  },
  {
    id: 6,
    class_name: 'Class 10',
    sort_order: 14,
    is_hedu_program: false,
    is_active: 'yes',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: null,
  },
  {
    id: 7,
    class_name: 'Class 11 (Science)',
    sort_order: 15,
    is_hedu_program: true,
    is_active: 'no',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: null,
  },
];
let nextMockId = 8;

const USE_MOCK = true; // TODO: Set to false when backend classes API is deployed

function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function mockList(): SchoolClass[] {
  return [...mockClasses].sort((a, b) => a.sort_order - b.sort_order || a.class_name.localeCompare(b.class_name));
}

function nextSortOrder(): number {
  if (mockClasses.length === 0) return 1;
  return Math.max(...mockClasses.map((c) => c.sort_order)) + 1;
}

export const classesService = {
  list: async (): Promise<SchoolClass[]> => {
    if (USE_MOCK) {
      return delay(mockList());
    }
    // TODO: Wire when backend exposes GET /api/v1/academics/classes/
    const { data } = await apiClient.get<ApiSuccessResponse<SchoolClass[]>>(
      API_ENDPOINTS.academics.classes,
    );
    return data.data;
  },

  create: async (payload: CreateClassPayload): Promise<SchoolClass> => {
    if (USE_MOCK) {
      const name = payload.class_name.trim();
      if (mockClasses.some((c) => c.class_name.toLowerCase() === name.toLowerCase())) {
        throw new Error('A class with this name already exists');
      }
      const created: SchoolClass = {
        id: nextMockId++,
        class_name: name,
        sort_order: payload.sort_order,
        is_hedu_program: payload.is_hedu_program,
        is_active: payload.is_active,
        created_at: new Date().toISOString(),
        updated_at: null,
      };
      mockClasses = [...mockClasses, created];
      return delay(created);
    }
    // TODO: Wire when backend exposes POST /api/v1/academics/classes/
    const { data } = await apiClient.post<ApiSuccessResponse<SchoolClass>>(
      API_ENDPOINTS.academics.classes,
      payload,
    );
    return data.data;
  },

  update: async (id: number, payload: UpdateClassPayload): Promise<SchoolClass> => {
    if (USE_MOCK) {
      const index = mockClasses.findIndex((c) => c.id === id);
      if (index === -1) throw new Error('Class not found');
      const name = payload.class_name.trim();
      const duplicate = mockClasses.some(
        (c) => c.id !== id && c.class_name.toLowerCase() === name.toLowerCase(),
      );
      if (duplicate) {
        throw new Error('A class with this name already exists');
      }
      const updated: SchoolClass = {
        ...mockClasses[index],
        class_name: name,
        sort_order: payload.sort_order,
        is_hedu_program: payload.is_hedu_program,
        is_active: payload.is_active,
        updated_at: new Date().toISOString().slice(0, 10),
      };
      mockClasses = mockClasses.map((c) => (c.id === id ? updated : c));
      return delay(updated);
    }
    // TODO: Wire when backend exposes PATCH /api/v1/academics/classes/{id}/
    const { data } = await apiClient.patch<ApiSuccessResponse<SchoolClass>>(
      API_ENDPOINTS.academics.classDetail(id),
      payload,
    );
    return data.data;
  },

  delete: async (id: number): Promise<void> => {
    if (USE_MOCK) {
      const target = mockClasses.find((c) => c.id === id);
      if (!target) throw new Error('Class not found');
      if (target.is_active === 'yes') {
        throw new Error('Cannot delete an active class. Deactivate it first.');
      }
      mockClasses = mockClasses.filter((c) => c.id !== id);
      return delay(undefined);
    }
    // TODO: Wire when backend exposes DELETE /api/v1/academics/classes/{id}/
    await apiClient.delete(API_ENDPOINTS.academics.classDetail(id));
  },

  /** Suggested sort order for new class forms. */
  suggestSortOrder: async (): Promise<number> => {
    if (USE_MOCK) {
      return delay(nextSortOrder());
    }
    const classes = await classesService.list();
    if (classes.length === 0) return 1;
    return Math.max(...classes.map((c) => c.sort_order)) + 1;
  },
};
