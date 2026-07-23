import { useMemo, useState } from 'react';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { FormField } from '@components/forms/FormField';
import { ReportSummaryGrid } from '@components/reports';
import { Input } from '@components/ui/input';
import { useProfitLossReport } from '@hooks/useFinanceReports';
import type { ProfitLossLine } from '@app-types/finance';
import { exportToCsv } from '@utils/export-csv';
import { formatAmount } from '@utils/format';
import { printReport } from '@utils/print-report';
import { ModuleReportPack } from '@workflow-packs';

function parseAmount(value: number | string): number {
  const num = typeof value === 'string' ? Number(value) : value;
  return Number.isFinite(num) ? num : 0;
}

const lineColumns: DataTableColumn<ProfitLossLine>[] = [
  {
    id: 'ledger_name',
    header: 'Ledger',
    cellClassName: 'font-medium',
    cell: (row) => row.ledger_name,
  },
  {
    id: 'group_name',
    header: 'Group',
    cellClassName: 'text-muted-foreground',
    cell: (row) => row.group_name || '—',
  },
  {
    id: 'amount',
    header: 'Amount',
    cellClassName: 'tabular-nums text-right',
    cell: (row) => formatAmount(parseAmount(row.amount)),
  },
];

export function ProfitLossPage() {
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

  const { data: report, isLoading, isError, error, refetch } = useProfitLossReport(filters);
  const income = report?.income ?? [];
  const expenses = report?.expenses ?? [];
  const hasData = income.length > 0 || expenses.length > 0;

  const handleExportCsv = () => {
    exportToCsv(
      'profit-loss',
      ['Side', 'Ledger', 'Group', 'Amount'],
      [
        ...income.map((row) => [
          'Income',
          row.ledger_name,
          row.group_name || '',
          String(parseAmount(row.amount)),
        ]),
        ...expenses.map((row) => [
          'Expense',
          row.ledger_name,
          row.group_name || '',
          String(parseAmount(row.amount)),
        ]),
      ],
    );
  };

  return (
    <ModuleReportPack
      title="Profit & Loss"
      description="Income and expenses for the selected period."
      printTitle="Profit & Loss"
      onPrint={printReport}
      onExportCsv={handleExportCsv}
      exportDisabled={!hasData}
      onApply={() => setApplied({ from_date: fromDate, to_date: toDate })}
      submitted
      hasData={hasData || isLoading}
      isLoading={isLoading}
      loadingMessage="Loading profit & loss..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && !hasData}
      emptyTitle="No P&L data"
      emptyDescription="Classify ledgers under income or expense groups to populate this report."
      filters={
        <>
          <FormField label="From date" htmlFor="pl-from">
            <Input
              id="pl-from"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </FormField>
          <FormField label="To date" htmlFor="pl-to">
            <Input
              id="pl-to"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </FormField>
        </>
      }
      summary={
        hasData ? (
          <ReportSummaryGrid
            items={[
              {
                label: 'Total income',
                value: formatAmount(parseAmount(report?.totals?.total_income ?? 0)),
              },
              {
                label: 'Total expenses',
                value: formatAmount(parseAmount(report?.totals?.total_expenses ?? 0)),
              },
              {
                label: 'Gross profit',
                value: formatAmount(parseAmount(report?.totals?.gross_profit ?? 0)),
              },
              {
                label: 'Net profit',
                value: formatAmount(parseAmount(report?.totals?.net_profit ?? 0)),
              },
            ]}
          />
        ) : undefined
      }
    >
      <div className="space-y-8">
        {income.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Income
            </h2>
            <DataTable data={income} columns={lineColumns} getRowKey={(row) => row.ledger_id} />
          </section>
        )}
        {expenses.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Expenses
            </h2>
            <DataTable data={expenses} columns={lineColumns} getRowKey={(row) => row.ledger_id} />
          </section>
        )}
      </div>
    </ModuleReportPack>
  );
}
