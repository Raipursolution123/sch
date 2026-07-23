import { useMemo, useState } from 'react';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { FormField } from '@components/forms/FormField';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Select } from '@components/ui/select';
import { useReconciliationReport, useUpdateReconciliation } from '@hooks/useFinanceReports';
import type { ReconciliationItem } from '@app-types/finance';
import { formatAmount } from '@utils/format';
import { todayIsoDate } from '@utils/student';
import { ModuleListPack } from '@workflow-packs';

function parseAmount(value: number | string): number {
  const num = typeof value === 'string' ? Number(value) : value;
  return Number.isFinite(num) ? num : 0;
}

export function ReconciliationPage() {
  const [ledgerId, setLedgerId] = useState(0);
  const [appliedLedgerId, setAppliedLedgerId] = useState<number | undefined>(undefined);
  const [reconDate, setReconDate] = useState(todayIsoDate());

  const { data, isLoading, isError, error, refetch } = useReconciliationReport(appliedLedgerId);
  const updateMutation = useUpdateReconciliation();

  const items = data?.items ?? [];
  const ledgerOptions = useMemo(
    () => [
      { value: '', label: 'All reconciliation ledgers' },
      ...(data?.ledgers ?? []).map((l) => ({ value: String(l.id), label: l.name })),
    ],
    [data?.ledgers],
  );

  const columns: DataTableColumn<ReconciliationItem>[] = [
    { id: 'date', header: 'Date', cell: (row) => row.date || '—' },
    {
      id: 'ledger_name',
      header: 'Ledger',
      cellClassName: 'font-medium',
      cell: (row) => row.ledger_name || String(row.ledger_id),
    },
    {
      id: 'dc',
      header: 'Dr/Cr',
      cell: (row) => row.dc.toUpperCase(),
    },
    {
      id: 'amount',
      header: 'Amount',
      cellClassName: 'tabular-nums text-right',
      cell: (row) => formatAmount(parseAmount(row.amount)),
    },
    {
      id: 'narration',
      header: 'Narration',
      cellClassName: 'text-muted-foreground',
      cell: (row) => row.narration || '—',
    },
    {
      id: 'status',
      header: 'Status',
      cell: (row) =>
        row.is_reconciled ? `Reconciled (${row.reconciliation_date || '—'})` : 'Open',
    },
  ];

  return (
    <ModuleListPack
      title="Reconciliation"
      description="Mark or clear reconciliation dates on bank/cash ledger entry items."
      isLoading={isLoading}
      loadingMessage="Loading reconciliation items..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && items.length === 0}
      emptyTitle="No items"
      emptyDescription="Enable reconciliation on ledgers and post journal entries to see items here."
      actions={
        <div className="flex flex-wrap items-end gap-3">
          <FormField label="Ledger" htmlFor="recon-ledger">
            <Select
              id="recon-ledger"
              value={ledgerId > 0 ? String(ledgerId) : ''}
              onChange={(e) => setLedgerId(Number(e.target.value) || 0)}
              options={ledgerOptions}
            />
          </FormField>
          <FormField label="Reconciliation date" htmlFor="recon-date">
            <Input
              id="recon-date"
              type="date"
              value={reconDate}
              onChange={(e) => setReconDate(e.target.value)}
            />
          </FormField>
          <Button
            type="button"
            variant="outline"
            onClick={() => setAppliedLedgerId(ledgerId > 0 ? ledgerId : undefined)}
          >
            Apply filter
          </Button>
        </div>
      }
    >
      <DataTable
        data={items}
        columns={columns}
        getRowKey={(row) => row.item_id}
        actions={(row) =>
          row.is_reconciled ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={updateMutation.isPending}
              onClick={() =>
                updateMutation.mutate({ item_id: row.item_id, reconciliation_date: null })
              }
            >
              Clear
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={updateMutation.isPending || !reconDate}
              onClick={() =>
                updateMutation.mutate({
                  item_id: row.item_id,
                  reconciliation_date: reconDate,
                })
              }
            >
              Mark
            </Button>
          )
        }
      />
    </ModuleListPack>
  );
}
