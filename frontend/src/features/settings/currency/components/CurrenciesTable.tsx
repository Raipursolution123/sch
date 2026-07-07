import { Pencil, Trash2, Zap } from 'lucide-react';
import { Button } from '@components/ui/button';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { StatusBadge } from '@components/feedback/StatusBadge';
import { Pagination } from '@components/ui';
import type { Currency } from '@app-types/settings/currency';
import { formatDate } from '@utils/format';

interface CurrenciesTableProps {
  currencies: Currency[];
  totalCount: number;
  page: number;
  onPageChange: (page: number) => void;
  onEdit: (currency: Currency) => void;
  onActivate: (currency: Currency) => void;
  onDelete: (currency: Currency) => void;
}

const columns: DataTableColumn<Currency>[] = [
  {
    id: 'name',
    header: 'Name',
    cellClassName: 'font-medium',
    cell: (row) => row.name,
  },
  {
    id: 'short_name',
    header: 'Code',
    cell: (row) => (
      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{row.short_name}</code>
    ),
  },
  {
    id: 'symbol',
    header: 'Symbol',
    cell: (row) => <span className="text-base">{row.symbol}</span>,
  },
  {
    id: 'base_price',
    header: 'Base price',
    cellClassName: 'text-muted-foreground',
    cell: (row) => row.base_price,
  },
  {
    id: 'status',
    header: 'Status',
    cell: (row) => <StatusBadge isActive={row.is_active ? 'yes' : 'no'} />,
  },
  {
    id: 'created',
    header: 'Created',
    cellClassName: 'text-muted-foreground',
    cell: (row) => formatDate(row.created_at),
  },
];

export function CurrenciesTable({
  currencies,
  totalCount,
  page,
  onPageChange,
  onEdit,
  onActivate,
  onDelete,
}: CurrenciesTableProps) {
  return (
    <div className="space-y-4">
      <DataTable
        data={currencies}
        columns={columns}
        getRowKey={(currency) => currency.id}
        actions={(currency) => {
          const isActive = currency.is_active;
          return (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(currency)}
                aria-label={`Edit ${currency.short_name}`}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={isActive}
                onClick={() => onActivate(currency)}
                aria-label={`Activate ${currency.short_name}`}
              >
                <Zap className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={isActive}
                onClick={() => onDelete(currency)}
                aria-label={`Delete ${currency.short_name}`}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          );
        }}
      />

      <Pagination
        currentPage={page}
        totalPages={Math.ceil(totalCount / 20)}
        onPageChange={onPageChange}
      />
    </div>
  );
}
