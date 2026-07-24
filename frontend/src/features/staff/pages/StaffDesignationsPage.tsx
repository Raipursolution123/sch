import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { z } from 'zod';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormSwitchField, FormTextField } from '@components/forms/fields';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { PermissionButton } from '@components/rbac/PermissionButton';
import {
  useCreateStaffDesignation,
  useDeleteStaffDesignation,
  useStaffDesignationsList,
  useUpdateStaffDesignation,
} from '@hooks/useStaffMasters';
import type { StaffDesignation } from '@app-types/staff/staff';
import { ModuleListPack } from '@workflow-packs';

const schema = z.object({
  designation: z.string().trim().min(1, 'Name is required'),
  is_active: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

const columns: DataTableColumn<StaffDesignation>[] = [
  {
    id: 'name',
    header: 'Designation',
    cellClassName: 'font-medium',
    cell: (r) => r.designation || r.name,
  },
  {
    id: 'status',
    header: 'Status',
    cell: (r) => (r.is_active === 'yes' ? 'Active' : 'Inactive'),
  },
];

export function StaffDesignationsPage() {
  const { data = [], isLoading, isError, error, refetch } = useStaffDesignationsList();
  const createMutation = useCreateStaffDesignation();
  const updateMutation = useUpdateStaffDesignation();
  const deleteMutation = useDeleteStaffDesignation();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<StaffDesignation | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StaffDesignation | null>(null);
  const { control, handleSubmit, reset, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { designation: '', is_active: true },
  });

  useEffect(() => {
    if (!open) return;
    reset(
      selected
        ? {
            designation: selected.designation || selected.name,
            is_active: selected.is_active !== 'no',
          }
        : { designation: '', is_active: true },
    );
  }, [open, selected, reset]);

  const addAction = (
    <PermissionButton
      permission="staff.designations.create"
      onClick={() => {
        setSelected(null);
        setOpen(true);
      }}
      className="gap-1"
    >
      <Plus className="h-4 w-4" />
      Add Designation
    </PermissionButton>
  );

  return (
    <>
      <ModuleListPack
        title="Designations"
        description="Job titles assigned to staff members."
        actions={addAction}
        isLoading={isLoading}
        loadingMessage="Loading designations..."
        isError={isError}
        error={error}
        onRetry={() => void refetch()}
        isEmpty={!isLoading && !isError && data.length === 0}
        emptyTitle="No designations"
        emptyDescription="Create designations such as Principal, Teacher, or Accountant."
        emptyAction={addAction}
      >
        <DataTable
          data={data}
          columns={columns}
          getRowKey={(r) => r.id}
          actions={(row) => (
            <>
              <PermissionButton
                permission="staff.designations.edit"
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
                permission="staff.designations.delete"
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
      </ModuleListPack>
      <EntityFormDialog
        open={open}
        onOpenChange={setOpen}
        title={selected ? 'Edit Designation' : 'Add Designation'}
        onSubmit={handleSubmit((values) => {
          const payload = {
            designation: values.designation,
            is_active: (values.is_active ? 'yes' : 'no') as 'yes' | 'no',
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
        <FormTextField control={control} name="designation" label="Name" required />
        <FormSwitchField control={control} name="is_active" label="Active" />
      </EntityFormDialog>
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete designation?"
        description={`Remove “${deleteTarget?.designation || deleteTarget?.name || ''}”. Deactivate it first if deletion is blocked.`}
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteMutation.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
        }}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}
