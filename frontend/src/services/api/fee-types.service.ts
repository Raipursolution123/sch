import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type {
  CreateFeeTypePayload,
  FeeCategory,
  FeeType,
  UpdateFeeTypePayload,
} from '@app-types/fees/fee-type';
import { FEE_CATEGORIES } from '@features/fees/constants/categories';

interface FeeTypeRecord {
  id: number;
  code: string;
  name: string;
  feecategory_id: number | null;
  description: string | null;
  is_active: FeeType['is_active'];
  created_at: string;
  updated_at: string | null;
}

// TODO: Remove mock store when GET /api/v1/fees/fee-types/ is available
let mockFeeTypes: FeeTypeRecord[] = [
  {
    id: 1,
    code: 'TUITION',
    name: 'Tuition Fee',
    feecategory_id: 1,
    description: 'Annual tuition charges',
    is_active: 'yes',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: null,
  },
  {
    id: 2,
    code: 'TRANSPORT',
    name: 'Transport Fee',
    feecategory_id: 2,
    description: 'School bus service',
    is_active: 'yes',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: null,
  },
  {
    id: 3,
    code: 'HOSTEL',
    name: 'Hostel Fee',
    feecategory_id: 3,
    description: 'Boarding and lodging',
    is_active: 'yes',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: null,
  },
  {
    id: 4,
    code: 'EXAM',
    name: 'Examination Fee',
    feecategory_id: 4,
    description: 'Term examination charges',
    is_active: 'yes',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: null,
  },
  {
    id: 5,
    code: 'LIBRARY',
    name: 'Library Fee',
    feecategory_id: 4,
    description: 'Library membership and books',
    is_active: 'no',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: null,
  },
];
let nextMockId = 6;

const USE_MOCK = true;

function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function getCategoryName(id: number | null): string | null {
  if (id == null) return null;
  return FEE_CATEGORIES.find((c) => c.id === id)?.name ?? null;
}

function toFeeType(record: FeeTypeRecord): FeeType {
  return {
    ...record,
    category_name: getCategoryName(record.feecategory_id),
  };
}

function mockList(): FeeType[] {
  return [...mockFeeTypes].map(toFeeType).sort((a, b) => a.name.localeCompare(b.name));
}

function normalizeCode(value: string): string {
  return value.trim().toUpperCase();
}

export const feeTypesService = {
  listCategories: async (): Promise<FeeCategory[]> => {
    if (USE_MOCK) return delay([...FEE_CATEGORIES]);
    // TODO: Wire when backend exposes GET /api/v1/fees/categories/
    const { data } = await apiClient.get<ApiSuccessResponse<FeeCategory[]>>(
      API_ENDPOINTS.fees.categories,
    );
    return data.data;
  },

  list: async (): Promise<FeeType[]> => {
    if (USE_MOCK) return delay(mockList());
    // TODO: Wire when backend exposes GET /api/v1/fees/fee-types/
    const { data } = await apiClient.get<ApiSuccessResponse<FeeType[]>>(
      API_ENDPOINTS.fees.feeTypes,
    );
    return data.data;
  },

  create: async (payload: CreateFeeTypePayload): Promise<FeeType> => {
    if (USE_MOCK) {
      const code = normalizeCode(payload.code);
      if (mockFeeTypes.some((f) => normalizeCode(f.code) === code)) {
        throw new Error('A fee type with this code already exists');
      }
      const created: FeeTypeRecord = {
        id: nextMockId++,
        code: payload.code.trim(),
        name: payload.name.trim(),
        feecategory_id: payload.feecategory_id,
        description: payload.description?.trim() || null,
        is_active: payload.is_active,
        created_at: new Date().toISOString(),
        updated_at: null,
      };
      mockFeeTypes = [...mockFeeTypes, created];
      return delay(toFeeType(created));
    }
    // TODO: Wire when backend exposes POST /api/v1/fees/fee-types/
    const { data } = await apiClient.post<ApiSuccessResponse<FeeType>>(
      API_ENDPOINTS.fees.feeTypes,
      payload,
    );
    return data.data;
  },

  update: async (id: number, payload: UpdateFeeTypePayload): Promise<FeeType> => {
    if (USE_MOCK) {
      const index = mockFeeTypes.findIndex((f) => f.id === id);
      if (index === -1) throw new Error('Fee type not found');
      const code = normalizeCode(payload.code);
      if (mockFeeTypes.some((f) => f.id !== id && normalizeCode(f.code) === code)) {
        throw new Error('A fee type with this code already exists');
      }
      const updated: FeeTypeRecord = {
        ...mockFeeTypes[index],
        code: payload.code.trim(),
        name: payload.name.trim(),
        feecategory_id: payload.feecategory_id,
        description: payload.description?.trim() || null,
        is_active: payload.is_active,
        updated_at: new Date().toISOString(),
      };
      mockFeeTypes = mockFeeTypes.map((f) => (f.id === id ? updated : f));
      return delay(toFeeType(updated));
    }
    // TODO: Wire when backend exposes PATCH /api/v1/fees/fee-types/{id}/
    const { data } = await apiClient.patch<ApiSuccessResponse<FeeType>>(
      API_ENDPOINTS.fees.feeTypeDetail(id),
      payload,
    );
    return data.data;
  },

  delete: async (id: number): Promise<void> => {
    if (USE_MOCK) {
      const record = mockFeeTypes.find((f) => f.id === id);
      if (!record) throw new Error('Fee type not found');
      if (record.is_active === 'yes') {
        throw new Error('Deactivate the fee type before deleting');
      }
      mockFeeTypes = mockFeeTypes.filter((f) => f.id !== id);
      return delay(undefined);
    }
    // TODO: Wire when backend exposes DELETE /api/v1/fees/fee-types/{id}/
    await apiClient.delete(API_ENDPOINTS.fees.feeTypeDetail(id));
  },
};
