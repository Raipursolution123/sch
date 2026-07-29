import { useState } from 'react';
import { Printer, CreditCard, DollarSign } from 'lucide-react';
import { PermissionButton } from '@components/rbac/PermissionButton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@components/ui/table';
import { Select } from '@components/ui/select';
import { FormField } from '@components/forms/FormField';
import { useStaffPayroll, useGeneratePayslip } from '@hooks/useStaff';
import { StaffPayslipModal } from '@features/staff/components/StaffPayslipModal';
import { ModuleListPack } from '@workflow-packs';

const MONTHS = [
  { value: 'January', label: 'January' },
  { value: 'February', label: 'February' },
  { value: 'March', label: 'March' },
  { value: 'April', label: 'April' },
  { value: 'May', label: 'May' },
  { value: 'June', label: 'June' },
  { value: 'July', label: 'July' },
  { value: 'August', label: 'August' },
  { value: 'September', label: 'September' },
  { value: 'October', label: 'October' },
  { value: 'November', label: 'November' },
  { value: 'December', label: 'December' },
];

const YEARS = [
  { value: '2025', label: '2025' },
  { value: '2026', label: '2026' },
];

const PAYMENT_MODES = [
  { value: 'Cash', label: 'Cash' },
  { value: 'Bank Transfer', label: 'Bank Transfer' },
  { value: 'Cheque', label: 'Cheque' },
  { value: 'Online / UPI', label: 'Online / UPI' },
];

export function StaffPayrollPage() {
  const [month, setMonth] = useState<string>('July');
  const [year, setYear] = useState<string>('2026');
  const [selectedModes, setSelectedModes] = useState<Record<number, string>>({});
  const [printRecord, setPrintRecord] = useState<any | null>(null);

  const { data: payrollRes, isLoading, isError, error, refetch } = useStaffPayroll(month, year);
  const generateMutation = useGeneratePayslip();

  const payrollList = payrollRes?.results || [];

  const handleModeChange = (staffId: number, modeVal: string) => {
    setSelectedModes((prev) => ({ ...prev, [staffId]: modeVal }));
  };

  const handleGeneratePayslip = (item: any) => {
    const paymentMode = selectedModes[item.staff_id] || 'Cash';
    generateMutation.mutate({
      staff_id: item.staff_id,
      month,
      year,
      basic_salary: item.basic_salary,
      payment_mode: paymentMode,
    });
  };

  return (
    <ModuleListPack
      title="Staff Payroll"
      description="Generate monthly payslips, manage salary calculations, and view payment status."
      isLoading={isLoading}
      loadingMessage="Loading staff payroll records..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && payrollList.length === 0}
      emptyTitle="No staff payroll records found"
      emptyDescription="No active staff members available for payroll calculation."
      footer={
        <StaffPayslipModal
          open={printRecord !== null}
          onOpenChange={(open) => {
            if (!open) setPrintRecord(null);
          }}
          record={printRecord}
        />
      }
    >
      {/* Filters Toolbar */}
      <div className="mb-4 flex items-center justify-between rounded-md border bg-card p-4">
        <div className="flex items-center gap-4">
          <div className="w-44">
            <FormField label="Select Month" htmlFor="payroll_month">
              <Select
                id="payroll_month"
                options={MONTHS}
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              />
            </FormField>
          </div>
          <div className="w-36">
            <FormField label="Select Year" htmlFor="payroll_year">
              <Select
                id="payroll_year"
                options={YEARS}
                value={year}
                onChange={(e) => setYear(e.target.value)}
              />
            </FormField>
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          Showing salary records for{' '}
          <strong className="text-foreground">
            {month} {year}
          </strong>
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Staff ID</TableHead>
              <TableHead>Staff Name</TableHead>
              <TableHead>Employee Code</TableHead>
              <TableHead>Basic Salary</TableHead>
              <TableHead>Payment Mode</TableHead>
              <TableHead>Net Payable</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payrollList.map((item) => {
              const isPaid = item.status === 'paid';
              const currentMode = selectedModes[item.staff_id] || item.payment_mode || 'Cash';

              return (
                <TableRow key={item.staff_id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {item.staff_id}
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <span>{item.staff_name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{item.employee_id || '—'}</TableCell>
                  <TableCell className="font-mono">
                    ₹{item.basic_salary?.toLocaleString()}
                  </TableCell>
                  <TableCell className="w-40">
                    {isPaid ? (
                      <span className="font-mono text-xs font-semibold uppercase text-primary">
                        {item.payment_mode || 'Cash'}
                      </span>
                    ) : (
                      <Select
                        options={PAYMENT_MODES}
                        value={currentMode}
                        onChange={(e) => handleModeChange(item.staff_id, e.target.value)}
                      />
                    )}
                  </TableCell>
                  <TableCell className="font-mono font-semibold text-emerald-700">
                    ₹{item.net_salary?.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${
                        isPaid
                          ? 'border border-emerald-200 bg-emerald-100 text-emerald-800'
                          : 'border border-amber-200 bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isPaid ? 'Paid' : 'Unpaid'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {isPaid ? (
                        <PermissionButton
                          permission="staff.view"
                          variant="outline"
                          size="sm"
                          onClick={() => setPrintRecord(item)}
                          className="gap-1"
                        >
                          <Printer className="h-3.5 w-3.5" />
                          Print Payslip
                        </PermissionButton>
                      ) : (
                        <PermissionButton
                          permission="staff.edit"
                          size="sm"
                          onClick={() => handleGeneratePayslip(item)}
                          isLoading={generateMutation.isPending}
                          className="gap-1"
                        >
                          <DollarSign className="h-3.5 w-3.5" />
                          Generate Payslip
                        </PermissionButton>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </ModuleListPack>
  );
}
