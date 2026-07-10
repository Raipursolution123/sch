import { Pencil, Trash2 } from 'lucide-react';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { StatusBadge } from '@components/feedback/StatusBadge';
import type { FeeType } from '@app-types/fees/fee-type';
import { formatDate } from '@utils/format';

interface FeeTypesTableProps {
  feeTypes: FeeType[];
  onEdit: (feeType: FeeType) => void;
  onDelete: (feeType: FeeType) => void;
}

const columns: DataTableColumn<FeeType>[] = [
  {
    id: 'code',
    header: 'Code',
    cell: (row) => (
      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{row.code}</code>
    ),
  },
  {
    id: 'name',
    header: 'Name',
    cellClassName: 'font-medium',
    cell: (row) => row.name,
  },
  {
    id: 'category',
    header: 'Category',
    cellClassName: 'text-muted-foreground',
    cell: (row) => row.category_name ?? '—',
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

export function FeeTypesTable({ feeTypes, onEdit, onDelete }: FeeTypesTableProps) {
  return (
    <DataTable
      data={feeTypes}
      columns={columns}
      getRowKey={(feeType) => feeType.id}
      actions={(feeType) => {
        const isActive = feeType.is_active === 'yes';
        return (
          <>
            <PermissionButton
              permission="fees.manage"
              variant="ghost"
              size="sm"
              onClick={() => onEdit(feeType)}
              aria-label={`Edit ${feeType.name}`}
            >
              <Pencil className="h-4 w-4" />
            </PermissionButton>
            <PermissionButton
              permission="fees.manage"
              variant="ghost"
              size="sm"
              disabled={isActive}
              onClick={() => onDelete(feeType)}
              aria-label={`Delete ${feeType.name}`}
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
