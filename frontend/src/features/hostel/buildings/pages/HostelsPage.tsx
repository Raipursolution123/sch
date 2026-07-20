import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import {
  FormNumberField,
  FormSwitchField,
  FormTextField,
  FormTextareaField,
} from '@components/forms/fields';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { StatusBadge } from '@components/feedback/StatusBadge';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { useCreateHostel, useDeleteHostel, useHostels, useUpdateHostel } from '@hooks/useHostels';
import type { Hostel } from '@app-types/hostel/hostel';
import { ModuleListPack } from '@workflow-packs';

const schema = z.object({
  hostel_name: z.string().trim().min(1, 'Name is required'),
  type: z.string().optional(),
  address: z.string().optional(),
  intake: z.number().optional().nullable(),
  hostel_incharge: z.string().optional(),
  description: z.string().optional(),
  is_active: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

const columns: DataTableColumn<Hostel>[] = [
  { id: 'name', header: 'Name', cellClassName: 'font-medium', cell: (r) => r.hostel_name ?? '—' },
  { id: 'type', header: 'Type', cell: (r) => r.type ?? '—' },
  { id: 'intake', header: 'Intake', cellClassName: 'tabular-nums', cell: (r) => r.intake ?? '—' },
  { id: 'incharge', header: 'Incharge', cell: (r) => r.hostel_incharge ?? '—' },
  {
    id: 'status',
    header: 'Status',
    cell: (r) => <StatusBadge isActive={r.is_active === 'yes' ? 'yes' : 'no'} />,
  },
];

export function HostelsPage() {
  const { data, isLoading, isError, error, refetch } = useHostels();
  const createMutation = useCreateHostel();
  const updateMutation = useUpdateHostel();
  const deleteMutation = useDeleteHostel();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<Hostel | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Hostel | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      hostel_name: '',
      type: '',
      address: '',
      intake: null,
      hostel_incharge: '',
      description: '',
      is_active: true,
    },
  });

  const openCreate = () => {
    setSelected(null);
    reset({
      hostel_name: '',
      type: '',
      address: '',
      intake: null,
      hostel_incharge: '',
      description: '',
      is_active: true,
    });
    setDialogOpen(true);
  };

  const openEdit = (hostel: Hostel) => {
    setSelected(hostel);
    reset({
      hostel_name: hostel.hostel_name ?? '',
      type: hostel.type ?? '',
      address: hostel.address ?? '',
      intake: hostel.intake,
      hostel_incharge: hostel.hostel_incharge ?? '',
      description: hostel.description ?? '',
      is_active: hostel.is_active === 'yes',
    });
    setDialogOpen(true);
  };

  const onSubmit = (values: FormValues) => {
    const payload = {
      hostel_name: values.hostel_name,
      type: values.type || null,
      address: values.address || null,
      intake: values.intake ?? null,
      hostel_incharge: values.hostel_incharge || null,
      description: values.description || null,
      is_active: values.is_active ? 'yes' : 'no',
    };
    if (selected) {
      updateMutation.mutate(
        { id: selected.id, payload },
        { onSuccess: () => setDialogOpen(false) },
      );
      return;
    }
    createMutation.mutate(payload, { onSuccess: () => setDialogOpen(false) });
  };

  const addAction = (
    <PermissionButton permission="settings.manage" onClick={openCreate} className="gap-1">
      <Plus className="h-4 w-4" aria-hidden="true" />
      Add Hostel
    </PermissionButton>
  );

  return (
    <ModuleListPack
      title="Hostels"
      description="Manage hostel buildings and capacity."
      actions={addAction}
      isLoading={isLoading}
      loadingMessage="Loading hostels..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && (data?.length ?? 0) === 0}
      emptyTitle="No hostels"
      emptyDescription="Add a hostel building to get started."
      emptyAction={addAction}
      footer={
        <>
          <EntityFormDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            title={selected ? 'Edit hostel' : 'Add hostel'}
            onSubmit={handleSubmit(onSubmit)}
            isLoading={createMutation.isPending || updateMutation.isPending}
            submitLabel={selected ? 'Save' : 'Create'}
          >
            <FormErrorSummary errors={errors} />
            <FormTextField control={control} name="hostel_name" label="Hostel name" />
            <FormTextField control={control} name="type" label="Type" optional />
            <FormTextField control={control} name="hostel_incharge" label="Incharge" optional />
            <FormNumberField control={control} name="intake" label="Intake" optional />
            <FormTextareaField control={control} name="address" label="Address" optional />
            <FormTextareaField control={control} name="description" label="Description" optional />
            <FormSwitchField control={control} name="is_active" label="Active" />
          </EntityFormDialog>
          <ConfirmDialog
            open={deleteTarget !== null}
            onOpenChange={(open) => {
              if (!open) setDeleteTarget(null);
            }}
            title="Delete hostel"
            description={
              deleteTarget ? `Delete "${deleteTarget.hostel_name}"? This cannot be undone.` : ''
            }
            confirmLabel="Delete"
            destructive
            isLoading={deleteMutation.isPending}
            onConfirm={() => {
              if (!deleteTarget) return;
              deleteMutation.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
            }}
          />
        </>
      }
    >
      <DataTable
        data={data ?? []}
        columns={columns}
        getRowKey={(row) => row.id}
        actions={(row) => (
          <>
            <PermissionButton
              permission="settings.manage"
              variant="ghost"
              size="sm"
              onClick={() => openEdit(row)}
              aria-label="Edit"
            >
              <Pencil className="h-4 w-4" />
            </PermissionButton>
            <PermissionButton
              permission="settings.manage"
              variant="ghost"
              size="sm"
              onClick={() => setDeleteTarget(row)}
              aria-label="Delete"
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </PermissionButton>
          </>
        )}
      />
    </ModuleListPack>
  );
}
