import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';

import { useCreateJournalEntry } from '@/hooks/useJournalEntries';
import { useEntryTypes } from '@/hooks/useEntryTypes';
import { useLedgers } from '@/hooks/useLedgers';

import type { JournalEntryCreatePayload } from '@/types/finance';
interface JournalEntryCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getTodayFormatted = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

interface ItemRow {
  id: string;
  ledger_id: string;
  amount: string;
  dc: 'D' | 'C';
  narration: string;
}

export const JournalEntryCreateDialog = ({ open, onOpenChange }: JournalEntryCreateDialogProps) => {
  const { mutate: createEntry, isPending } = useCreateJournalEntry();
  const { data: entryTypes } = useEntryTypes();
  const { data: ledgersData } = useLedgers(); // Note: fetches full list of ledgers for dropdown

  const [date, setDate] = useState<string>(getTodayFormatted());
  const [entryTypeId, setEntryTypeId] = useState<string>('');
  const [number, setNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const [items, setItems] = useState<ItemRow[]>([
    {
      id: Math.random().toString(36).substring(7),
      ledger_id: '',
      amount: '0.00',
      dc: 'D',
      narration: '',
    },
    {
      id: Math.random().toString(36).substring(7),
      ledger_id: '',
      amount: '0.00',
      dc: 'C',
      narration: '',
    },
  ]);

  useEffect(() => {
    if (open) {
      setDate(getTodayFormatted());
      setEntryTypeId('');
      setNumber('');
      setNotes('');
      setItems([
        {
          id: Math.random().toString(36).substring(7),
          ledger_id: '',
          amount: '0.00',
          dc: 'D',
          narration: '',
        },
        {
          id: Math.random().toString(36).substring(7),
          ledger_id: '',
          amount: '0.00',
          dc: 'C',
          narration: '',
        },
      ]);
    }
  }, [open]);

  const totalDebit = items.reduce(
    (sum, item) => (item.dc === 'D' ? sum + Number(item.amount || 0) : sum),
    0,
  );
  const totalCredit = items.reduce(
    (sum, item) => (item.dc === 'C' ? sum + Number(item.amount || 0) : sum),
    0,
  );

  const isBalanced = totalDebit > 0 && Math.abs(totalDebit - totalCredit) < 0.01;
  const isFormValid = date && items.every((i) => i.ledger_id && Number(i.amount) > 0) && isBalanced;

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: Math.random().toString(36).substring(7),
        ledger_id: '',
        amount: '0.00',
        dc: 'D',
        narration: '',
      },
    ]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 2) return; // Minimum 2 lines
    setItems(items.filter((item) => item.id !== id));
  };

  const handleItemChange = (id: string, field: keyof ItemRow, value: string) => {
    setItems(
      items.map((item) => (item.id === id ? ({ ...item, [field]: value } as ItemRow) : item)),
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    const payload: JournalEntryCreatePayload = {
      entrytype_id: entryTypeId ? parseInt(entryTypeId, 10) : null,
      number: number ? parseInt(number, 10) : undefined,
      date,
      notes,
      items: items.map((i) => ({
        ledger_id: parseInt(i.ledger_id, 10),
        amount: i.amount,
        dc: i.dc,
        narration: i.narration,
      })),
    };

    createEntry(payload, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Create Journal Entry</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="number">Number</Label>
              <Input
                id="number"
                type="number"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder="Optional"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="entry_type">Entry Type</Label>
              <Select
                id="entry_type"
                value={entryTypeId}
                onChange={(e) => setEntryTypeId(e.target.value)}
                options={[
                  { value: '', label: 'Select Entry Type' },
                  ...(entryTypes?.map((type) => ({ value: String(type.id), label: type.name })) ||
                    []),
                ]}
              />
            </div>
            <div className="col-span-3 space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Entry description..."
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold">Ledger Items *</Label>
              <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
                <Plus className="mr-2 h-4 w-4" /> Add Line
              </Button>
            </div>

            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.id} className="flex items-start gap-2 rounded-md border p-3">
                  <div className="w-1/3">
                    <Label className="text-xs">Ledger</Label>
                    <Select
                      value={item.ledger_id}
                      onChange={(e) => handleItemChange(item.id, 'ledger_id', e.target.value)}
                      options={[
                        { value: '', label: 'Select Ledger' },
                        ...(ledgersData?.map((ledger) => ({
                          value: String(ledger.id),
                          label: ledger.name,
                        })) || []),
                      ]}
                      required
                    />
                  </div>
                  <div className="w-24">
                    <Label className="text-xs">Type</Label>
                    <Select
                      value={item.dc}
                      onChange={(e) => handleItemChange(item.id, 'dc', e.target.value)}
                      options={[
                        { value: 'D', label: 'Dr' },
                        { value: 'C', label: 'Cr' },
                      ]}
                      required
                    />
                  </div>
                  <div className="w-32">
                    <Label className="text-xs">Amount</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.amount}
                      onChange={(e) => handleItemChange(item.id, 'amount', e.target.value)}
                    />
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs">Narration</Label>
                    <Input
                      value={item.narration}
                      onChange={(e) => handleItemChange(item.id, 'narration', e.target.value)}
                      placeholder="Line note..."
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="mt-6"
                    onClick={() => handleRemoveItem(item.id)}
                    disabled={items.length <= 2}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-6 rounded-md bg-muted p-4 text-sm">
              <div className="font-semibold">
                Total Debit:{' '}
                <span
                  className={
                    Math.abs(totalDebit - totalCredit) >= 0.01 ? 'text-red-500' : 'text-green-600'
                  }
                >
                  {totalDebit.toFixed(2)}
                </span>
              </div>
              <div className="font-semibold">
                Total Credit:{' '}
                <span
                  className={
                    Math.abs(totalDebit - totalCredit) >= 0.01 ? 'text-red-500' : 'text-green-600'
                  }
                >
                  {totalCredit.toFixed(2)}
                </span>
              </div>
            </div>
            {Math.abs(totalDebit - totalCredit) >= 0.01 && (
              <p className="text-right text-sm text-red-500">Debits and Credits must be equal.</p>
            )}
          </div>

          <div className="flex justify-end gap-4 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !isFormValid}>
              {isPending ? 'Saving...' : 'Save Entry'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
