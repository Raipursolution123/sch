import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { z } from 'zod';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormSwitchField, FormTextField, FormTextareaField } from '@components/forms/fields';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { PermissionButton } from '@components/rbac/PermissionButton';
import {
  useCreateStudentHouse,
  useDeleteStudentHouse,
  useStudentHouses,
  useUpdateStudentHouse,
} from '@hooks/useStudentMasters';
import type { StudentHouse } from '@app-types/students/masters';
import { ModuleListPack } from '@workflow-packs';

const schema = z.object({
  house_name: z.string().trim().min(1, 'Name is required'),
  description: z.string().optional(),
  is_active: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

const columns: DataTableColumn<StudentHouse>[] = [
  {
    id: 'name',
    header: 'House',
    cellClassName: 'font-medium',
    cell: (r) => r.house_name,
  },
  { id: 'description', header: 'Description', cell: (r) => r.description || '—' },
  {
    id: 'status',
    header: 'Status',
    cell: (r) => (r.is_active === 'yes' ? 'Active' : 'Inactive'),
  },
];

export function StudentHousesPage() {
  const { data = [], isLoading, isError, error, refetch } = useStudentHouses();
  const createMutation = useCreateStudentHouse();
  const updateMutation = useUpdateStudentHouse();
  const deleteMutation = useDeleteStudentHouse();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<StudentHouse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StudentHouse | null>(null);
  const { control, handleSubmit, reset, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { house_name: '', description: '', is_active: true },
  });

  useEffect(() => {
    if (!open) return;
    reset(
      selected
        ? {
            house_name: selected.house_name,
            description: selected.description || '',
            is_active: selected.is_active === 'yes',
          }
        : { house_name: '', description: '', is_active: true },
    );
  }, [open, selected, reset]);

  const addAction = (
    <PermissionButton
      permission="students.houses.create"
      onClick={() => {
        setSelected(null);
        setOpen(true);
      }}
      className="gap-1"
    >
      <Plus className="h-4 w-4" />
      Add House
    </PermissionButton>
  );

  return (
    <>
      <ModuleListPack
        title="Houses"
        description="School houses used to group students."
        actions={addAction}
        isLoading={isLoading}
        loadingMessage="Loading houses..."
        isError={isError}
        error={error}
        onRetry={() => void refetch()}
        isEmpty={!isLoading && !isError && data.length === 0}
        emptyTitle="No houses"
        emptyDescription="Create houses such as Red, Blue, Green, or Yellow."
        emptyAction={addAction}
      >
        <DataTable
          data={data}
          columns={columns}
          getRowKey={(r) => r.id}
          actions={(row) => (
            <>
              <PermissionButton
                permission="students.houses.edit"
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
                permission="students.houses.delete"
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
        title={selected ? 'Edit House' : 'Add House'}
        onSubmit={handleSubmit((values) => {
          const payload = {
            house_name: values.house_name,
            description: values.description?.trim() || '',
            is_active: values.is_active ? 'yes' : 'no',
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
        <FormTextField control={control} name="house_name" label="Name" required />
        <FormTextareaField control={control} name="description" label="Description" />
        <FormSwitchField control={control} name="is_active" label="Active" />
      </EntityFormDialog>
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete house?"
        description={`Remove “${deleteTarget?.house_name ?? ''}”. Deactivate it first if deletion is blocked.`}
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
