import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useCreateLedger } from '@/hooks/useLedgers';
import { useFeeTypes } from '@/hooks/useFeeTypes';
import type { LedgerCreatePayload } from '@/types/finance';

interface LedgerCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LedgerCreateDialog = ({ open, onOpenChange }: LedgerCreateDialogProps) => {
  const { mutate: createLedger, isPending } = useCreateLedger();
  const { data: feeTypesData } = useFeeTypes();

  const [name, setName] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [groupId, setGroupId] = useState<string>('1');
  const [opBalance, setOpBalance] = useState<string>('0.00');
  const [opBalanceDc, setOpBalanceDc] = useState<'D' | 'C'>('D');
  const [notes, setNotes] = useState<string>('');

  const [type, setType] = useState<string>('0');
  const [reconciliation, setReconciliation] = useState<string>('0');
  const [feeTypes, setFeeTypes] = useState<string[]>([]);
  const [isLinkToTransportFee, setIsLinkToTransportFee] = useState<string>('0');
  const [incomeHeadId, setIncomeHeadId] = useState<string>('');
  const [expensesHeadId, setExpensesHeadId] = useState<string>('');
  const [isLinkToPayroll, setIsLinkToPayroll] = useState<string>('0');

  useEffect(() => {
    if (open) {
      setName('');
      setCode('');
      setGroupId('1');
      setOpBalance('0.00');
      setOpBalanceDc('D');
      setNotes('');
      setType('0');
      setReconciliation('0');
      setFeeTypes([]);
      setIsLinkToTransportFee('0');
      setIncomeHeadId('');
      setExpensesHeadId('');
      setIsLinkToPayroll('0');
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: LedgerCreatePayload = {
      name,
      code: code || undefined,
      group_id: parseInt(groupId, 10) || 1,
      op_balance: opBalance || undefined,
      op_balance_dc: opBalanceDc as any,
      notes: notes || undefined,
      type: parseInt(type, 10) || 0,
      reconciliation: parseInt(reconciliation, 10) || 0,
      feetype_id: feeTypes.length > 0 ? parseInt(feeTypes[0], 10) : undefined,
      fee_types:
        feeTypes.length > 0
          ? JSON.stringify(
              feeTypes.map((val) => {
                const ft = feeTypesData?.find((f: any) => String(f.id) === val);
                return ft ? ft.name : val;
              }),
            )
          : undefined,
      is_link_to_transport_fee: parseInt(isLinkToTransportFee, 10) || 0,
      income_head_id: incomeHeadId ? parseInt(incomeHeadId, 10) : undefined,
      expenses_head_id: expensesHeadId ? parseInt(expensesHeadId, 10) : undefined,
      is_link_to_payroll: parseInt(isLinkToPayroll, 10) || 0,
    };

    createLedger(payload, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Create Ledger</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter ledger name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Code</Label>
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter ledger code"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="group_id">Group ID *</Label>
              <Input
                id="group_id"
                type="number"
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
                placeholder="Enter group ID"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Input
                id="type"
                type="number"
                value={type}
                onChange={(e) => setType(e.target.value)}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="op_balance">Opening Balance</Label>
              <Input
                id="op_balance"
                type="number"
                step="0.01"
                value={opBalance}
                onChange={(e) => setOpBalance(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="op_balance_dc">Debit/Credit</Label>
              <Select
                id="op_balance_dc"
                value={opBalanceDc}
                onChange={(e) => setOpBalanceDc(e.target.value as 'D' | 'C')}
                options={[
                  { value: 'D', label: 'Debit (Dr)' },
                  { value: 'C', label: 'Credit (Cr)' },
                ]}
              />
            </div>

            <div className="space-y-2">
              <Label>Fee Types</Label>
              <details className="group relative rounded-md border border-input bg-transparent text-sm shadow-sm focus-within:ring-1 focus-within:ring-ring hover:bg-accent/50">
                <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-2 outline-none">
                  <span className="truncate">
                    {feeTypes.length > 0 ? (
                      `${feeTypes.length} selected`
                    ) : (
                      <span className="text-muted-foreground">Select Fee Types...</span>
                    )}
                  </span>
                  <span className="opacity-50 transition-transform group-open:rotate-180">▼</span>
                </summary>
                <div className="absolute left-0 top-full z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-md border bg-popover p-2 text-popover-foreground shadow-md">
                  {feeTypesData?.length ? (
                    feeTypesData.map((ft: any) => (
                      <div
                        key={ft.id}
                        className="flex cursor-pointer items-center space-x-2 rounded px-1 py-1.5 hover:bg-accent hover:text-accent-foreground"
                      >
                        <Checkbox
                          id={`create-feetype-${ft.id}`}
                          checked={
                            feeTypes.includes(String(ft.id)) ||
                            (ft.name && feeTypes.includes(ft.name))
                          }
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFeeTypes((prev) => [...prev, String(ft.id)]);
                            } else {
                              setFeeTypes((prev) =>
                                prev.filter((val) => val !== String(ft.id) && val !== ft.name),
                              );
                            }
                          }}
                        />
                        <label
                          htmlFor={`create-feetype-${ft.id}`}
                          className="flex-1 cursor-pointer truncate"
                        >
                          {ft.name || `Type ${ft.id}`}
                        </label>
                      </div>
                    ))
                  ) : (
                    <div className="p-2 text-center text-muted-foreground">No fee types found</div>
                  )}
                </div>
              </details>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reconciliation">Reconciliation</Label>
              <Select
                id="reconciliation"
                value={reconciliation}
                onChange={(e) => setReconciliation(e.target.value)}
                options={[
                  { value: '0', label: 'No' },
                  { value: '1', label: 'Yes' },
                ]}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="is_link_to_transport_fee">Link to Transport Fee</Label>
              <Select
                id="is_link_to_transport_fee"
                value={isLinkToTransportFee}
                onChange={(e) => setIsLinkToTransportFee(e.target.value)}
                options={[
                  { value: '0', label: 'No' },
                  { value: '1', label: 'Yes' },
                ]}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="is_link_to_payroll">Link to Payroll</Label>
              <Select
                id="is_link_to_payroll"
                value={isLinkToPayroll}
                onChange={(e) => setIsLinkToPayroll(e.target.value)}
                options={[
                  { value: '0', label: 'No' },
                  { value: '1', label: 'Yes' },
                ]}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="income_head_id">Income Head ID</Label>
              <Input
                id="income_head_id"
                type="number"
                value={incomeHeadId}
                onChange={(e) => setIncomeHeadId(e.target.value)}
                placeholder="Optional"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expenses_head_id">Expenses Head ID</Label>
              <Input
                id="expenses_head_id"
                type="number"
                value={expensesHeadId}
                onChange={(e) => setExpensesHeadId(e.target.value)}
                placeholder="Optional"
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Creating...' : 'Create Ledger'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
