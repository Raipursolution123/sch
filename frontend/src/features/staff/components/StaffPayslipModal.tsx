import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@components/ui/dialog';
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

        <div className="p-6 bg-white border-2 border-primary/20 rounded-lg shadow-md font-sans text-gray-900 my-2">
          {/* Header */}
          <div className="border-b-2 border-primary pb-3 mb-4 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold uppercase text-primary">SPRINGFIELD PUBLIC SCHOOL</h2>
              <p className="text-xs text-muted-foreground font-semibold">
                SALARY PAYSLIP FOR {record.month.toUpperCase()} {record.year}
              </p>
            </div>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold rounded-full flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {record.status.toUpperCase()}
            </span>
          </div>

          {/* Staff Details Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs mb-6 bg-muted/20 p-3 rounded border">
            <div>
              <span className="text-gray-500 block text-[10px] uppercase font-semibold">Staff Name</span>
              <span className="font-bold text-sm text-gray-900">{record.staff_name}</span>
            </div>
            <div>
              <span className="text-gray-500 block text-[10px] uppercase font-semibold">Employee ID</span>
              <span className="font-semibold text-gray-900 font-mono">{record.employee_id}</span>
            </div>
            <div>
              <span className="text-gray-500 block text-[10px] uppercase font-semibold">Pay Period</span>
              <span className="font-semibold text-gray-900">{record.month} {record.year}</span>
            </div>
            <div>
              <span className="text-gray-500 block text-[10px] uppercase font-semibold">Payment Mode</span>
              <span className="font-bold text-primary uppercase">{record.payment_mode || 'Cash'}</span>
            </div>
          </div>

          {/* Salary Breakup Table */}
          <div className="border rounded overflow-hidden mb-6">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-100 font-semibold border-b">
                <tr>
                  <th className="p-2">Description</th>
                  <th className="p-2 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="p-2 font-medium">Basic Pay / Monthly Salary</td>
                  <td className="p-2 text-right font-mono">₹{record.basic_salary?.toLocaleString()}</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">Allowances & Bonuses</td>
                  <td className="p-2 text-right font-mono text-emerald-700">+ ₹0</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">Deductions (EPF / Tax)</td>
                  <td className="p-2 text-right font-mono text-destructive">- ₹0</td>
                </tr>
                <tr className="bg-primary/5 font-bold border-t border-primary/20">
                  <td className="p-2 text-primary">Net Salary Paid ({record.payment_mode})</td>
                  <td className="p-2 text-right text-emerald-700 text-sm font-mono font-bold">
                    ₹{record.net_salary?.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Signatures */}
          <div className="pt-6 border-t border-gray-200 flex justify-between text-[10px] text-gray-500">
            <div className="text-center border-t border-gray-400 pt-1 w-28">
              <span>Employee Signature</span>
            </div>
            <div className="text-center border-t border-gray-400 pt-1 w-28">
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
