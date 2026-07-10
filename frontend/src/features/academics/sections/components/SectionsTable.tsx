import { Pencil, Trash2 } from 'lucide-react';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { StatusBadge } from '@components/feedback/StatusBadge';
import type { Section } from '@app-types/academics/section';
import type { DataTablePaginationConfig } from '@components/data/data-table-types';
import { formatDate } from '@utils/format';

interface SectionsTableProps {
  sections: Section[];
  pagination: DataTablePaginationConfig;
  onEdit: (section: Section) => void;
  onDelete: (section: Section) => void;
}

const columns: DataTableColumn<Section>[] = [
  {
    id: 'section_name',
    header: 'Section',
    enableSorting: true,
    sortValue: (row) => row.section_name,
    cellClassName: 'font-medium',
    cell: (row) => (
      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">{row.section_name}</code>
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
    enableSorting: true,
    sortValue: (row) => row.created_at,
    cellClassName: 'text-muted-foreground',
    cell: (row) => formatDate(row.created_at),
  },
];

export function SectionsTable({ sections, pagination, onEdit, onDelete }: SectionsTableProps) {
  return (
    <DataTable
      data={sections}
      columns={columns}
      getRowKey={(section) => section.id}
      enableSorting
      showDensityToggle
      pagination={pagination}
      actions={(section) => {
        const isActive = section.is_active === 'yes';
        return (
          <>
            <PermissionButton
              permission="academics.manage"
              variant="ghost"
              size="sm"
              onClick={() => onEdit(section)}
              aria-label={`Edit section ${section.section_name}`}
            >
              <Pencil className="h-4 w-4" />
            </PermissionButton>
            <PermissionButton
              permission="academics.manage"
              variant="ghost"
              size="sm"
              disabled={isActive}
              onClick={() => onDelete(section)}
              aria-label={`Delete section ${section.section_name}`}
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
