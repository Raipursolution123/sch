import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PackageMinus, Undo2 } from 'lucide-react';
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
import { FormField } from '@components/forms/FormField';
import { Input } from '@components/ui/input';
import { Select } from '@components/ui/select';
import { Badge } from '@components/ui/badge';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { PermissionButton } from '@components/rbac/PermissionButton';
import {
  useInventoryItems,
  useIssueInventoryItem,
  useItemIssues,
  useReturnInventoryIssue,
} from '@hooks/useInventory';
import type { ItemIssue } from '@app-types/inventory';
import { formatDate } from '@utils/format';
import { ModuleListPack } from '@workflow-packs';

const schema = z.object({
  item_id: z.string().min(1, 'Item is required'),
  issue_to: z.string().min(1, 'Staff / member ID is required'),
  quantity: z.number().min(1),
  issue_date: z.string().min(1),
  note: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

const today = new Date().toISOString().slice(0, 10);

export function ItemIssuePage() {
  const [status, setStatus] = useState('open');
  const [search, setSearch] = useState('');
  const { data: issues = [], isLoading, isError, error, refetch } = useItemIssues(status, search);
  const { data: items = [] } = useInventoryItems();
  const issueMutation = useIssueInventoryItem();
  const returnMutation = useReturnInventoryIssue();
  const [open, setOpen] = useState(false);
  const [returnTarget, setReturnTarget] = useState<ItemIssue | null>(null);
  const { control, handleSubmit, reset, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { item_id: '', issue_to: '', quantity: 1, issue_date: today, note: '' },
  });

  useEffect(() => {
    if (!open) return;
    reset({ item_id: '', issue_to: '', quantity: 1, issue_date: today, note: '' });
  }, [open, reset]);

  const itemName = useMemo(() => {
    const map = new Map(items.map((i) => [i.id, i.name]));
    return (id: number | null) => (id ? map.get(id) || `#${id}` : '—');
  }, [items]);

  const columns: DataTableColumn<ItemIssue>[] = [
    {
      id: 'item',
      header: 'Item',
      cellClassName: 'font-medium',
      cell: (r) => itemName(r.item_id),
    },
    { id: 'to', header: 'Issue to', cell: (r) => r.issue_to },
    { id: 'qty', header: 'Qty', cellClassName: 'tabular-nums', cell: (r) => r.quantity },
    {
      id: 'date',
      header: 'Issued',
      cell: (r) => (r.issue_date ? formatDate(r.issue_date) : '—'),
    },
    {
      id: 'status',
      header: 'Status',
      cell: (r) =>
        r.is_returned ? (
          <Badge variant="secondary">Returned</Badge>
        ) : (
          <Badge variant="outline">Open</Badge>
        ),
    },
  ];

  const issueAction = (
    <PermissionButton
      permission="inventory.issue.create"
      onClick={() => setOpen(true)}
      className="gap-1"
    >
      <PackageMinus className="h-4 w-4" />
      Issue Item
    </PermissionButton>
  );

  return (
    <ModuleListPack
      title="Issue Item"
      description="Issue inventory to staff/members and record returns."
      actions={
        <div className="flex flex-wrap items-end gap-3">
          <FormField label="Status" htmlFor="inv-issue-status">
            <Select
              id="inv-issue-status"
              className="w-40"
              value={status}
              onValueChange={setStatus}
              options={[
                { value: 'open', label: 'Open' },
                { value: 'returned', label: 'Returned' },
                { value: 'all', label: 'All' },
              ]}
            />
          </FormField>
          <FormField label="Search" htmlFor="inv-issue-search">
            <Input
              id="inv-issue-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Note or category…"
              className="w-56"
            />
          </FormField>
          {issueAction}
        </div>
      }
      isLoading={isLoading}
      loadingMessage="Loading issues..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && issues.length === 0}
      emptyTitle="No issues found"
      emptyDescription="Issue an item to start tracking circulation."
      emptyAction={issueAction}
    >
      <DataTable
        data={issues}
        columns={columns}
        getRowKey={(r) => r.id}
        actions={(row) =>
          row.is_returned ? null : (
            <PermissionButton
              permission="inventory.issue.edit"
              variant="ghost"
              size="sm"
              className="gap-1"
              onClick={() => setReturnTarget(row)}
            >
              <Undo2 className="h-4 w-4" />
              Return
            </PermissionButton>
          )
        }
      />
      <EntityFormDialog
        open={open}
        onOpenChange={setOpen}
        title="Issue Item"
        onSubmit={handleSubmit((values) => {
          issueMutation.mutate(
            {
              item_id: Number(values.item_id),
              issue_to: Number(values.issue_to),
              quantity: values.quantity,
              issue_date: values.issue_date,
              note: values.note?.trim() || '',
            },
            { onSuccess: () => setOpen(false) },
          );
        })}
        isLoading={issueMutation.isPending}
      >
        <FormErrorSummary errors={formState.errors} />
        <FormSelectField
          control={control}
          name="item_id"
          label="Item"
          required
          options={items.map((i) => ({
            value: String(i.id),
            label: `${i.name} (qty ${i.quantity})`,
          }))}
          placeholder="Select item"
        />
        <FormTextField control={control} name="issue_to" label="Issue to (staff ID)" required />
        <FormNumberField control={control} name="quantity" label="Quantity" required />
        <FormDateField control={control} name="issue_date" label="Issue date" required />
        <FormTextareaField control={control} name="note" label="Note" />
      </EntityFormDialog>
      <ConfirmDialog
        open={returnTarget !== null}
        onOpenChange={(v) => !v && setReturnTarget(null)}
        title="Return item?"
        description={`Mark issue #${returnTarget?.id ?? ''} as returned and restock quantity.`}
        confirmLabel="Return"
        onConfirm={() => {
          if (!returnTarget) return;
          returnMutation.mutate(returnTarget.id, { onSuccess: () => setReturnTarget(null) });
        }}
        isLoading={returnMutation.isPending}
      />
    </ModuleListPack>
  );
}
