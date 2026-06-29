import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type {
  CreateSectionPayload,
  Section,
  UpdateSectionPayload,
} from '@app-types/academics/section';

// TODO: Remove mock store when GET /api/v1/academics/sections/ is available
let mockSections: Section[] = [
  {
    id: 1,
    section_name: 'A',
    is_active: 'yes',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: null,
  },
  {
    id: 2,
    section_name: 'B',
    is_active: 'yes',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: null,
  },
  {
    id: 3,
    section_name: 'C',
    is_active: 'yes',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: null,
  },
  {
    id: 4,
    section_name: 'D',
    is_active: 'no',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: null,
  },
];
let nextMockId = 5;

const USE_MOCK = true; // TODO: Set to false when backend sections API is deployed

function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function mockList(): Section[] {
  return [...mockSections].sort((a, b) => a.section_name.localeCompare(b.section_name));
}

export const sectionsService = {
  list: async (): Promise<Section[]> => {
    if (USE_MOCK) {
      return delay(mockList());
    }
    // TODO: Wire when backend exposes GET /api/v1/academics/sections/
    const { data } = await apiClient.get<ApiSuccessResponse<Section[]>>(
      API_ENDPOINTS.academics.sections,
    );
    return data.data;
  },

  create: async (payload: CreateSectionPayload): Promise<Section> => {
    if (USE_MOCK) {
      const name = payload.section_name.trim();
      if (mockSections.some((s) => s.section_name.toLowerCase() === name.toLowerCase())) {
        throw new Error('A section with this name already exists');
      }
      const created: Section = {
        id: nextMockId++,
        section_name: name,
        is_active: payload.is_active,
        created_at: new Date().toISOString(),
        updated_at: null,
      };
      mockSections = [...mockSections, created];
      return delay(created);
    }
    // TODO: Wire when backend exposes POST /api/v1/academics/sections/
    const { data } = await apiClient.post<ApiSuccessResponse<Section>>(
      API_ENDPOINTS.academics.sections,
      payload,
    );
    return data.data;
  },

  update: async (id: number, payload: UpdateSectionPayload): Promise<Section> => {
    if (USE_MOCK) {
      const index = mockSections.findIndex((s) => s.id === id);
      if (index === -1) throw new Error('Section not found');
      const name = payload.section_name.trim();
      const duplicate = mockSections.some(
        (s) => s.id !== id && s.section_name.toLowerCase() === name.toLowerCase(),
      );
      if (duplicate) {
        throw new Error('A section with this name already exists');
      }
      const updated: Section = {
        ...mockSections[index],
        section_name: name,
        is_active: payload.is_active,
        updated_at: new Date().toISOString().slice(0, 10),
      };
      mockSections = mockSections.map((s) => (s.id === id ? updated : s));
      return delay(updated);
    }
    // TODO: Wire when backend exposes PATCH /api/v1/academics/sections/{id}/
    const { data } = await apiClient.patch<ApiSuccessResponse<Section>>(
      API_ENDPOINTS.academics.sectionDetail(id),
      payload,
    );
    return data.data;
  },

  delete: async (id: number): Promise<void> => {
    if (USE_MOCK) {
      const target = mockSections.find((s) => s.id === id);
      if (!target) throw new Error('Section not found');
      if (target.is_active === 'yes') {
        throw new Error('Cannot delete an active section. Deactivate it first.');
      }
      mockSections = mockSections.filter((s) => s.id !== id);
      return delay(undefined);
    }
    // TODO: Wire when backend exposes DELETE /api/v1/academics/sections/{id}/
    await apiClient.delete(API_ENDPOINTS.academics.sectionDetail(id));
  },
};
