import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog';
import { Badge } from '@components/ui/badge';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import type { EntryType, JournalEntry, JournalEntryItem, Ledger } from '@app-types/finance';
import { formatDate } from '@utils/format';

interface JournalEntryDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: JournalEntry | null;
  entryTypes: EntryType[];
  ledgers: Ledger[];
}

function ledgerName(ledgers: Ledger[], id: number): string {
  return ledgers.find((l) => l.id === id)?.name ?? `Ledger #${id}`;
}

function typeName(entryTypes: EntryType[], id: number): string {
  return entryTypes.find((t) => t.id === id)?.name ?? `Type #${id}`;
}

export function JournalEntryDetailDialog({
  open,
  onOpenChange,
  entry,
  entryTypes,
  ledgers,
}: JournalEntryDetailDialogProps) {
  const columns: DataTableColumn<JournalEntryItem>[] = [
    {
      id: 'ledger',
      header: 'Ledger',
      cell: (row) => ledgerName(ledgers, row.ledger_id),
    },
    {
      id: 'dc',
      header: 'Dr/Cr',
      cell: (row) => <span className="uppercase">{row.dc}</span>,
    },
    {
      id: 'amount',
      header: 'Amount',
      cellClassName: 'text-right tabular-nums',
      cell: (row) => row.amount,
    },
    {
      id: 'narration',
      header: 'Narration',
      cellClassName: 'text-muted-foreground',
      cell: (row) => row.narration || '—',
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Journal entry #{entry?.id ?? ''}</DialogTitle>
          <DialogDescription>
            {entry
              ? `${formatDate(entry.date)} · ${typeName(entryTypes, entry.entrytype_id)}`
              : 'Entry details'}
          </DialogDescription>
        </DialogHeader>

        {entry ? (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 text-sm">
              <Badge variant="secondary">Dr {entry.dr_total}</Badge>
              <Badge variant="outline">Cr {entry.cr_total}</Badge>
              {entry.number != null ? <Badge variant="outline">No. {entry.number}</Badge> : null}
            </div>
            {entry.notes ? <p className="text-sm text-muted-foreground">{entry.notes}</p> : null}

            <DataTable
              data={entry.items ?? []}
              columns={columns}
              getRowKey={(row) => row.id ?? `${row.ledger_id}-${row.dc}-${row.amount}`}
            />
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
