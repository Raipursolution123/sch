import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { financialReportService } from '@/services/api';
import type { FinancialReportResponse } from '@/types/financial-report';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ModuleReportPack } from '@workflow-packs';
import { ReportSummaryGrid, type ReportSummaryItem } from '@components/reports/ReportSummaryGrid';

export const FinancialReportPage: React.FC = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<FinancialReportResponse | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isStudentFeesExpanded, setIsStudentFeesExpanded] = useState(false);
  const [isStaffPayrollExpanded, setIsStaffPayrollExpanded] = useState(false);

  const fetchReport = async () => {
    if (!startDate || !endDate) {
      toast.error('Please select both start and end dates.');
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const data = await financialReportService.getFinancialReport(startDate, endDate);
      setReport(data);
    } catch (err: any) {
      setError(err);
      toast.error('Failed to fetch financial report.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const summaryItems: ReportSummaryItem[] = report
    ? [
        { label: 'Total Revenue', value: `₹${report.revenue.total.toFixed(2)}`, tone: 'default' },
        {
          label: 'Total Expenditures',
          value: `₹${report.expenditures.total.toFixed(2)}`,
          tone: 'default',
        },
        {
          label: report.is_profitable ? 'Net Profit' : 'Net Loss',
          value: `₹${Math.abs(report.net_profit).toFixed(2)}`,
          tone: report.is_profitable ? 'success' : 'destructive',
        },
      ]
    : [];

  return (
    <ModuleReportPack
      title="Financial Report"
      description="Generate a Profit & Loss statement for a specific period."
      onApply={fetchReport}
      applyDisabled={loading}
      isLoading={loading}
      isError={!!error}
      error={error}
      submitted={hasSearched}
      hasData={!!report}
      filters={
        <div className="flex flex-col items-end gap-4 sm:flex-row">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="start-date">Start Date</Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="grid flex-1 gap-2">
            <Label htmlFor="end-date">End Date</Label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      }
      summary={report ? <ReportSummaryGrid items={summaryItems} /> : undefined}
    >
      {report && (
        <div className="mt-8 grid gap-8 md:grid-cols-2">
          {/* Detailed Revenue */}
          <div className="rounded-lg border border-border/70 bg-card p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-card-foreground">Revenue Breakdown</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">General Income</span>
                <span className="font-medium">₹{report.revenue.general_income.toFixed(2)}</span>
              </div>
              <div className="flex flex-col">
                <div
                  className="-mx-1 flex cursor-pointer items-center justify-between rounded p-1 transition-colors hover:bg-muted/50"
                  onClick={() => setIsStudentFeesExpanded(!isStudentFeesExpanded)}
                >
                  <span className="flex items-center gap-1 text-muted-foreground">
                    Student Fees
                    {isStudentFeesExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </span>
                  <span className="font-medium">
                    ₹{report.revenue.student_fees.total.toFixed(2)}
                  </span>
                </div>
                {isStudentFeesExpanded && (
                  <div className="ml-2 mt-2 space-y-2 border-l-2 border-muted pl-4">
                    {Object.entries(report.revenue.student_fees.breakdown).map(
                      ([feeName, amount]) => (
                        <div key={feeName} className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">{feeName}</span>
                          <span className="font-medium text-muted-foreground">
                            ₹{amount.toFixed(2)}
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                )}
              </div>
              <div className="mt-3 flex items-center justify-between border-t pt-3 text-base font-bold">
                <span>Total Revenue</span>
                <span>₹{report.revenue.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Detailed Expenditures */}
          <div className="rounded-lg border border-border/70 bg-card p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-card-foreground">
              Expenditure Breakdown
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">General Expenses</span>
                <span className="font-medium">
                  ₹{report.expenditures.general_expenses.toFixed(2)}
                </span>
              </div>
              <div className="flex flex-col">
                <div
                  className="-mx-1 flex cursor-pointer items-center justify-between rounded p-1 transition-colors hover:bg-muted/50"
                  onClick={() => setIsStaffPayrollExpanded(!isStaffPayrollExpanded)}
                >
                  <span className="flex items-center gap-1 text-muted-foreground">
                    Staff Payroll
                    {isStaffPayrollExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </span>
                  <span className="font-medium">
                    ₹{report.expenditures.staff_payroll.total.toFixed(2)}
                  </span>
                </div>
                {isStaffPayrollExpanded && (
                  <div className="ml-2 mt-2 space-y-2 border-l-2 border-muted pl-4">
                    {Object.entries(report.expenditures.staff_payroll.breakdown).map(
                      ([staffName, amount]) => (
                        <div key={staffName} className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">{staffName}</span>
                          <span className="font-medium text-muted-foreground">
                            ₹{amount.toFixed(2)}
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                )}
              </div>
              <div className="mt-3 flex items-center justify-between border-t pt-3 text-base font-bold">
                <span>Total Expenditures</span>
                <span>₹{report.expenditures.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </ModuleReportPack>
  );
};
