import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type {
  CreateFeeGroupPayload,
  FeeGroup,
  UpdateFeeGroupPayload,
} from '@app-types/fees/fee-group';

interface FeeGroupRecord {
  id: number;
  name: string;
  description: string | null;
  is_active: FeeGroup['is_active'];
  created_at: string;
  updated_at: string | null;
}

// TODO: Remove mock store when GET /api/v1/fees/fee-groups/ is available
let mockFeeGroups: FeeGroupRecord[] = [
  {
    id: 1,
    name: 'Standard Package',
    description: 'Tuition, exam, and library fees for regular students',
    is_active: 'yes',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: null,
  },
  {
    id: 2,
    name: 'Transport Package',
    description: 'Transport fee bundle',
    is_active: 'yes',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: null,
  },
  {
    id: 3,
    name: 'Hostel Package',
    description: 'Hostel and related charges',
    is_active: 'yes',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: null,
  },
];
let nextMockId = 4;

const USE_MOCK = true;

function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function mockList(): FeeGroup[] {
  return [...mockFeeGroups].sort((a, b) => a.name.localeCompare(b.name));
}

export const feeGroupsService = {
  list: async (): Promise<FeeGroup[]> => {
    if (USE_MOCK) return delay(mockList());
    // TODO: Wire when backend exposes GET /api/v1/fees/fee-groups/
    const { data } = await apiClient.get<ApiSuccessResponse<FeeGroup[]>>(
      API_ENDPOINTS.fees.feeGroups,
    );
    return data.data;
  },

  create: async (payload: CreateFeeGroupPayload): Promise<FeeGroup> => {
    if (USE_MOCK) {
      const name = payload.name.trim();
      if (mockFeeGroups.some((g) => g.name.toLowerCase() === name.toLowerCase())) {
        throw new Error('A fee group with this name already exists');
      }
      const created: FeeGroupRecord = {
        id: nextMockId++,
        name,
        description: payload.description?.trim() || null,
        is_active: payload.is_active,
        created_at: new Date().toISOString(),
        updated_at: null,
      };
      mockFeeGroups = [...mockFeeGroups, created];
      return delay(created);
    }
    // TODO: Wire when backend exposes POST /api/v1/fees/fee-groups/
    const { data } = await apiClient.post<ApiSuccessResponse<FeeGroup>>(
      API_ENDPOINTS.fees.feeGroups,
      payload,
    );
    return data.data;
  },

  update: async (id: number, payload: UpdateFeeGroupPayload): Promise<FeeGroup> => {
    if (USE_MOCK) {
      const index = mockFeeGroups.findIndex((g) => g.id === id);
      if (index === -1) throw new Error('Fee group not found');
      const name = payload.name.trim();
      if (mockFeeGroups.some((g) => g.id !== id && g.name.toLowerCase() === name.toLowerCase())) {
        throw new Error('A fee group with this name already exists');
      }
      const updated: FeeGroupRecord = {
        ...mockFeeGroups[index],
        name,
        description: payload.description?.trim() || null,
        is_active: payload.is_active,
        updated_at: new Date().toISOString(),
      };
      mockFeeGroups = mockFeeGroups.map((g) => (g.id === id ? updated : g));
      return delay(updated);
    }
    // TODO: Wire when backend exposes PATCH /api/v1/fees/fee-groups/{id}/
    const { data } = await apiClient.patch<ApiSuccessResponse<FeeGroup>>(
      API_ENDPOINTS.fees.feeGroupDetail(id),
      payload,
    );
    return data.data;
  },

  delete: async (id: number): Promise<void> => {
    if (USE_MOCK) {
      const record = mockFeeGroups.find((g) => g.id === id);
      if (!record) throw new Error('Fee group not found');
      if (record.is_active === 'yes') {
        throw new Error('Deactivate the fee group before deleting');
      }
      mockFeeGroups = mockFeeGroups.filter((g) => g.id !== id);
      return delay(undefined);
    }
    // TODO: Wire when backend exposes DELETE /api/v1/fees/fee-groups/{id}/
    await apiClient.delete(API_ENDPOINTS.fees.feeGroupDetail(id));
  },
};
