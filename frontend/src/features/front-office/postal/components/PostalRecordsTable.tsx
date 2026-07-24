import { Pencil, Trash2 } from 'lucide-react';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import type { PostalRecord } from '@app-types/front-office/postal';
import { formatDate } from '@utils/format';

interface PostalRecordsTableProps {
  records: PostalRecord[];
  onEdit: (record: PostalRecord) => void;
  onDelete: (record: PostalRecord) => void;
}

const columns: DataTableColumn<PostalRecord>[] = [
  {
    id: 'reference_no',
    header: 'Reference',
    cellClassName: 'font-medium',
    cell: (row) => row.reference_no,
  },
  {
    id: 'to_title',
    header: 'To',
    cell: (row) => row.to_title,
  },
  {
    id: 'from_title',
    header: 'From',
    cellClassName: 'text-muted-foreground',
    cell: (row) => row.from_title || '—',
  },
  {
    id: 'date',
    header: 'Date',
    cellClassName: 'text-muted-foreground',
    cell: (row) => (row.date ? formatDate(row.date) : '—'),
  },
  {
    id: 'note',
    header: 'Note',
    cellClassName: 'text-muted-foreground',
    cell: (row) => row.note || '—',
  },
];

export function PostalRecordsTable({ records, onEdit, onDelete }: PostalRecordsTableProps) {
  return (
    <DataTable
      data={records}
      columns={columns}
      getRowKey={(row) => row.id}
      actions={(row) => (
        <>
          <PermissionButton
            permission="staff.edit"
            variant="ghost"
            size="sm"
            onClick={() => onEdit(row)}
            aria-label={`Edit ${row.reference_no}`}
          >
            <Pencil className="h-4 w-4" />
          </PermissionButton>
          <PermissionButton
            permission="staff.delete"
            variant="ghost"
            size="sm"
            onClick={() => onDelete(row)}
            aria-label={`Delete ${row.reference_no}`}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </PermissionButton>
        </>
      )}
    />
  );
}
