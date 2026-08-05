import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@components/ui/dialog';
import { Button } from '@components/ui/button';
import { Printer, Receipt } from 'lucide-react';
import type { FeeReceipt } from '@app-types/fees/fee-receipt';
import { formatAmount, formatDate } from '@utils/format';
import { formatClassSection } from '@utils/student';

interface FeeReceiptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receipt: FeeReceipt | null;
}

export function FeeReceiptModal({ open, onOpenChange, receipt }: FeeReceiptModalProps) {
  if (!receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  const receiptLabel = receipt.receipt_no != null ? String(receipt.receipt_no) : receipt.payment_id;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl print:max-w-none print:border-0 print:shadow-none">
        <DialogHeader className="print:hidden">
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            Fee Receipt
          </DialogTitle>
        </DialogHeader>

        <div className="rounded-lg border-2 border-primary/20 bg-white p-6 font-sans text-gray-900 shadow-md print:border print:shadow-none">
          <div className="mb-4 flex items-start justify-between border-b-2 border-primary pb-3">
            <div>
              <h2 className="text-xl font-bold uppercase tracking-wide text-primary">
                Fee Payment Receipt
              </h2>
              <p className="text-xs font-semibold text-muted-foreground">
                Official payment acknowledgement
              </p>
            </div>
            <div className="text-right">
              <span className="block text-[10px] font-semibold uppercase text-gray-500">
                Receipt No.
              </span>
              <span className="font-mono text-sm font-bold text-primary">{receiptLabel}</span>
            </div>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-3 rounded border bg-muted/20 p-3 text-xs">
            <div>
              <span className="block text-[10px] font-semibold uppercase text-gray-500">
                Student
              </span>
              <span className="text-sm font-bold text-gray-900">{receipt.full_name}</span>
            </div>
            <div>
              <span className="block text-[10px] font-semibold uppercase text-gray-500">
                Admission No.
              </span>
              <span className="font-mono font-semibold text-gray-900">
                {receipt.admission_no || '—'}
              </span>
            </div>
            <div>
              <span className="block text-[10px] font-semibold uppercase text-gray-500">
                Class / Section
              </span>
              <span className="font-semibold text-gray-900">
                {formatClassSection(receipt.class_name, receipt.section_name)}
              </span>
            </div>
            <div>
              <span className="block text-[10px] font-semibold uppercase text-gray-500">
                Payment Date
              </span>
              <span className="font-semibold text-gray-900">{formatDate(receipt.date)}</span>
            </div>
          </div>

          <div className="mb-4 overflow-hidden rounded border">
            <table className="w-full text-left text-xs">
              <thead className="border-b bg-gray-100 font-semibold text-gray-700">
                <tr>
                  <th className="p-2">Particulars</th>
                  <th className="p-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="p-2">
                    <div className="font-medium text-gray-900">
                      {receipt.feetype_name ?? 'Fee payment'}
                    </div>
                    {receipt.description ? (
                      <div className="text-[11px] text-muted-foreground">{receipt.description}</div>
                    ) : null}
                  </td>
                  <td className="p-2 text-right font-mono font-semibold">
                    {formatAmount(receipt.amount)}
                  </td>
                </tr>
                <tr className="bg-primary/5 font-bold">
                  <td className="p-2 text-primary">Total Paid ({receipt.payment_mode})</td>
                  <td className="p-2 text-right font-mono text-sm text-emerald-700">
                    {formatAmount(receipt.amount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {receipt.collected_by ? (
            <p className="text-[11px] text-muted-foreground">
              Collected by:{' '}
              <span className="font-medium text-foreground">{receipt.collected_by}</span>
            </p>
          ) : null}
        </div>

        <DialogFooter className="print:hidden">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button type="button" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print Receipt
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
