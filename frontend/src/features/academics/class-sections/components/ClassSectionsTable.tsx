import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@components/ui/button';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { StatusBadge } from '@components/feedback/StatusBadge';
import type { ClassSection } from '@app-types/academics/class-section';
import { formatDate } from '@utils/format';

interface ClassSectionsTableProps {
  classSections: ClassSection[];
  onEdit: (classSection: ClassSection) => void;
  onDelete: (classSection: ClassSection) => void;
}

const columns: DataTableColumn<ClassSection>[] = [
  {
    id: 'class_name',
    header: 'Class',
    cellClassName: 'font-medium',
    cell: (row) => row.class_name,
  },
  {
    id: 'section_name',
    header: 'Section',
    cell: (row) => (
      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">{row.section_name}</code>
    ),
  },
  {
    id: 'label',
    header: 'Display',
    cell: (row) => (
      <span className="text-muted-foreground">
        {row.class_name} — {row.section_name}
      </span>
    ),
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

export function ClassSectionsTable({ classSections, onEdit, onDelete }: ClassSectionsTableProps) {
  return (
    <DataTable
      data={classSections}
      columns={columns}
      getRowKey={(classSection) => classSection.id}
      actions={(classSection) => {
        const isActive = classSection.is_active === 'yes';
        return (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(classSection)}
              aria-label={`Edit ${classSection.class_name} ${classSection.section_name}`}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={isActive}
              onClick={() => onDelete(classSection)}
              aria-label={`Delete ${classSection.class_name} ${classSection.section_name}`}
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
