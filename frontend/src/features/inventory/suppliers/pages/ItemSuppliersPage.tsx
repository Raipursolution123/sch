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
  useCreateItemSupplier,
  useDeleteItemSupplier,
  useItemSuppliers,
  useUpdateItemSupplier,
} from '@hooks/useInventory';
import type { ItemSupplier } from '@app-types/inventory';
import { ModuleListPack } from '@workflow-packs';

const schema = z.object({
  item_supplier: z.string().trim().min(1, 'Name is required'),
  phone: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional(),
  contact_person_name: z.string().optional(),
  description: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

const columns: DataTableColumn<ItemSupplier>[] = [
  { id: 'name', header: 'Supplier', cellClassName: 'font-medium', cell: (r) => r.item_supplier },
  { id: 'phone', header: 'Phone', cell: (r) => r.phone || '—' },
  { id: 'email', header: 'Email', cell: (r) => r.email || '—' },
  { id: 'contact', header: 'Contact', cell: (r) => r.contact_person_name || '—' },
];

export function ItemSuppliersPage() {
  const { data = [], isLoading, isError, error, refetch } = useItemSuppliers();
  const createMutation = useCreateItemSupplier();
  const updateMutation = useUpdateItemSupplier();
  const deleteMutation = useDeleteItemSupplier();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<ItemSupplier | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ItemSupplier | null>(null);
  const { control, handleSubmit, reset, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      item_supplier: '',
      phone: '',
      email: '',
      address: '',
      contact_person_name: '',
      description: '',
    },
  });

  useEffect(() => {
    if (!open) return;
    reset(
      selected
        ? {
            item_supplier: selected.item_supplier,
            phone: selected.phone || '',
            email: selected.email || '',
            address: selected.address || '',
            contact_person_name: selected.contact_person_name || '',
            description: selected.description || '',
          }
        : {
            item_supplier: '',
            phone: '',
            email: '',
            address: '',
            contact_person_name: '',
            description: '',
          },
    );
  }, [open, selected, reset]);

  const addAction = (
    <PermissionButton
      permission="inventory.supplier.create"
      onClick={() => {
        setSelected(null);
        setOpen(true);
      }}
      className="gap-1"
    >
      <Plus className="h-4 w-4" />
      Add Supplier
    </PermissionButton>
  );

  return (
    <ModuleListPack
      title="Suppliers"
      description="Vendors that supply inventory items."
      actions={addAction}
      isLoading={isLoading}
      loadingMessage="Loading suppliers..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && data.length === 0}
      emptyTitle="No suppliers yet"
      emptyDescription="Add a supplier to track stock purchases."
      emptyAction={addAction}
    >
      <DataTable
        data={data}
        columns={columns}
        getRowKey={(r) => r.id}
        actions={(row) => (
          <>
            <PermissionButton
              permission="inventory.supplier.edit"
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
              permission="inventory.supplier.delete"
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
        title={selected ? 'Edit Supplier' : 'Add Supplier'}
        onSubmit={handleSubmit((values) => {
          const payload = {
            item_supplier: values.item_supplier,
            phone: values.phone?.trim() || '',
            email: values.email?.trim() || '',
            address: values.address?.trim() || '',
            contact_person_name: values.contact_person_name?.trim() || '',
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
        <FormTextField control={control} name="item_supplier" label="Name" required />
        <FormTextField control={control} name="phone" label="Phone" />
        <FormTextField control={control} name="email" label="Email" />
        <FormTextField control={control} name="contact_person_name" label="Contact person" />
        <FormTextField control={control} name="address" label="Address" />
        <FormTextareaField control={control} name="description" label="Description" />
      </EntityFormDialog>
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete supplier?"
        description={`Remove “${deleteTarget?.item_supplier ?? ''}”.`}
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
