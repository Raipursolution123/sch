import { Pencil, Trash2 } from 'lucide-react';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { Badge } from '@components/ui/badge';
import type { Enquiry } from '@app-types/front-office/enquiry';
import { formatDate } from '@utils/format';

interface EnquiriesTableProps {
  enquiries: Enquiry[];
  onEdit: (enquiry: Enquiry) => void;
  onDelete: (enquiry: Enquiry) => void;
}

const columns: DataTableColumn<Enquiry>[] = [
  {
    id: 'name',
    header: 'Name',
    cellClassName: 'font-medium',
    cell: (row) => row.name,
  },
  {
    id: 'contact',
    header: 'Contact',
    cell: (row) => row.contact,
  },
  {
    id: 'source',
    header: 'Source',
    cellClassName: 'text-muted-foreground',
    cell: (row) => row.source || '—',
  },
  {
    id: 'status',
    header: 'Status',
    cell: (row) => (
      <Badge variant={row.status.toLowerCase() === 'active' ? 'success' : 'muted'}>
        {row.status}
      </Badge>
    ),
  },
  {
    id: 'follow_up_date',
    header: 'Follow-up',
    cellClassName: 'text-muted-foreground',
    cell: (row) => formatDate(row.follow_up_date),
  },
  {
    id: 'created_at',
    header: 'Created',
    cellClassName: 'text-muted-foreground',
    cell: (row) => formatDate(row.created_at),
  },
];

export function EnquiriesTable({ enquiries, onEdit, onDelete }: EnquiriesTableProps) {
  return (
    <DataTable
      data={enquiries}
      columns={columns}
      getRowKey={(row) => row.id}
      actions={(row) => (
        <>
          <PermissionButton
            permission="staff.edit"
            variant="ghost"
            size="sm"
            onClick={() => onEdit(row)}
            aria-label={`Edit ${row.name}`}
          >
            <Pencil className="h-4 w-4" />
          </PermissionButton>
          <PermissionButton
            permission="staff.delete"
            variant="ghost"
            size="sm"
            onClick={() => onDelete(row)}
            aria-label={`Delete ${row.name}`}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </PermissionButton>
        </>
      )}
    />
  );
}
