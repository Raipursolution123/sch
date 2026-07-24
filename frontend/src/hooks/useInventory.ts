import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@constants/query-keys';
import { inventoryService } from '@services/api/inventory.service';
import type {
  CreateInventoryItemPayload,
  CreateItemCategoryPayload,
  CreateItemIssuePayload,
  CreateItemStockPayload,
  CreateItemStorePayload,
  CreateItemSupplierPayload,
  UpdateInventoryItemPayload,
  UpdateItemCategoryPayload,
  UpdateItemStorePayload,
  UpdateItemSupplierPayload,
} from '@app-types/inventory';
import { getApiErrorMessage } from '@utils/session';

function invalidateAll(qc: ReturnType<typeof useQueryClient>) {
  void qc.invalidateQueries({ queryKey: queryKeys.inventory.all });
}

export function useItemCategories(query = '') {
  return useQuery({
    queryKey: queryKeys.inventory.categories.list(query),
    queryFn: () => inventoryService.listCategories(query || undefined),
  });
}

export function useCreateItemCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateItemCategoryPayload) => inventoryService.createCategory(payload),
    onSuccess: () => {
      invalidateAll(qc);
      toast.success('Category created');
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Failed to create category')),
  });
}

export function useUpdateItemCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateItemCategoryPayload }) =>
      inventoryService.updateCategory(id, payload),
    onSuccess: () => {
      invalidateAll(qc);
      toast.success('Category updated');
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Failed to update category')),
  });
}

export function useDeleteItemCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => inventoryService.deleteCategory(id),
    onSuccess: () => {
      invalidateAll(qc);
      toast.success('Category deleted');
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Failed to delete category')),
  });
}

export function useItemStores(query = '') {
  return useQuery({
    queryKey: queryKeys.inventory.stores.list(query),
    queryFn: () => inventoryService.listStores(query || undefined),
  });
}

export function useCreateItemStore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateItemStorePayload) => inventoryService.createStore(payload),
    onSuccess: () => {
      invalidateAll(qc);
      toast.success('Store created');
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Failed to create store')),
  });
}

export function useUpdateItemStore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateItemStorePayload }) =>
      inventoryService.updateStore(id, payload),
    onSuccess: () => {
      invalidateAll(qc);
      toast.success('Store updated');
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Failed to update store')),
  });
}

export function useDeleteItemStore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => inventoryService.deleteStore(id),
    onSuccess: () => {
      invalidateAll(qc);
      toast.success('Store deleted');
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Failed to delete store')),
  });
}

export function useItemSuppliers(query = '') {
  return useQuery({
    queryKey: queryKeys.inventory.suppliers.list(query),
    queryFn: () => inventoryService.listSuppliers(query || undefined),
  });
}

export function useCreateItemSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateItemSupplierPayload) => inventoryService.createSupplier(payload),
    onSuccess: () => {
      invalidateAll(qc);
      toast.success('Supplier created');
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Failed to create supplier')),
  });
}

export function useUpdateItemSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateItemSupplierPayload }) =>
      inventoryService.updateSupplier(id, payload),
    onSuccess: () => {
      invalidateAll(qc);
      toast.success('Supplier updated');
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Failed to update supplier')),
  });
}

export function useDeleteItemSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => inventoryService.deleteSupplier(id),
    onSuccess: () => {
      invalidateAll(qc);
      toast.success('Supplier deleted');
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Failed to delete supplier')),
  });
}

export function useInventoryItems(query = '') {
  return useQuery({
    queryKey: queryKeys.inventory.items.list(query),
    queryFn: () => inventoryService.listItems(query || undefined),
  });
}

export function useCreateInventoryItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateInventoryItemPayload) => inventoryService.createItem(payload),
    onSuccess: () => {
      invalidateAll(qc);
      toast.success('Item created');
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Failed to create item')),
  });
}

export function useUpdateInventoryItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateInventoryItemPayload }) =>
      inventoryService.updateItem(id, payload),
    onSuccess: () => {
      invalidateAll(qc);
      toast.success('Item updated');
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Failed to update item')),
  });
}

export function useDeleteInventoryItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => inventoryService.deleteItem(id),
    onSuccess: () => {
      invalidateAll(qc);
      toast.success('Item deleted');
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Failed to delete item')),
  });
}

export function useItemStock(query = '') {
  return useQuery({
    queryKey: queryKeys.inventory.stock.list(query),
    queryFn: () => inventoryService.listStock(query || undefined),
  });
}

export function useCreateItemStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateItemStockPayload) => inventoryService.createStock(payload),
    onSuccess: () => {
      invalidateAll(qc);
      toast.success('Stock added');
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Failed to add stock')),
  });
}

export function useDeleteItemStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => inventoryService.deleteStock(id),
    onSuccess: () => {
      invalidateAll(qc);
      toast.success('Stock entry deleted');
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Failed to delete stock')),
  });
}

export function useItemIssues(status = 'open', query = '') {
  return useQuery({
    queryKey: queryKeys.inventory.issues.list(status, query),
    queryFn: () => inventoryService.listIssues(status, query || undefined),
  });
}

export function useIssueInventoryItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateItemIssuePayload) => inventoryService.issueItem(payload),
    onSuccess: () => {
      invalidateAll(qc);
      toast.success('Item issued');
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Failed to issue item')),
  });
}

export function useReturnInventoryIssue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => inventoryService.returnIssue(id),
    onSuccess: () => {
      invalidateAll(qc);
      toast.success('Item returned');
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Failed to return item')),
  });
}
