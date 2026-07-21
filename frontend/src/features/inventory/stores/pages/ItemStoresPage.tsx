import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { z } from 'zod';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormTextField, FormTextareaField } from '@components/forms/fields';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { PermissionButton } from '@components/rbac/PermissionButton';
import {
  useCreateItemStore,
  useDeleteItemStore,
  useItemStores,
  useUpdateItemStore,
} from '@hooks/useInventory';
import type { ItemStore } from '@app-types/inventory';
import { ModuleListPack } from '@workflow-packs';

const schema = z.object({
  item_store: z.string().trim().min(1, 'Name is required'),
  code: z.string().trim().min(1, 'Code is required'),
  description: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

const columns: DataTableColumn<ItemStore>[] = [
  { id: 'name', header: 'Store', cellClassName: 'font-medium', cell: (r) => r.item_store },
  { id: 'code', header: 'Code', cell: (r) => r.code },
  { id: 'description', header: 'Description', cell: (r) => r.description || '—' },
];

export function ItemStoresPage() {
  const { data = [], isLoading, isError, error, refetch } = useItemStores();
  const createMutation = useCreateItemStore();
  const updateMutation = useUpdateItemStore();
  const deleteMutation = useDeleteItemStore();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<ItemStore | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ItemStore | null>(null);
  const { control, handleSubmit, reset, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { item_store: '', code: '', description: '' },
  });

  useEffect(() => {
    if (!open) return;
    reset(
      selected
        ? {
            item_store: selected.item_store,
            code: selected.code,
            description: selected.description || '',
          }
        : { item_store: '', code: '', description: '' },
    );
  }, [open, selected, reset]);

  const addAction = (
    <PermissionButton
      permission="inventory.store.create"
      onClick={() => {
        setSelected(null);
        setOpen(true);
      }}
      className="gap-1"
    >
      <Plus className="h-4 w-4" />
      Add Store
    </PermissionButton>
  );

  return (
    <ModuleListPack
      title="Item Stores"
      description="Physical locations where inventory is kept."
      actions={addAction}
      isLoading={isLoading}
      loadingMessage="Loading stores..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && data.length === 0}
      emptyTitle="No stores yet"
      emptyDescription="Add a store to assign items and stock."
      emptyAction={addAction}
    >
      <DataTable
        data={data}
        columns={columns}
        getRowKey={(r) => r.id}
        actions={(row) => (
          <>
            <PermissionButton
              permission="inventory.store.edit"
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
              permission="inventory.store.delete"
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
        title={selected ? 'Edit Store' : 'Add Store'}
        onSubmit={handleSubmit((values) => {
          const payload = {
            item_store: values.item_store,
            code: values.code,
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
        <FormTextField control={control} name="item_store" label="Name" required />
        <FormTextField control={control} name="code" label="Code" required />
        <FormTextareaField control={control} name="description" label="Description" />
      </EntityFormDialog>
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete store?"
        description={`Remove “${deleteTarget?.item_store ?? ''}”.`}
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
