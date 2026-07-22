import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@components/ui/button';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import type { PrintHeaderFooter } from '@/types/settings/print-header-footer';

interface PrintHeaderFooterTableProps {
  templates: PrintHeaderFooter[];
  onEdit: (template: PrintHeaderFooter) => void;
  onDelete: (template: PrintHeaderFooter) => void;
}

const columns: DataTableColumn<PrintHeaderFooter>[] = [
  {
    id: 'print_type',
    header: 'Print Type',
    cellClassName: 'font-medium',
    cell: (row) => row.print_type,
  },
  {
    id: 'header_image',
    header: 'Header Image',
    cell: (row) => (
      <div className="flex items-center space-x-2">
        {row.header_image ? (
          <img
            src={row.header_image}
            alt={row.print_type}
            className="h-10 max-w-[150px] object-contain rounded border bg-muted"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://placehold.co/150x50/png?text=No+Image';
            }}
          />
        ) : (
          <span className="text-muted-foreground text-xs">No image</span>
        )}
      </div>
    ),
  },
  {
    id: 'footer_content',
    header: 'Footer Content',
    cellClassName: 'text-muted-foreground max-w-xs truncate',
    cell: (row) => row.footer_content?.replace(/<[^>]*>/g, '') || '',
  },
];

export function PrintHeaderFooterTable({
  templates,
  onEdit,
  onDelete,
}: PrintHeaderFooterTableProps) {
  return (
    <DataTable
      data={templates}
      columns={columns}
      getRowKey={(template) => template.id}
      actions={(template) => (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(template)}
            aria-label={`Edit ${template.print_type}`}
          >
            <Pencil className="h-4 w-4 text-blue-500" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(template)}
            aria-label={`Delete ${template.print_type}`}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </>
      )}
    />
  );
}
