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
  useCreateIncomeHead,
  useDeleteIncomeHead,
  useIncomeHeads,
  useUpdateIncomeHead,
} from '@hooks/useIncomeExpense';
import type { IncomeHead } from '@app-types/income-expense';
import { ModuleListPack } from '@workflow-packs';

const schema = z.object({
  income_category: z.string().trim().min(1, 'Category is required'),
  description: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

const columns: DataTableColumn<IncomeHead>[] = [
  {
    id: 'name',
    header: 'Category',
    cellClassName: 'font-medium',
    cell: (r) => r.income_category || '—',
  },
  { id: 'description', header: 'Description', cell: (r) => r.description || '—' },
];

export function IncomeHeadsPage() {
  const { data = [], isLoading, isError, error, refetch } = useIncomeHeads();
  const createMutation = useCreateIncomeHead();
  const updateMutation = useUpdateIncomeHead();
  const deleteMutation = useDeleteIncomeHead();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<IncomeHead | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<IncomeHead | null>(null);
  const { control, handleSubmit, reset, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { income_category: '', description: '' },
  });

  useEffect(() => {
    if (!open) return;
    reset(
      selected
        ? {
            income_category: selected.income_category || '',
            description: selected.description || '',
          }
        : { income_category: '', description: '' },
    );
  }, [open, selected, reset]);

  const addAction = (
    <PermissionButton
      permission="income.head.create"
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
      title="Income Heads"
      description="Categories for non-fee income entries."
      actions={addAction}
      isLoading={isLoading}
      loadingMessage="Loading income heads..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && data.length === 0}
      emptyTitle="No income heads"
      emptyDescription="Create a head before recording income."
      emptyAction={addAction}
    >
      <DataTable
        data={data}
        columns={columns}
        getRowKey={(r) => r.id}
        actions={(row) => (
          <>
            <PermissionButton
              permission="income.head.edit"
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
              permission="income.head.delete"
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
        title={selected ? 'Edit Income Head' : 'Add Income Head'}
        onSubmit={handleSubmit((values) => {
          const payload = {
            income_category: values.income_category,
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
        <FormTextField control={control} name="income_category" label="Category" required />
        <FormTextareaField control={control} name="description" label="Description" />
      </EntityFormDialog>
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete income head?"
        description={`Remove “${deleteTarget?.income_category ?? ''}”.`}
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
