import { Badge } from '@components/ui/badge';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import type { ChartOfAccountsRow } from '@features/finance/chart-of-accounts/types';
import { formatAmount } from '@utils/format';

interface ChartOfAccountsTableProps {
  rows: ChartOfAccountsRow[];
}

export function ChartOfAccountsTable({ rows }: ChartOfAccountsTableProps) {
  const columns: DataTableColumn<ChartOfAccountsRow>[] = [
    {
      id: 'account',
      header: 'Account',
      cell: (row) =>
        row.kind === 'group' ? (
          <div className="font-semibold">{row.name}</div>
        ) : (
          <div className="pl-6">{row.name}</div>
        ),
    },
    {
      id: 'code',
      header: 'Code',
      cellClassName: 'font-mono text-xs text-muted-foreground',
      cell: (row) => row.code || '—',
    },
    {
      id: 'type',
      header: 'Type',
      cell: (row) =>
        row.kind === 'group' ? (
          <Badge variant="secondary">Group</Badge>
        ) : (
          <Badge variant="outline">Ledger</Badge>
        ),
    },
    {
      id: 'balance',
      header: 'Opening',
      cellClassName: 'tabular-nums',
      cell: (row) => {
        if (row.kind === 'group') {
          return (
            <span className="text-muted-foreground">
              {row.ledger_count} ledger{row.ledger_count === 1 ? '' : 's'}
            </span>
          );
        }
        const amount = Number(row.op_balance) || 0;
        return `${formatAmount(amount)} ${row.op_balance_dc === 'C' ? 'Cr' : 'Dr'}`;
      },
    },
    {
      id: 'parent',
      header: 'Group',
      cellClassName: 'text-muted-foreground',
      cell: (row) => (row.kind === 'ledger' ? row.group_name : '—'),
    },
  ];

  return <DataTable data={rows} columns={columns} getRowKey={(row) => row.id} />;
}
