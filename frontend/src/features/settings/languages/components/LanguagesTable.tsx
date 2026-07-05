import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { StatusBadge } from '@components/feedback/StatusBadge';
import { Pagination } from '@components/ui';
import type { Language } from '@app-types/settings/language';
import { formatDate } from '@utils/format';

interface LanguagesTableProps {
  languages: Language[];
  totalCount: number;
  page: number;
  onPageChange: (page: number) => void;
  onEdit: (language: Language) => void;
  onDelete: (language: Language) => void;
}

function localeLabel(language: Language): string {
  return `${language.short_code}-${language.country_code}`;
}

const columns: DataTableColumn<Language>[] = [
  {
    id: 'language',
    header: 'Language',
    cellClassName: 'font-medium',
    cell: (row) => row.language,
  },
  {
    id: 'locale',
    header: 'Locale',
    cell: (row) => (
      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{localeLabel(row)}</code>
    ),
  },
  {
    id: 'rtl',
    header: 'RTL',
    cell: (row) =>
      row.is_rtl ? (
        <Badge variant="secondary">RTL</Badge>
      ) : (
        <span className="text-muted-foreground">LTR</span>
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

export function LanguagesTable({ 
  languages, 
  totalCount,
  page,
  onPageChange,
  onEdit, 
  onDelete 
}: LanguagesTableProps) {
  return (
    <div className="space-y-4">
      <DataTable
        data={languages}
        columns={columns}
        getRowKey={(language) => language.id}
        actions={(language) => {
          const isActive = language.is_active === 'yes';
          return (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(language)}
                aria-label={`Edit ${language.language}`}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={isActive}
                onClick={() => onDelete(language)}
                aria-label={`Delete ${language.language}`}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          );
        }}
      />
      <Pagination
        currentPage={page}
        totalPages={Math.ceil(totalCount / 20)}
        onPageChange={onPageChange}
      />
    </div>
  );
}
