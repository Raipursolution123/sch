import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type {
  CreateInventoryItemPayload,
  CreateItemCategoryPayload,
  CreateItemIssuePayload,
  CreateItemStockPayload,
  CreateItemStorePayload,
  CreateItemSupplierPayload,
  InventoryItem,
  ItemCategory,
  ItemIssue,
  ItemStock,
  ItemStore,
  ItemSupplier,
  UpdateInventoryItemPayload,
  UpdateItemCategoryPayload,
  UpdateItemStorePayload,
  UpdateItemSupplierPayload,
} from '@app-types/inventory';
import { type BackendPayload, extractList } from '@utils/api-response';

const listParams = (query?: string) => ({
  page_size: 100,
  ...(query ? { q: query } : {}),
});

export const inventoryService = {
  listCategories: async (query?: string) => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.inventory.categories, {
      params: listParams(query),
    });
    return extractList<ItemCategory>(data);
  },
  createCategory: async (payload: CreateItemCategoryPayload) => {
    const { data } = await apiClient.post<ApiSuccessResponse<ItemCategory>>(
      API_ENDPOINTS.inventory.categories,
      payload,
    );
    return data.data;
  },
  updateCategory: async (id: number, payload: UpdateItemCategoryPayload) => {
    const { data } = await apiClient.patch<ApiSuccessResponse<ItemCategory>>(
      API_ENDPOINTS.inventory.categoryDetail(id),
      payload,
    );
    return data.data;
  },
  deleteCategory: async (id: number) => {
    await apiClient.delete(API_ENDPOINTS.inventory.categoryDetail(id));
  },

  listStores: async (query?: string) => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.inventory.stores, {
      params: listParams(query),
    });
    return extractList<ItemStore>(data);
  },
  createStore: async (payload: CreateItemStorePayload) => {
    const { data } = await apiClient.post<ApiSuccessResponse<ItemStore>>(
      API_ENDPOINTS.inventory.stores,
      payload,
    );
    return data.data;
  },
  updateStore: async (id: number, payload: UpdateItemStorePayload) => {
    const { data } = await apiClient.patch<ApiSuccessResponse<ItemStore>>(
      API_ENDPOINTS.inventory.storeDetail(id),
      payload,
    );
    return data.data;
  },
  deleteStore: async (id: number) => {
    await apiClient.delete(API_ENDPOINTS.inventory.storeDetail(id));
  },

  listSuppliers: async (query?: string) => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.inventory.suppliers, {
      params: listParams(query),
    });
    return extractList<ItemSupplier>(data);
  },
  createSupplier: async (payload: CreateItemSupplierPayload) => {
    const { data } = await apiClient.post<ApiSuccessResponse<ItemSupplier>>(
      API_ENDPOINTS.inventory.suppliers,
      payload,
    );
    return data.data;
  },
  updateSupplier: async (id: number, payload: UpdateItemSupplierPayload) => {
    const { data } = await apiClient.patch<ApiSuccessResponse<ItemSupplier>>(
      API_ENDPOINTS.inventory.supplierDetail(id),
      payload,
    );
    return data.data;
  },
  deleteSupplier: async (id: number) => {
    await apiClient.delete(API_ENDPOINTS.inventory.supplierDetail(id));
  },

  listItems: async (query?: string) => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.inventory.items, {
      params: listParams(query),
    });
    return extractList<InventoryItem>(data);
  },
  createItem: async (payload: CreateInventoryItemPayload) => {
    const { data } = await apiClient.post<ApiSuccessResponse<InventoryItem>>(
      API_ENDPOINTS.inventory.items,
      payload,
    );
    return data.data;
  },
  updateItem: async (id: number, payload: UpdateInventoryItemPayload) => {
    const { data } = await apiClient.patch<ApiSuccessResponse<InventoryItem>>(
      API_ENDPOINTS.inventory.itemDetail(id),
      payload,
    );
    return data.data;
  },
  deleteItem: async (id: number) => {
    await apiClient.delete(API_ENDPOINTS.inventory.itemDetail(id));
  },

  listStock: async (query?: string) => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.inventory.stock, {
      params: listParams(query),
    });
    return extractList<ItemStock>(data);
  },
  createStock: async (payload: CreateItemStockPayload) => {
    const { data } = await apiClient.post<ApiSuccessResponse<ItemStock>>(
      API_ENDPOINTS.inventory.stock,
      payload,
    );
    return data.data;
  },
  deleteStock: async (id: number) => {
    await apiClient.delete(API_ENDPOINTS.inventory.stockDetail(id));
  },

  listIssues: async (status = 'open', query?: string) => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.inventory.issues, {
      params: { status, ...listParams(query) },
    });
    return extractList<ItemIssue>(data);
  },
  issueItem: async (payload: CreateItemIssuePayload) => {
    const { data } = await apiClient.post<ApiSuccessResponse<ItemIssue>>(
      API_ENDPOINTS.inventory.issues,
      payload,
    );
    return data.data;
  },
  returnIssue: async (id: number) => {
    const { data } = await apiClient.post<ApiSuccessResponse<ItemIssue>>(
      API_ENDPOINTS.inventory.issueReturn(id),
      {},
    );
    return data.data;
  },
};
