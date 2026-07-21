import { useState } from 'react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useJournalEntries, useDeleteJournalEntry } from '@/hooks/useJournalEntries';
import { useEntryTypes } from '@/hooks/useEntryTypes';
import { Trash2, Pencil } from 'lucide-react';
import type { JournalEntry } from '@/types/finance';
import { JournalEntryUpdateDialog } from './JournalEntryUpdateDialog';

const formatDate = (dateString: string | Date) => {
  const d = new Date(dateString);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${day}/${month}/${year}`;
};

export const JournalEntriesTable = () => {
  const [page, setPage] = useState(1);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const { data, isLoading } = useJournalEntries(page);
  const { data: entryTypes } = useEntryTypes();
  const { mutate: deleteEntry } = useDeleteJournalEntry();

  const getEntryTypeName = (id?: number | null) => {
    if (id == null) return '-';
    return entryTypes?.find((type) => type.id === id)?.name || id;
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const entries = data?.results || [];

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Number</TableHead>
              <TableHead>Entry Type</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="text-right">Total Debit</TableHead>
              <TableHead className="text-right">Total Credit</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  No journal entries found.
                </TableCell>
              </TableRow>
            ) : (
              entries.map((entry: JournalEntry) => (
                <TableRow key={entry.id}>
                  <TableCell>{formatDate(entry.date)}</TableCell>
                  <TableCell>{entry.number || '-'}</TableCell>
                  <TableCell>{getEntryTypeName(entry.entrytype_id)}</TableCell>
                  <TableCell>{entry.notes || '-'}</TableCell>
                  <TableCell className="text-right font-medium text-green-600">
                    {Number(entry.dr_total).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right font-medium text-red-600">
                    {Number(entry.cr_total).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedEntry(entry);
                        setIsUpdateDialogOpen(true);
                      }}
                      className="mr-2"
                    >
                      <Pencil className="h-4 w-4 text-blue-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this entry?')) {
                          deleteEntry(entry.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {page} of {Math.ceil((data?.count || 0) / 10) || 1}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => p + 1)}
          disabled={!data?.next}
        >
          Next
        </Button>
      </div>

      <JournalEntryUpdateDialog
        open={isUpdateDialogOpen}
        onOpenChange={setIsUpdateDialogOpen}
        entry={selectedEntry}
      />
    </div>
  );
};
