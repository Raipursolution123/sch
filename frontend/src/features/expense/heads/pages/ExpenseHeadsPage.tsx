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
  useCreateExpenseHead,
  useDeleteExpenseHead,
  useExpenseHeads,
  useUpdateExpenseHead,
} from '@hooks/useIncomeExpense';
import type { ExpenseHead } from '@app-types/income-expense';
import { ModuleListPack } from '@workflow-packs';

const schema = z.object({
  exp_category: z.string().trim().min(1, 'Category is required'),
  description: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

const columns: DataTableColumn<ExpenseHead>[] = [
  {
    id: 'name',
    header: 'Category',
    cellClassName: 'font-medium',
    cell: (r) => r.exp_category || '—',
  },
  { id: 'description', header: 'Description', cell: (r) => r.description || '—' },
];

export function ExpenseHeadsPage() {
  const { data = [], isLoading, isError, error, refetch } = useExpenseHeads();
  const createMutation = useCreateExpenseHead();
  const updateMutation = useUpdateExpenseHead();
  const deleteMutation = useDeleteExpenseHead();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<ExpenseHead | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ExpenseHead | null>(null);
  const { control, handleSubmit, reset, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { exp_category: '', description: '' },
  });

  useEffect(() => {
    if (!open) return;
    reset(
      selected
        ? { exp_category: selected.exp_category || '', description: selected.description || '' }
        : { exp_category: '', description: '' },
    );
  }, [open, selected, reset]);

  const addAction = (
    <PermissionButton
      permission="expense.head.create"
      onClick={() => {
        setSelected(null);
        setOpen(true);
      }}
      className="gap-1"
    >
      <Plus className="h-4 w-4" />
      Add Head
    </PermissionButton>
  );

  return (
    <ModuleListPack
      title="Expense Heads"
      description="Categories for school expense entries."
      actions={addAction}
      isLoading={isLoading}
      loadingMessage="Loading expense heads..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && data.length === 0}
      emptyTitle="No expense heads"
      emptyDescription="Create a head before recording expenses."
      emptyAction={addAction}
    >
      <DataTable
        data={data}
        columns={columns}
        getRowKey={(r) => r.id}
        actions={(row) => (
          <>
            <PermissionButton
              permission="expense.head.edit"
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
              permission="expense.head.delete"
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
        title={selected ? 'Edit Expense Head' : 'Add Expense Head'}
        onSubmit={handleSubmit((values) => {
          const payload = {
            exp_category: values.exp_category,
            description: values.description?.trim() || null,
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
        <FormTextField control={control} name="exp_category" label="Category" required />
        <FormTextareaField control={control} name="description" label="Description" />
      </EntityFormDialog>
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete expense head?"
        description={`Remove “${deleteTarget?.exp_category ?? ''}”.`}
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
