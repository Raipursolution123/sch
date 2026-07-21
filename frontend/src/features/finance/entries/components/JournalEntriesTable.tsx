import { Badge } from '@components/ui/badge';
import { Button } from '@components/ui/button';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { Pagination } from '@components/ui';
import { Eye, Trash2 } from 'lucide-react';
import type { EntryType, JournalEntry } from '@app-types/finance';
import { formatDate } from '@utils/format';

interface JournalEntriesTableProps {
  entries: JournalEntry[];
  entryTypes: EntryType[];
  totalCount: number;
  page: number;
  onPageChange: (page: number) => void;
  onView: (entry: JournalEntry) => void;
  onDelete: (entry: JournalEntry) => void;
}

function typeLabel(entryTypes: EntryType[], id: number): string {
  return entryTypes.find((t) => t.id === id)?.name ?? `Type #${id}`;
}

export function JournalEntriesTable({
  entries,
  entryTypes,
  totalCount,
  page,
  onPageChange,
  onView,
  onDelete,
}: JournalEntriesTableProps) {
  const columns: DataTableColumn<JournalEntry>[] = [
    {
      id: 'date',
      header: 'Date',
      cell: (row) => formatDate(row.date),
    },
    {
      id: 'number',
      header: 'No.',
      cell: (row) => row.number ?? '—',
    },
    {
      id: 'type',
      header: 'Type',
      cell: (row) => typeLabel(entryTypes, row.entrytype_id),
    },
    {
      id: 'notes',
      header: 'Notes',
      cellClassName: 'max-w-[220px] truncate',
      cell: (row) => row.notes || '—',
    },
    {
      id: 'totals',
      header: 'Dr / Cr',
      cell: (row) => (
        <div className="flex flex-wrap gap-1">
          <Badge variant="secondary">Dr {row.dr_total}</Badge>
          <Badge variant="outline">Cr {row.cr_total}</Badge>
        </div>
      ),
    },
    {
      id: 'lines',
      header: 'Lines',
      cell: (row) => row.items?.length ?? 0,
    },
  ];

  return (
    <div className="space-y-4">
      <DataTable
        data={entries}
        columns={columns}
        getRowKey={(row) => row.id}
        actions={(row) => (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onView(row)}
              aria-label={`View entry ${row.id}`}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(row)}
              aria-label={`Delete entry ${row.id}`}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
      />
      <Pagination
        currentPage={page}
        totalPages={Math.max(1, Math.ceil(totalCount / 20))}
        onPageChange={onPageChange}
      />
    </div>
  );
}
