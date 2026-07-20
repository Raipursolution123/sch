import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import type { TrialBalanceRow } from '@app-types/finance';
import { formatAmount } from '@utils/format';

function toAmount(value: number | string): string {
  const num = typeof value === 'string' ? Number(value) : value;
  return formatAmount(Number.isFinite(num) ? num : 0);
}

interface TrialBalanceTableProps {
  rows: TrialBalanceRow[];
}

export function TrialBalanceTable({ rows }: TrialBalanceTableProps) {
  const columns: DataTableColumn<TrialBalanceRow>[] = [
    {
      id: 'ledger_name',
      header: 'Ledger',
      cellClassName: 'font-medium',
      cell: (row) => row.ledger_name,
    },
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
