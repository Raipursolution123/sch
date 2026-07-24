import { useMemo } from 'react';
import { ReportSummaryGrid } from '@components/reports';
import { TrialBalanceTable } from '@features/reports/finance/components/TrialBalanceTable';
import { useTrialBalance } from '@hooks/useTrialBalance';
import { exportToCsv } from '@utils/export-csv';
import { formatAmount } from '@utils/format';
import { printReport } from '@utils/print-report';
import { ModuleReportPack } from '@workflow-packs';

function parseAmount(value: number | string): number {
  const num = typeof value === 'string' ? Number(value) : value;
  return Number.isFinite(num) ? num : 0;
}

export function IncomeExpenseReportPage() {
  const { data: report, isLoading, isError, error, refetch } = useTrialBalance({}, true);
  const rows = report?.rows ?? [];

  const totals = useMemo(() => {
    if (report?.totals) {
      return {
        totalDr: parseAmount(report.totals.total_dr),
        totalCr: parseAmount(report.totals.total_cr),
      };
    }
    const totalDr = rows.reduce((sum, row) => sum + parseAmount(row.total_dr), 0);
    const totalCr = rows.reduce((sum, row) => sum + parseAmount(row.total_cr), 0);
    return { totalDr, totalCr };
  }, [report, rows]);

  const handleExportCsv = () => {
    exportToCsv(
      'trial-balance-report',
      ['Ledger', 'Debit', 'Credit'],
      rows.map((row) => [
        row.ledger_name,
        String(parseAmount(row.total_dr)),
        String(parseAmount(row.total_cr)),
      ]),
    );
  };

  return (
    <ModuleReportPack
      title="Income & Expense Report"
      description="Trial balance summary across finance ledgers (income and expense accounts)."
      printTitle="Trial Balance Report"
      onPrint={printReport}
      onExportCsv={handleExportCsv}
      exportDisabled={rows.length === 0}
      submitted
      hasData={rows.length > 0}
      isLoading={isLoading}
      loadingMessage="Loading trial balance..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && rows.length === 0}
      emptyTitle="No ledger data"
      emptyDescription="Create ledgers and journal entries to generate a trial balance."
      summary={
        rows.length > 0 ? (
          <ReportSummaryGrid
            items={[
              { label: 'Ledgers', value: rows.length },
              { label: 'Total debit', value: formatAmount(totals.totalDr) },
              { label: 'Total credit', value: formatAmount(totals.totalCr) },
            ]}
          />
        ) : undefined
      }
      filters={
        <p className="col-span-full text-sm text-muted-foreground">
          Generated from current ledger balances.
        </p>
      }
    >
      {rows.length > 0 && <TrialBalanceTable rows={rows} />}
    </ModuleReportPack>
  );
}
