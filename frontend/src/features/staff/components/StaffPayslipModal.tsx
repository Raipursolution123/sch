import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@components/ui/dialog';
import { Button } from '@components/ui/button';
import { Printer, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface StaffPayslipModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: {
    staff_id: number;
    staff_name: string;
    employee_id: string;
    basic_salary: number;
    net_salary: number;
    status: string;
    month: string;
    year: string;
    payment_mode: string;
    payment_date?: string;
  } | null;
}

export function StaffPayslipModal({ open, onOpenChange, record }: StaffPayslipModalProps) {
  if (!record) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Official Staff Salary Payslip
          </DialogTitle>
        </DialogHeader>

        <div className="my-2 rounded-lg border-2 border-primary/20 bg-white p-6 font-sans text-gray-900 shadow-md">
          {/* Header */}
          <div className="mb-4 flex items-center justify-between border-b-2 border-primary pb-3">
            <div>
              <h2 className="text-xl font-bold uppercase text-primary">
                SPRINGFIELD PUBLIC SCHOOL
              </h2>
              <p className="text-xs font-semibold text-muted-foreground">
                SALARY PAYSLIP FOR {record.month.toUpperCase()} {record.year}
              </p>
            </div>
            <span className="flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {record.status.toUpperCase()}
            </span>
          </div>

          {/* Staff Details Grid */}
          <div className="mb-6 grid grid-cols-2 gap-4 rounded border bg-muted/20 p-3 text-xs">
            <div>
              <span className="block text-[10px] font-semibold uppercase text-gray-500">
                Staff Name
              </span>
              <span className="text-sm font-bold text-gray-900">{record.staff_name}</span>
            </div>
            <div>
              <span className="block text-[10px] font-semibold uppercase text-gray-500">
                Employee ID
              </span>
              <span className="font-mono font-semibold text-gray-900">{record.employee_id}</span>
            </div>
            <div>
              <span className="block text-[10px] font-semibold uppercase text-gray-500">
                Pay Period
              </span>
              <span className="font-semibold text-gray-900">
                {record.month} {record.year}
              </span>
            </div>
            <div>
              <span className="block text-[10px] font-semibold uppercase text-gray-500">
                Payment Mode
              </span>
              <span className="font-bold uppercase text-primary">
                {record.payment_mode || 'Cash'}
              </span>
            </div>
          </div>

          {/* Salary Breakup Table */}
          <div className="mb-6 overflow-hidden rounded border">
            <table className="w-full text-left text-xs">
              <thead className="border-b bg-gray-100 font-semibold">
                <tr>
                  <th className="p-2">Description</th>
                  <th className="p-2 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="p-2 font-medium">Basic Pay / Monthly Salary</td>
                  <td className="p-2 text-right font-mono">
                    ₹{record.basic_salary?.toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">Allowances & Bonuses</td>
                  <td className="p-2 text-right font-mono text-emerald-700">+ ₹0</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">Deductions (EPF / Tax)</td>
                  <td className="p-2 text-right font-mono text-destructive">- ₹0</td>
                </tr>
                <tr className="border-t border-primary/20 bg-primary/5 font-bold">
                  <td className="p-2 text-primary">Net Salary Paid ({record.payment_mode})</td>
                  <td className="p-2 text-right font-mono text-sm font-bold text-emerald-700">
                    ₹{record.net_salary?.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Signatures */}
          <div className="flex justify-between border-t border-gray-200 pt-6 text-[10px] text-gray-500">
            <div className="w-28 border-t border-gray-400 pt-1 text-center">
              <span>Employee Signature</span>
            </div>
            <div className="w-28 border-t border-gray-400 pt-1 text-center">
              <span>Accounts Authority</span>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" />
            Print Official Payslip
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
