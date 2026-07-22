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
  useCreateStaffDepartment,
  useDeleteStaffDepartment,
  useStaffDepartmentsList,
  useUpdateStaffDepartment,
} from '@hooks/useStaffMasters';
import type { StaffDepartment } from '@app-types/staff/staff';
import { ModuleListPack } from '@workflow-packs';

const schema = z.object({
  department_name: z.string().trim().min(1, 'Name is required'),
  is_active: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

const columns: DataTableColumn<StaffDepartment>[] = [
  {
    id: 'name',
    header: 'Department',
    cellClassName: 'font-medium',
    cell: (r) => r.department_name || r.name,
  },
  {
    id: 'status',
    header: 'Status',
    cell: (r) => (r.is_active === 'yes' ? 'Active' : 'Inactive'),
  },
];

export function StaffDepartmentsPage() {
  const { data = [], isLoading, isError, error, refetch } = useStaffDepartmentsList();
  const createMutation = useCreateStaffDepartment();
  const updateMutation = useUpdateStaffDepartment();
  const deleteMutation = useDeleteStaffDepartment();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<StaffDepartment | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StaffDepartment | null>(null);
  const { control, handleSubmit, reset, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { department_name: '', is_active: true },
  });

  useEffect(() => {
    if (!open) return;
    reset(
      selected
        ? {
            department_name: selected.department_name || selected.name,
            is_active: selected.is_active !== 'no',
          }
        : { department_name: '', is_active: true },
    );
  }, [open, selected, reset]);

  const addAction = (
    <PermissionButton
      permission="staff.departments.create"
      onClick={() => {
        setSelected(null);
        setOpen(true);
      }}
      className="gap-1"
    >
      <Plus className="h-4 w-4" />
      Add Department
    </PermissionButton>
  );

  return (
    <>
      <ModuleListPack
        title="Departments"
        description="Organize staff into departments used on profiles and filters."
        actions={addAction}
        isLoading={isLoading}
        loadingMessage="Loading departments..."
        isError={isError}
        error={error}
        onRetry={() => void refetch()}
        isEmpty={!isLoading && !isError && data.length === 0}
        emptyTitle="No departments"
        emptyDescription="Create departments such as Teaching, Administration, or Accounts."
        emptyAction={addAction}
      >
        <DataTable
          data={data}
          columns={columns}
          getRowKey={(r) => r.id}
          actions={(row) => (
            <>
              <PermissionButton
                permission="staff.departments.edit"
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
                permission="staff.departments.delete"
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
        title={selected ? 'Edit Department' : 'Add Department'}
        onSubmit={handleSubmit((values) => {
          const payload = {
            department_name: values.department_name,
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
        <FormTextField control={control} name="department_name" label="Name" required />
        <FormSwitchField control={control} name="is_active" label="Active" />
      </EntityFormDialog>
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete department?"
        description={`Remove “${deleteTarget?.department_name || deleteTarget?.name || ''}”. Deactivate it first if deletion is blocked.`}
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
