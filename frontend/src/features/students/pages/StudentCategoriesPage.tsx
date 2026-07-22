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
  useCreateStudentCategory,
  useDeleteStudentCategory,
  useStudentCategories,
  useUpdateStudentCategory,
} from '@hooks/useStudentMasters';
import type { StudentCategory } from '@app-types/students/masters';
import { ModuleListPack } from '@workflow-packs';

const schema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  is_active: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

const columns: DataTableColumn<StudentCategory>[] = [
  { id: 'name', header: 'Category', cellClassName: 'font-medium', cell: (r) => r.name },
  {
    id: 'status',
    header: 'Status',
    cell: (r) => (r.is_active === 'yes' ? 'Active' : 'Inactive'),
  },
];

export function StudentCategoriesPage() {
  const { data = [], isLoading, isError, error, refetch } = useStudentCategories();
  const createMutation = useCreateStudentCategory();
  const updateMutation = useUpdateStudentCategory();
  const deleteMutation = useDeleteStudentCategory();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<StudentCategory | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StudentCategory | null>(null);
  const { control, handleSubmit, reset, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', is_active: true },
  });

  useEffect(() => {
    if (!open) return;
    reset(
      selected
        ? { name: selected.name, is_active: selected.is_active === 'yes' }
        : { name: '', is_active: true },
    );
  }, [open, selected, reset]);

  const addAction = (
    <PermissionButton
      permission="students.categories.create"
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
    <>
      <ModuleListPack
        title="Categories"
        description="Student category master (General, OBC, SC, ST, etc.). Shared with fee category names."
        actions={addAction}
        isLoading={isLoading}
        loadingMessage="Loading categories..."
        isError={isError}
        error={error}
        onRetry={() => void refetch()}
        isEmpty={!isLoading && !isError && data.length === 0}
        emptyTitle="No categories"
        emptyDescription="Create categories used during student admission."
        emptyAction={addAction}
      >
        <DataTable
          data={data}
          columns={columns}
          getRowKey={(r) => r.id}
          actions={(row) => (
            <>
              <PermissionButton
                permission="students.categories.edit"
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
                permission="students.categories.delete"
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
        title={selected ? 'Edit Category' : 'Add Category'}
        onSubmit={handleSubmit((values) => {
          const payload = {
            name: values.name,
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
        <FormTextField control={control} name="name" label="Name" required />
        <FormSwitchField control={control} name="is_active" label="Active" />
      </EntityFormDialog>
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete category?"
        description={`Remove “${deleteTarget?.name ?? ''}”. Deactivate it first if deletion is blocked.`}
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
