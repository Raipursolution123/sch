import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog';
import { Badge } from '@components/ui/badge';
import type { EntryType, JournalEntry, Ledger } from '@app-types/finance';
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

            <div className="overflow-x-auto rounded-md border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2">Ledger</th>
                    <th className="px-3 py-2">Dr/Cr</th>
                    <th className="px-3 py-2 text-right">Amount</th>
                    <th className="px-3 py-2">Narration</th>
                  </tr>
                </thead>
                <tbody>
                  {(entry.items ?? []).map((item, idx) => (
                    <tr key={item.id ?? idx} className="border-t">
                      <td className="px-3 py-2">{ledgerName(ledgers, item.ledger_id)}</td>
                      <td className="px-3 py-2 uppercase">{item.dc}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{item.amount}</td>
                      <td className="px-3 py-2 text-muted-foreground">{item.narration || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
