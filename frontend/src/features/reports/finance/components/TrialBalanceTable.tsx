import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import type { TrialBalanceRow } from '@app-types/finance';
import { formatAmount } from '@utils/format';

function toAmount(value: number | string | undefined): string {
  if (value === undefined || value === null) return formatAmount(0);
  const num = typeof value === 'string' ? Number(value) : value;
  return formatAmount(Number.isFinite(num) ? num : 0);
}

interface TrialBalanceTableProps {
  rows: TrialBalanceRow[];
  showGroup?: boolean;
  showClosing?: boolean;
}

export function TrialBalanceTable({
  rows,
  showGroup = false,
  showClosing = false,
}: TrialBalanceTableProps) {
  const columns: DataTableColumn<TrialBalanceRow>[] = [
    {
      id: 'ledger_name',
      header: 'Ledger',
      cellClassName: 'font-medium',
      cell: (row) => row.ledger_name,
    },
    ...(showGroup
      ? [
          {
            id: 'group_name',
            header: 'Group',
            cellClassName: 'text-muted-foreground',
            cell: (row: TrialBalanceRow) => row.group_name || '—',
          } satisfies DataTableColumn<TrialBalanceRow>,
        ]
      : []),
    {
      id: 'total_dr',
      header: 'Debit',
      cellClassName: 'tabular-nums text-right',
      cell: (row) => toAmount(row.total_dr),
    },
    {
      id: 'total_cr',
      header: 'Credit',
      cellClassName: 'tabular-nums text-right',
      cell: (row) => toAmount(row.total_cr),
    },
    ...(showClosing
      ? [
          {
            id: 'closing_dr',
            header: 'Closing Dr',
            cellClassName: 'tabular-nums text-right',
            cell: (row: TrialBalanceRow) => toAmount(row.closing_dr),
          } satisfies DataTableColumn<TrialBalanceRow>,
          {
            id: 'closing_cr',
            header: 'Closing Cr',
            cellClassName: 'tabular-nums text-right',
            cell: (row: TrialBalanceRow) => toAmount(row.closing_cr),
          } satisfies DataTableColumn<TrialBalanceRow>,
        ]
      : []),
  ];

  return (
    <DataTable
      columns={columns}
      data={rows}
      getRowKey={(row) => row.ledger_id}
      emptyMessage="No ledger balances found."
    />
  );
}
