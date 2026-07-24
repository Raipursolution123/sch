import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2 } from 'lucide-react';
import { z } from 'zod';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import {
  FormDateField,
  FormNumberField,
  FormSelectField,
  FormTextareaField,
} from '@components/forms/fields';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { PermissionButton } from '@components/rbac/PermissionButton';
import {
  useCreateItemStock,
  useDeleteItemStock,
  useInventoryItems,
  useItemStock,
  useItemStores,
  useItemSuppliers,
} from '@hooks/useInventory';
import type { ItemStock } from '@app-types/inventory';
import { formatDate } from '@utils/format';
import { ModuleListPack } from '@workflow-packs';

const schema = z.object({
  item_id: z.string().min(1, 'Item is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  purchase_price: z.number().min(0),
  store_id: z.string().optional(),
  supplier_id: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  description: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

const today = new Date().toISOString().slice(0, 10);

export function ItemStockPage() {
  const { data = [], isLoading, isError, error, refetch } = useItemStock();
  const { data: items = [] } = useInventoryItems();
  const { data: stores = [] } = useItemStores();
  const { data: suppliers = [] } = useItemSuppliers();
  const createMutation = useCreateItemStock();
  const deleteMutation = useDeleteItemStock();
  const [open, setOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ItemStock | null>(null);
  const { control, handleSubmit, reset, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      item_id: '',
      quantity: 1,
      purchase_price: 0,
      store_id: '',
      supplier_id: '',
      date: today,
      description: '',
    },
  });

  useEffect(() => {
    if (!open) return;
    reset({
      item_id: '',
      quantity: 1,
      purchase_price: 0,
      store_id: '',
      supplier_id: '',
      date: today,
      description: '',
    });
  }, [open, reset]);

  const itemName = useMemo(() => {
    const map = new Map(items.map((i) => [i.id, i.name]));
    return (id: number | null) => (id ? map.get(id) || `#${id}` : '—');
  }, [items]);

  const columns: DataTableColumn<ItemStock>[] = [
    {
      id: 'item',
      header: 'Item',
      cellClassName: 'font-medium',
      cell: (r) => itemName(r.item_id),
    },
    { id: 'symbol', header: 'Type', cell: (r) => r.symbol },
    {
      id: 'qty',
      header: 'Qty',
      cellClassName: 'tabular-nums',
      cell: (r) => r.quantity ?? '—',
    },
    {
      id: 'price',
      header: 'Price',
      cellClassName: 'tabular-nums',
      cell: (r) => r.purchase_price,
    },
    { id: 'date', header: 'Date', cell: (r) => formatDate(r.date) },
  ];

  const addAction = (
    <PermissionButton
      permission="inventory.stock.create"
      onClick={() => setOpen(true)}
      className="gap-1"
    >
      <Plus className="h-4 w-4" />
      Add Stock
    </PermissionButton>
  );

  return (
    <ModuleListPack
      title="Add Item Stock"
      description="Record stock-in (+) movements and update on-hand quantity."
      actions={addAction}
      isLoading={isLoading}
      loadingMessage="Loading stock..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && data.length === 0}
      emptyTitle="No stock entries"
      emptyDescription="Add stock to increase item quantity."
      emptyAction={addAction}
    >
      <DataTable
        data={data}
        columns={columns}
        getRowKey={(r) => r.id}
        actions={(row) => (
          <PermissionButton
            permission="inventory.stock.delete"
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => setDeleteTarget(row)}
          >
            <Trash2 className="h-4 w-4" />
          </PermissionButton>
        )}
      />
      <EntityFormDialog
        open={open}
        onOpenChange={setOpen}
        title="Add Stock"
        onSubmit={handleSubmit((values) => {
          createMutation.mutate(
            {
              item_id: Number(values.item_id),
              quantity: values.quantity,
              purchase_price: values.purchase_price,
              symbol: '+',
              store_id: values.store_id ? Number(values.store_id) : null,
              supplier_id: values.supplier_id ? Number(values.supplier_id) : null,
              date: values.date,
              description: values.description?.trim() || '',
            },
            { onSuccess: () => setOpen(false) },
          );
        })}
        isLoading={createMutation.isPending}
      >
        <FormErrorSummary errors={formState.errors} />
        <FormSelectField
          control={control}
          name="item_id"
          label="Item"
          required
          options={items.map((i) => ({
            value: String(i.id),
            label: `${i.name} (qty ${i.quantity})`,
          }))}
          placeholder="Select item"
        />
        <FormNumberField control={control} name="quantity" label="Quantity" required />
        <FormNumberField control={control} name="purchase_price" label="Purchase price" />
        <FormSelectField
          control={control}
          name="store_id"
          label="Store"
          options={[
            { value: '', label: 'None' },
            ...stores.map((s) => ({ value: String(s.id), label: s.item_store })),
          ]}
        />
        <FormSelectField
          control={control}
          name="supplier_id"
          label="Supplier"
          options={[
            { value: '', label: 'None' },
            ...suppliers.map((s) => ({ value: String(s.id), label: s.item_supplier })),
          ]}
        />
        <FormDateField control={control} name="date" label="Date" required />
        <FormTextareaField control={control} name="description" label="Description" />
      </EntityFormDialog>
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete stock entry?"
        description="This reverses the quantity change on the linked item."
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
