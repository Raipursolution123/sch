import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { z } from 'zod';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import {
  FormDateField,
  FormNumberField,
  FormSelectField,
  FormTextField,
  FormTextareaField,
} from '@components/forms/fields';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { PermissionButton } from '@components/rbac/PermissionButton';
import {
  useCreateIncome,
  useDeleteIncome,
  useIncomeHeads,
  useIncomeList,
  useUpdateIncome,
} from '@hooks/useIncomeExpense';
import type { IncomeRecord } from '@app-types/income-expense';
import { formatAmount, formatDate } from '@utils/format';
import { ModuleListPack } from '@workflow-packs';

const schema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  income_head_id: z.string().optional(),
  invoice_no: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  amount: z.number().min(0),
  note: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

const today = new Date().toISOString().slice(0, 10);

export function IncomeListPage() {
  const { data = [], isLoading, isError, error, refetch } = useIncomeList();
  const { data: heads = [] } = useIncomeHeads();
  const createMutation = useCreateIncome();
  const updateMutation = useUpdateIncome();
  const deleteMutation = useDeleteIncome();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<IncomeRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<IncomeRecord | null>(null);
  const { control, handleSubmit, reset, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      income_head_id: '',
      invoice_no: '',
      date: today,
      amount: 0,
      note: '',
    },
  });

  useEffect(() => {
    if (!open) return;
    reset(
      selected
        ? {
            name: selected.name || '',
            income_head_id: selected.income_head_id ? String(selected.income_head_id) : '',
            invoice_no: selected.invoice_no || '',
            date: selected.date || today,
            amount: selected.amount ?? 0,
            note: selected.note || '',
          }
        : {
            name: '',
            income_head_id: '',
            invoice_no: '',
            date: today,
            amount: 0,
            note: '',
          },
    );
  }, [open, selected, reset]);

  const headName = useMemo(() => {
    const map = new Map(heads.map((h) => [h.id, h.income_category || `#${h.id}`]));
    return (id: number | null) => (id ? map.get(id) || `#${id}` : '—');
  }, [heads]);

  const columns: DataTableColumn<IncomeRecord>[] = [
    { id: 'name', header: 'Name', cellClassName: 'font-medium', cell: (r) => r.name || '—' },
    { id: 'head', header: 'Head', cell: (r) => headName(r.income_head_id) },
    { id: 'invoice', header: 'Invoice', cell: (r) => r.invoice_no || '—' },
    {
      id: 'date',
      header: 'Date',
      cell: (r) => (r.date ? formatDate(r.date) : '—'),
    },
    {
      id: 'amount',
      header: 'Amount',
      cellClassName: 'tabular-nums',
      cell: (r) => formatAmount(r.amount ?? 0),
    },
  ];

  const addAction = (
    <PermissionButton
      permission="income.create"
      onClick={() => {
        setSelected(null);
        setOpen(true);
      }}
      className="gap-1"
    >
      <Plus className="h-4 w-4" />
      Add Income
    </PermissionButton>
  );

  return (
    <ModuleListPack
      title="Add Income"
      description="Record non-fee income against income heads."
      actions={addAction}
      isLoading={isLoading}
      loadingMessage="Loading income..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && data.length === 0}
      emptyTitle="No income records"
      emptyDescription="Add the first income entry."
      emptyAction={addAction}
    >
      <DataTable
        data={data}
        columns={columns}
        getRowKey={(r) => r.id}
        actions={(row) => (
          <>
            <PermissionButton
              permission="income.edit"
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
              permission="income.delete"
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
        title={selected ? 'Edit Income' : 'Add Income'}
        onSubmit={handleSubmit((values) => {
          const payload = {
            name: values.name,
            income_head_id: values.income_head_id ? Number(values.income_head_id) : null,
            invoice_no: values.invoice_no?.trim() || null,
            date: values.date,
            amount: values.amount,
            note: values.note?.trim() || null,
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
        <FormSelectField
          control={control}
          name="income_head_id"
          label="Income head"
          options={[
            { value: '', label: 'None' },
            ...heads.map((h) => ({
              value: String(h.id),
              label: h.income_category || `Head #${h.id}`,
            })),
          ]}
        />
        <FormTextField control={control} name="invoice_no" label="Invoice no" />
        <FormDateField control={control} name="date" label="Date" required />
        <FormNumberField control={control} name="amount" label="Amount" required />
        <FormTextareaField control={control} name="note" label="Note" />
      </EntityFormDialog>
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete income?"
        description={`Remove “${deleteTarget?.name ?? ''}”.`}
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
