import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@components/ui/button';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { StatusBadge } from '@components/feedback/StatusBadge';
import type { FeeGroup } from '@app-types/fees/fee-group';
import { formatDate } from '@utils/format';

interface FeeGroupsTableProps {
  feeGroups: FeeGroup[];
  onEdit: (feeGroup: FeeGroup) => void;
  onDelete: (feeGroup: FeeGroup) => void;
}

const columns: DataTableColumn<FeeGroup>[] = [
  {
    id: 'name',
    header: 'Name',
    cellClassName: 'font-medium',
    cell: (row) => row.name,
  },
  {
    id: 'description',
    header: 'Description',
    cellClassName: 'text-muted-foreground max-w-xs truncate',
    cell: (row) => row.description ?? '—',
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

export function FeeGroupsTable({ feeGroups, onEdit, onDelete }: FeeGroupsTableProps) {
  return (
    <DataTable
      data={feeGroups}
      columns={columns}
      getRowKey={(feeGroup) => feeGroup.id}
      actions={(feeGroup) => {
        const isActive = feeGroup.is_active === 'yes';
        return (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(feeGroup)}
              aria-label={`Edit ${feeGroup.name}`}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={isActive}
              onClick={() => onDelete(feeGroup)}
              aria-label={`Delete ${feeGroup.name}`}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        );
      }}
    />
  );
}
