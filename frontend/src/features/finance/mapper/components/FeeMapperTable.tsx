import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@components/ui/button';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import type { FeeHeadMapper, Ledger } from '@app-types/finance';
import type { FeeType } from '@app-types/fees/fee-type';

interface FeeMapperTableProps {
  rows: FeeHeadMapper[];
  ledgers: Ledger[];
  feeTypes: FeeType[];
  onEdit: (row: FeeHeadMapper) => void;
  onDelete: (row: FeeHeadMapper) => void;
}

function ledgerLabel(ledgers: Ledger[], id: number): string {
  const ledger = ledgers.find((l) => l.id === id);
  if (!ledger) return `Ledger #${id}`;
  return ledger.code ? `${ledger.name} (${ledger.code})` : ledger.name;
}

function feeHeadLabel(feeTypes: FeeType[], id: number): string {
  return feeTypes.find((f) => f.id === id)?.name ?? `Fee head #${id}`;
}

export function FeeMapperTable({ rows, ledgers, feeTypes, onEdit, onDelete }: FeeMapperTableProps) {
  const columns: DataTableColumn<FeeHeadMapper>[] = [
    {
      id: 'head',
      header: 'Fee head',
      cellClassName: 'font-medium',
      cell: (row) => feeHeadLabel(feeTypes, row.head_id),
    },
    {
      id: 'ledger',
      header: 'Ledger',
      cell: (row) => ledgerLabel(ledgers, row.ledger_id),
    },
    {
      id: 'ids',
      header: 'IDs',
      cellClassName: 'text-muted-foreground text-xs font-mono',
      cell: (row) => `head=${row.head_id} · ledger=${row.ledger_id}`,
    },
  ];

  return (
    <DataTable
      data={rows}
      columns={columns}
      getRowKey={(row) => row.fhl_id}
      actions={(row) => (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(row)}
            aria-label={`Edit mapper ${row.fhl_id}`}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(row)}
            aria-label={`Delete mapper ${row.fhl_id}`}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </>
      )}
    />
  );
}
