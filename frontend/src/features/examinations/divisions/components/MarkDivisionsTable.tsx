import { Pencil, Trash2 } from 'lucide-react';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { StatusBadge } from '@components/feedback/StatusBadge';
import type { MarkDivision } from '@app-types/examinations/mark-division';

interface MarkDivisionsTableProps {
  divisions: MarkDivision[];
  onEdit: (division: MarkDivision) => void;
  onDelete: (division: MarkDivision) => void;
}

const columns: DataTableColumn<MarkDivision>[] = [
  {
    id: 'name',
    header: 'Division',
    cellClassName: 'font-medium',
    cell: (row) => row.name ?? '—',
  },
  {
    id: 'range',
    header: 'Percentage',
    cellClassName: 'tabular-nums text-muted-foreground',
    cell: (row) =>
      row.percentage_from != null && row.percentage_to != null
        ? `${row.percentage_from}% – ${row.percentage_to}%`
        : '—',
  },
  {
    id: 'status',
    header: 'Status',
    cell: (row) => <StatusBadge isActive={row.is_active} />,
  },
];

export function MarkDivisionsTable({ divisions, onEdit, onDelete }: MarkDivisionsTableProps) {
  return (
    <DataTable
      data={divisions}
      columns={columns}
      getRowKey={(division) => division.id}
      actions={(division) => {
        const isActive = division.is_active === 'yes';
        return (
          <>
            <PermissionButton
              permission="exams.edit"
              variant="ghost"
              size="sm"
              onClick={() => onEdit(division)}
              aria-label={`Edit ${division.name}`}
            >
              <Pencil className="h-4 w-4" />
            </PermissionButton>
            <PermissionButton
              permission="exams.delete"
              variant="ghost"
              size="sm"
              disabled={isActive}
              onClick={() => onDelete(division)}
              aria-label={`Delete ${division.name}`}
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
