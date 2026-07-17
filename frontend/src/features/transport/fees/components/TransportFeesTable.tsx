import { Pencil, Trash2 } from 'lucide-react';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { PermissionButton } from '@components/rbac/PermissionButton';
import type { TransportFeeMaster } from '@app-types/transport';
import { formatDate } from '@utils/format';

interface Props {
  fees: TransportFeeMaster[];
  onEdit: (fee: TransportFeeMaster) => void;
  onDelete: (fee: TransportFeeMaster) => void;
}

const columns: DataTableColumn<TransportFeeMaster>[] = [
  { id: 'month', header: 'Month', cellClassName: 'font-medium', cell: (row) => row.month ?? '—' },
  { id: 'session', header: 'Session ID', cell: (row) => row.session_id },
  {
    id: 'due',
    header: 'Due date',
    cell: (row) => (row.due_date ? formatDate(row.due_date) : '—'),
  },
  { id: 'fine', header: 'Fine amount', cell: (row) => row.fine_amount ?? '—' },
  { id: 'type', header: 'Fine type', cell: (row) => row.fine_type ?? '—' },
];

export function TransportFeesTable({ fees, onEdit, onDelete }: Props) {
  return (
    <DataTable
      data={fees}
      columns={columns}
      getRowKey={(row) => row.id}
      actions={(row) => (
        <>
          <PermissionButton
            permission="transport.edit"
            variant="ghost"
            size="sm"
            onClick={() => onEdit(row)}
            aria-label={`Edit ${row.month ?? 'transport fee'}`}
          >
            <Pencil className="h-4 w-4" />
          </PermissionButton>
          <PermissionButton
            permission="transport.delete"
            variant="ghost"
            size="sm"
            onClick={() => onDelete(row)}
            className="text-destructive hover:text-destructive"
            aria-label={`Delete ${row.month ?? 'transport fee'}`}
          >
            <Trash2 className="h-4 w-4" />
          </PermissionButton>
        </>
      )}
    />
  );
}
