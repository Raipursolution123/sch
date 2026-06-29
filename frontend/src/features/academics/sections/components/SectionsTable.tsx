import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@components/ui/button';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { StatusBadge } from '@components/feedback/StatusBadge';
import type { Section } from '@app-types/academics/section';
import { formatDate } from '@utils/format';

interface SectionsTableProps {
  sections: Section[];
  onEdit: (section: Section) => void;
  onDelete: (section: Section) => void;
}

const columns: DataTableColumn<Section>[] = [
  {
    id: 'section_name',
    header: 'Section',
    cellClassName: 'font-medium',
    cell: (row) => (
      <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{row.section_name}</code>
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

export function SectionsTable({ sections, onEdit, onDelete }: SectionsTableProps) {
  return (
    <DataTable
      data={sections}
      columns={columns}
      getRowKey={(section) => section.id}
      actions={(section) => {
        const isActive = section.is_active === 'yes';
        return (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(section)}
              aria-label={`Edit section ${section.section_name}`}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={isActive}
              onClick={() => onDelete(section)}
              aria-label={`Delete section ${section.section_name}`}
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
