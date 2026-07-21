import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { z } from 'zod';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormTextField, FormTextareaField } from '@components/forms/fields';
import { StatusBadge } from '@components/feedback/StatusBadge';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { PermissionButton } from '@components/rbac/PermissionButton';
import {
  useCreateItemCategory,
  useDeleteItemCategory,
  useItemCategories,
  useUpdateItemCategory,
} from '@hooks/useInventory';
import type { ItemCategory } from '@app-types/inventory';
import { ModuleListPack } from '@workflow-packs';

const schema = z.object({
  item_category: z.string().trim().min(1, 'Name is required'),
  description: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

const columns: DataTableColumn<ItemCategory>[] = [
  { id: 'name', header: 'Category', cellClassName: 'font-medium', cell: (r) => r.item_category },
  { id: 'description', header: 'Description', cell: (r) => r.description || '—' },
  {
    id: 'status',
    header: 'Status',
    cell: (r) => <StatusBadge isActive={r.is_active === 'yes' ? 'yes' : 'no'} />,
  },
];

export function ItemCategoriesPage() {
  const { data = [], isLoading, isError, error, refetch } = useItemCategories();
  const createMutation = useCreateItemCategory();
  const updateMutation = useUpdateItemCategory();
  const deleteMutation = useDeleteItemCategory();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<ItemCategory | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ItemCategory | null>(null);
  const { control, handleSubmit, reset, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { item_category: '', description: '' },
  });

  useEffect(() => {
    if (!open) return;
    reset(
      selected
        ? { item_category: selected.item_category, description: selected.description || '' }
        : { item_category: '', description: '' },
    );
  }, [open, selected, reset]);

  const addAction = (
    <PermissionButton
      permission="inventory.category.create"
      onClick={() => {
        setSelected(null);
        setOpen(true);
      }}
      className="gap-1"
    >
      <Plus className="h-4 w-4" />
      Add Category
    </PermissionButton>
  );

  return (
    <ModuleListPack
      title="Item Categories"
      description="Organize inventory items by category."
      actions={addAction}
      isLoading={isLoading}
      loadingMessage="Loading categories..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && data.length === 0}
      emptyTitle="No categories yet"
      emptyDescription="Add a category before creating items."
      emptyAction={addAction}
    >
      <DataTable
        data={data}
        columns={columns}
        getRowKey={(r) => r.id}
        actions={(row) => (
          <>
            <PermissionButton
              permission="inventory.category.edit"
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
              permission="inventory.category.delete"
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
        title={selected ? 'Edit Category' : 'Add Category'}
        onSubmit={handleSubmit((values) => {
          const payload = {
            item_category: values.item_category,
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
        <FormTextField control={control} name="item_category" label="Name" required />
        <FormTextareaField control={control} name="description" label="Description" />
      </EntityFormDialog>
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete category?"
        description={`Remove “${deleteTarget?.item_category ?? ''}”.`}
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
