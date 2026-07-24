import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { z } from 'zod';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import {
  FormNumberField,
  FormSelectField,
  FormTextField,
  FormTextareaField,
} from '@components/forms/fields';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { PermissionButton } from '@components/rbac/PermissionButton';
import {
  useCreateInventoryItem,
  useDeleteInventoryItem,
  useInventoryItems,
  useItemCategories,
  useItemStores,
  useItemSuppliers,
  useUpdateInventoryItem,
} from '@hooks/useInventory';
import type { InventoryItem } from '@app-types/inventory';
import { ModuleListPack } from '@workflow-packs';

const schema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  unit: z.string().trim().min(1, 'Unit is required'),
  quantity: z.number().min(0),
  item_category_id: z.string().optional(),
  item_store_id: z.string().optional(),
  item_supplier_id: z.string().optional(),
  description: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

const columns: DataTableColumn<InventoryItem>[] = [
  { id: 'name', header: 'Item', cellClassName: 'font-medium', cell: (r) => r.name },
  { id: 'unit', header: 'Unit', cell: (r) => r.unit },
  {
    id: 'qty',
    header: 'Qty',
    cellClassName: 'tabular-nums',
    cell: (r) => r.quantity,
  },
  { id: 'description', header: 'Description', cell: (r) => r.description || '—' },
];

export function InventoryItemsPage() {
  const { data = [], isLoading, isError, error, refetch } = useInventoryItems();
  const { data: categories = [] } = useItemCategories();
  const { data: stores = [] } = useItemStores();
  const { data: suppliers = [] } = useItemSuppliers();
  const createMutation = useCreateInventoryItem();
  const updateMutation = useUpdateInventoryItem();
  const deleteMutation = useDeleteInventoryItem();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<InventoryItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<InventoryItem | null>(null);
  const { control, handleSubmit, reset, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      unit: '',
      quantity: 0,
      item_category_id: '',
      item_store_id: '',
      item_supplier_id: '',
      description: '',
    },
  });

  useEffect(() => {
    if (!open) return;
    reset(
      selected
        ? {
            name: selected.name,
            unit: selected.unit,
            quantity: selected.quantity,
            item_category_id: selected.item_category_id ? String(selected.item_category_id) : '',
            item_store_id: selected.item_store_id ? String(selected.item_store_id) : '',
            item_supplier_id: selected.item_supplier_id ? String(selected.item_supplier_id) : '',
            description: selected.description || '',
          }
        : {
            name: '',
            unit: '',
            quantity: 0,
            item_category_id: '',
            item_store_id: '',
            item_supplier_id: '',
            description: '',
          },
    );
  }, [open, selected, reset]);

  const categoryOptions = useMemo(
    () => [
      { value: '', label: 'None' },
      ...categories.map((c) => ({ value: String(c.id), label: c.item_category })),
    ],
    [categories],
  );
  const storeOptions = useMemo(
    () => [
      { value: '', label: 'None' },
      ...stores.map((s) => ({ value: String(s.id), label: s.item_store })),
    ],
    [stores],
  );
  const supplierOptions = useMemo(
    () => [
      { value: '', label: 'None' },
      ...suppliers.map((s) => ({ value: String(s.id), label: s.item_supplier })),
    ],
    [suppliers],
  );

  const addAction = (
    <PermissionButton
      permission="inventory.item.create"
      onClick={() => {
        setSelected(null);
        setOpen(true);
      }}
      className="gap-1"
    >
      <Plus className="h-4 w-4" />
      Add Item
    </PermissionButton>
  );

  return (
    <ModuleListPack
      title="Items"
      description="Inventory catalog with on-hand quantity."
      actions={addAction}
      isLoading={isLoading}
      loadingMessage="Loading items..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && data.length === 0}
      emptyTitle="No items yet"
      emptyDescription="Create categories/stores first, then add items."
      emptyAction={addAction}
    >
      <DataTable
        data={data}
        columns={columns}
        getRowKey={(r) => r.id}
        actions={(row) => (
          <>
            <PermissionButton
              permission="inventory.item.edit"
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelected(row);
                setOpen(true);
              }}
            >
              <Pencil className="h-4 w-4" />
            </PermissionButton>
            <PermissionButton
              permission="inventory.item.delete"
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => setDeleteTarget(row)}
            >
              <Trash2 className="h-4 w-4" />
            </PermissionButton>
          </>
        )}
      />
      <EntityFormDialog
        open={open}
        onOpenChange={setOpen}
        title={selected ? 'Edit Item' : 'Add Item'}
        onSubmit={handleSubmit((values) => {
          const payload = {
            name: values.name,
            unit: values.unit,
            quantity: values.quantity,
            item_category_id: values.item_category_id ? Number(values.item_category_id) : null,
            item_store_id: values.item_store_id ? Number(values.item_store_id) : null,
            item_supplier_id: values.item_supplier_id ? Number(values.item_supplier_id) : null,
            description: values.description?.trim() || '',
          };
          if (selected) {
            updateMutation.mutate(
              { id: selected.id, payload },
              { onSuccess: () => setOpen(false) },
            );
            return;
          }
          createMutation.mutate(payload, { onSuccess: () => setOpen(false) });
        })}
        isLoading={createMutation.isPending || updateMutation.isPending}
      >
        <FormErrorSummary errors={formState.errors} />
        <FormTextField control={control} name="name" label="Name" required />
        <FormTextField control={control} name="unit" label="Unit" required />
        <FormNumberField control={control} name="quantity" label="Quantity" required />
        <FormSelectField
          control={control}
          name="item_category_id"
          label="Category"
          options={categoryOptions}
        />
        <FormSelectField
          control={control}
          name="item_store_id"
          label="Store"
          options={storeOptions}
        />
        <FormSelectField
          control={control}
          name="item_supplier_id"
          label="Supplier"
          options={supplierOptions}
        />
        <FormTextareaField control={control} name="description" label="Description" />
      </EntityFormDialog>
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete item?"
        description={`Remove “${deleteTarget?.name ?? ''}”.`}
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteMutation.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
        }}
        isLoading={deleteMutation.isPending}
      />
    </ModuleListPack>
  );
}
