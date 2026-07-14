import { Pencil, Trash2 } from 'lucide-react';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { StatusBadge } from '@components/feedback/StatusBadge';
import type { FeeDiscount } from '@app-types/fees/fee-discount';
import { formatAmount, formatDate } from '@utils/format';

interface FeeDiscountsTableProps {
  discounts: FeeDiscount[];
  onEdit: (discount: FeeDiscount) => void;
  onDelete: (discount: FeeDiscount) => void;
}

function formatDiscountValue(row: FeeDiscount): string {
  if (row.type === 'percentage') {
    return row.percentage != null ? `${row.percentage}%` : '—';
  }
  return row.amount != null ? formatAmount(row.amount) : '—';
}

const columns: DataTableColumn<FeeDiscount>[] = [
  {
    id: 'name',
    header: 'Name',
    cellClassName: 'font-medium',
    cell: (row) => (
      <div>
        <span>{row.name}</span>
        <p className="text-xs font-normal text-muted-foreground">{row.code}</p>
      </div>
    ),
  },
  {
    id: 'session',
    header: 'Session',
    cellClassName: 'text-muted-foreground',
    cell: (row) => row.session_name ?? '—',
  },
  {
    id: 'type',
    header: 'Type',
    cellClassName: 'capitalize text-muted-foreground',
    cell: (row) => row.type || '—',
  },
  {
    id: 'value',
    header: 'Value',
    cellClassName: 'tabular-nums',
    cell: (row) => formatDiscountValue(row),
  },
  {
    id: 'status',
    header: 'Status',
    cell: (row) => <StatusBadge isActive={row.is_active} />,
  },
  {
    id: 'created',
    header: 'Created',
    cellClassName: 'text-muted-foreground',
    cell: (row) => formatDate(row.created_at),
  },
];

export function FeeDiscountsTable({ discounts, onEdit, onDelete }: FeeDiscountsTableProps) {
  return (
    <DataTable
      data={discounts}
      columns={columns}
      getRowKey={(discount) => discount.id}
      actions={(discount) => {
        const isActive = discount.is_active === 'yes';
        return (
          <>
            <PermissionButton
              permission="fees.manage"
              variant="ghost"
              size="sm"
              onClick={() => onEdit(discount)}
              aria-label={`Edit ${discount.name}`}
            >
              <Pencil className="h-4 w-4" />
            </PermissionButton>
            <PermissionButton
              permission="fees.manage"
              variant="ghost"
              size="sm"
              disabled={isActive}
              onClick={() => onDelete(discount)}
              aria-label={`Delete ${discount.name}`}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </PermissionButton>
          </>
        );
      }}
    />
  );
}
