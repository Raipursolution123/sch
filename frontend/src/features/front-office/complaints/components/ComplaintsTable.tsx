import { Pencil, Trash2 } from 'lucide-react';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import type { Complaint } from '@app-types/front-office/complaint';
import { formatDate } from '@utils/format';

interface ComplaintsTableProps {
  complaints: Complaint[];
  onEdit: (complaint: Complaint) => void;
  onDelete: (complaint: Complaint) => void;
}

const columns: DataTableColumn<Complaint>[] = [
  {
    id: 'name',
    header: 'Complainant',
    cellClassName: 'font-medium',
    cell: (row) => row.name,
  },
  {
    id: 'complaint_type',
    header: 'Type',
    cellClassName: 'text-muted-foreground',
    cell: (row) => row.complaint_type || '—',
  },
  {
    id: 'contact',
    header: 'Contact',
    cell: (row) => row.contact || '—',
  },
  {
    id: 'assigned',
    header: 'Assigned',
    cellClassName: 'text-muted-foreground',
    cell: (row) => row.assigned || '—',
  },
  {
    id: 'date',
    header: 'Date',
    cellClassName: 'text-muted-foreground',
    cell: (row) => formatDate(row.date),
  },
];

export function ComplaintsTable({ complaints, onEdit, onDelete }: ComplaintsTableProps) {
  return (
    <DataTable
      data={complaints}
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
