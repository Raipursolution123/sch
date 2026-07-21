export interface ItemCategory {
  id: number;
  item_category: string;
  is_active: string;
  description: string;
  created_at: string;
  updated_at: string | null;
}

export interface ItemStore {
  id: number;
  item_store: string;
  code: string;
  description: string;
  created_at: string;
}

export interface ItemSupplier {
  id: number;
  item_supplier: string;
  phone: string;
  email: string;
  address: string;
  contact_person_name: string;
  contact_person_phone: string;
  contact_person_email: string;
  description: string;
}

export interface InventoryItem {
  id: number;
  item_category_id: number | null;
  item_store_id: number | null;
  item_supplier_id: number | null;
  name: string;
  unit: string;
  item_photo: string | null;
  description: string;
  quantity: number;
  date: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface ItemStock {
  id: number;
  item_id: number | null;
  supplier_id: number | null;
  store_id: number | null;
  symbol: string;
  quantity: number | null;
  purchase_price: number;
  date: string;
  attachment: string | null;
  description: string;
  is_active: string | null;
  created_at: string;
}

export interface ItemIssue {
  id: number;
  issue_type: string | null;
  issue_to: number;
  issue_by: number | null;
  issue_date: string | null;
  return_date: string | null;
  item_category_id: number | null;
  item_id: number | null;
  quantity: number;
  issue_category: string;
  note: string;
  is_returned: number;
  created_at: string;
  is_active: string | null;
}

export type CreateItemCategoryPayload = {
  item_category: string;
  description?: string;
  is_active?: string;
};
export type UpdateItemCategoryPayload = Partial<CreateItemCategoryPayload>;

export type CreateItemStorePayload = {
  item_store: string;
  code: string;
  description?: string;
};
export type UpdateItemStorePayload = Partial<CreateItemStorePayload>;

export type CreateItemSupplierPayload = {
  item_supplier: string;
  phone?: string;
  email?: string;
  address?: string;
  contact_person_name?: string;
  contact_person_phone?: string;
  contact_person_email?: string;
  description?: string;
};
export type UpdateItemSupplierPayload = Partial<CreateItemSupplierPayload>;

export type CreateInventoryItemPayload = {
  name: string;
  unit: string;
  item_category_id?: number | null;
  item_store_id?: number | null;
  item_supplier_id?: number | null;
  description?: string;
  quantity?: number;
  date?: string | null;
};
export type UpdateInventoryItemPayload = Partial<CreateInventoryItemPayload>;

export type CreateItemStockPayload = {
  item_id: number;
  supplier_id?: number | null;
  store_id?: number | null;
  symbol?: string;
  quantity: number;
  purchase_price?: number;
  date?: string;
  description?: string;
};

export type CreateItemIssuePayload = {
  item_id: number;
  issue_to: number;
  quantity: number;
  issue_type?: string;
  issue_date?: string;
  issue_category?: string;
  note?: string;
  item_category_id?: number | null;
};
