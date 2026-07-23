import { useMemo, useState } from 'react';
import { FormField } from '@components/forms/FormField';
import { ReportSummaryGrid } from '@components/reports';
import { Input } from '@components/ui/input';
import { TrialBalanceTable } from '@features/reports/finance/components/TrialBalanceTable';
import { useTrialBalanceReport } from '@hooks/useFinanceReports';
import { exportToCsv } from '@utils/export-csv';
import { formatAmount } from '@utils/format';
import { printReport } from '@utils/print-report';
import { ModuleReportPack } from '@workflow-packs';

function parseAmount(value: number | string): number {
  const num = typeof value === 'string' ? Number(value) : value;
  return Number.isFinite(num) ? num : 0;
}

export function TrialBalancePage() {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [applied, setApplied] = useState({ from_date: '', to_date: '' });

  const filters = useMemo(
    () => ({
      ...(applied.from_date ? { from_date: applied.from_date } : {}),
      ...(applied.to_date ? { to_date: applied.to_date } : {}),
    }),
    [applied],
  );

  const { data: report, isLoading, isError, error, refetch } = useTrialBalanceReport(filters);
  const rows = report?.rows ?? [];
  const totalDr = parseAmount(report?.totals?.total_dr ?? 0);
  const totalCr = parseAmount(report?.totals?.total_cr ?? 0);

  const handleExportCsv = () => {
    exportToCsv(
      'trial-balance',
      ['Ledger', 'Group', 'Debit', 'Credit', 'Closing Dr', 'Closing Cr'],
      rows.map((row) => [
        row.ledger_name,
        row.group_name || '',
        String(parseAmount(row.total_dr)),
        String(parseAmount(row.total_cr)),
        String(parseAmount(row.closing_dr ?? 0)),
        String(parseAmount(row.closing_cr ?? 0)),
      ]),
    );
  };

  return (
    <ModuleReportPack
      title="Trial Balance"
      description="Debit and credit totals by ledger for the selected period."
      printTitle="Trial Balance"
      onPrint={printReport}
      onExportCsv={handleExportCsv}
      exportDisabled={rows.length === 0}
      onApply={() => setApplied({ from_date: fromDate, to_date: toDate })}
      submitted
      hasData={rows.length > 0 || isLoading}
      isLoading={isLoading}
      loadingMessage="Loading trial balance..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && rows.length === 0}
      emptyTitle="No balances"
      emptyDescription="No ledger activity for this date range."
      filters={
        <>
          <FormField label="From date" htmlFor="tb-from">
            <Input
              id="tb-from"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </FormField>
          <FormField label="To date" htmlFor="tb-to">
            <Input
              id="tb-to"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </FormField>
        </>
      }
      summary={
        rows.length > 0 ? (
          <ReportSummaryGrid
            items={[
              { label: 'Ledgers', value: rows.length },
              { label: 'Total debit', value: formatAmount(totalDr) },
              { label: 'Total credit', value: formatAmount(totalCr) },
            ]}
          />
        ) : undefined
      }
    >
      {rows.length > 0 && <TrialBalanceTable rows={rows} showGroup showClosing />}
    </ModuleReportPack>
  );
}
