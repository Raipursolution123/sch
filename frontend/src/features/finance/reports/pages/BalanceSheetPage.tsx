import { useState } from 'react';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { FormField } from '@components/forms/FormField';
import { ReportSummaryGrid } from '@components/reports';
import { Input } from '@components/ui/input';
import { useBalanceSheetReport } from '@hooks/useFinanceReports';
import type { BalanceSheetLine } from '@app-types/finance';
import { exportToCsv } from '@utils/export-csv';
import { formatAmount } from '@utils/format';
import { printReport } from '@utils/print-report';
import { ModuleReportPack } from '@workflow-packs';

function parseAmount(value: number | string): number {
  const num = typeof value === 'string' ? Number(value) : value;
  return Number.isFinite(num) ? num : 0;
}

const lineColumns: DataTableColumn<BalanceSheetLine>[] = [
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

export function BalanceSheetPage() {
  const [asOf, setAsOf] = useState('');
  const [appliedAsOf, setAppliedAsOf] = useState('');

  const {
    data: report,
    isLoading,
    isError,
    error,
    refetch,
  } = useBalanceSheetReport(appliedAsOf || undefined);
  const assets = report?.assets ?? [];
  const liabilities = report?.liabilities ?? [];
  const hasData = assets.length > 0 || liabilities.length > 0;

  const handleExportCsv = () => {
    exportToCsv(
      'balance-sheet',
      ['Side', 'Ledger', 'Group', 'Amount'],
      [
        ...assets.map((row) => [
          'Asset',
          row.ledger_name,
          row.group_name || '',
          String(parseAmount(row.amount)),
        ]),
        ...liabilities.map((row) => [
          'Liability',
          row.ledger_name,
          row.group_name || '',
          String(parseAmount(row.amount)),
        ]),
      ],
    );
  };

  return (
    <ModuleReportPack
      title="Balance Sheet"
      description="Assets and liabilities as of the selected date."
      printTitle="Balance Sheet"
      onPrint={printReport}
      onExportCsv={handleExportCsv}
      exportDisabled={!hasData}
      onApply={() => setAppliedAsOf(asOf)}
      submitted
      hasData={hasData || isLoading}
      isLoading={isLoading}
      loadingMessage="Loading balance sheet..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && !hasData}
      emptyTitle="No balance sheet data"
      emptyDescription="Classify ledgers under asset or liability groups to populate this report."
      filters={
        <FormField label="As of" htmlFor="bs-as-of">
          <Input id="bs-as-of" type="date" value={asOf} onChange={(e) => setAsOf(e.target.value)} />
        </FormField>
      }
      summary={
        hasData ? (
          <ReportSummaryGrid
            items={[
              {
                label: 'Assets',
                value: formatAmount(parseAmount(report?.totals?.assets ?? 0)),
              },
              {
                label: 'Liabilities',
                value: formatAmount(parseAmount(report?.totals?.liabilities ?? 0)),
              },
              {
                label: 'Difference',
                value: formatAmount(parseAmount(report?.totals?.difference ?? 0)),
              },
            ]}
          />
        ) : undefined
      }
    >
      <div className="space-y-8">
        {assets.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Assets
            </h2>
            <DataTable data={assets} columns={lineColumns} getRowKey={(row) => row.ledger_id} />
          </section>
        )}
        {liabilities.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Liabilities
            </h2>
            <DataTable
              data={liabilities}
              columns={lineColumns}
              getRowKey={(row) => row.ledger_id}
            />
          </section>
        )}
      </div>
    </ModuleReportPack>
  );
}
