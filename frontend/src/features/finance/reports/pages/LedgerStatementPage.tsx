import { useMemo, useState } from 'react';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { FormField } from '@components/forms/FormField';
import { ReportSummaryGrid } from '@components/reports';
import { Input } from '@components/ui/input';
import { Select } from '@components/ui/select';
import { useLedgerStatementReport } from '@hooks/useFinanceReports';
import { useLedgersList } from '@hooks/useLedgers';
import type { LedgerStatementLine } from '@app-types/finance';
import { exportToCsv } from '@utils/export-csv';
import { formatAmount } from '@utils/format';
import { printReport } from '@utils/print-report';
import { ModuleReportPack } from '@workflow-packs';

function parseAmount(value: number | string): number {
  const num = typeof value === 'string' ? Number(value) : value;
  return Number.isFinite(num) ? num : 0;
}

const columns: DataTableColumn<LedgerStatementLine>[] = [
  { id: 'date', header: 'Date', cell: (row) => row.date || '—' },
  {
    id: 'entry_number',
    header: 'Entry #',
    cell: (row) => (row.entry_number != null ? String(row.entry_number) : '—'),
  },
  {
    id: 'narration',
    header: 'Narration',
    cellClassName: 'text-muted-foreground',
    cell: (row) => row.narration || '—',
  },
  {
    id: 'dc',
    header: 'Dr/Cr',
    cell: (row) => row.dc.toUpperCase(),
  },
  {
    id: 'amount',
    header: 'Amount',
    cellClassName: 'tabular-nums text-right',
    cell: (row) => formatAmount(parseAmount(row.amount)),
  },
  {
    id: 'running_balance',
    header: 'Balance',
    cellClassName: 'tabular-nums text-right',
    cell: (row) => formatAmount(parseAmount(row.running_balance)),
  },
];

export function LedgerStatementPage() {
  const { data: ledgersData } = useLedgersList(1, 200);
  const ledgers = ledgersData?.results ?? [];

  const [ledgerId, setLedgerId] = useState(0);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [applied, setApplied] = useState({ ledger_id: 0, from_date: '', to_date: '' });

  const params = useMemo(
    () => ({
      ledger_id: applied.ledger_id,
      ...(applied.from_date ? { from_date: applied.from_date } : {}),
      ...(applied.to_date ? { to_date: applied.to_date } : {}),
    }),
    [applied],
  );

  const submitted = applied.ledger_id > 0;
  const {
    data: report,
    isLoading,
    isError,
    error,
    refetch,
  } = useLedgerStatementReport(params, submitted);
  const lines = report?.lines ?? [];

  const ledgerOptions = [
    { value: '', label: 'Select ledger' },
    ...ledgers.map((l) => ({ value: String(l.id), label: l.name })),
  ];

  const handleExportCsv = () => {
    exportToCsv(
      'ledger-statement',
      ['Date', 'Entry #', 'Narration', 'Dr/Cr', 'Amount', 'Balance'],
      lines.map((row) => [
        row.date || '',
        row.entry_number != null ? String(row.entry_number) : '',
        row.narration,
        row.dc,
        String(parseAmount(row.amount)),
        String(parseAmount(row.running_balance)),
      ]),
    );
  };

  return (
    <ModuleReportPack
      title="Ledger Statement"
      description="Opening balance, period activity, and running balance for one ledger."
      printTitle="Ledger Statement"
      printSubtitle={report?.ledger_name}
      onPrint={printReport}
      onExportCsv={handleExportCsv}
      exportDisabled={lines.length === 0}
      onApply={() => setApplied({ ledger_id: ledgerId, from_date: fromDate, to_date: toDate })}
      applyDisabled={ledgerId <= 0}
      submitted={submitted}
      hasData={lines.length > 0 || isLoading || Boolean(report)}
      isLoading={isLoading}
      loadingMessage="Loading ledger statement..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && submitted && lines.length === 0}
      emptyTitle="No entries"
      emptyDescription="No journal lines for this ledger in the selected period."
      filters={
        <>
          <FormField label="Ledger" htmlFor="ls-ledger">
            <Select
              id="ls-ledger"
              value={ledgerId > 0 ? String(ledgerId) : ''}
              onChange={(e) => setLedgerId(Number(e.target.value) || 0)}
              options={ledgerOptions}
            />
          </FormField>
          <FormField label="From date" htmlFor="ls-from">
            <Input
              id="ls-from"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </FormField>
          <FormField label="To date" htmlFor="ls-to">
            <Input
              id="ls-to"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </FormField>
        </>
      }
      summary={
        report ? (
          <ReportSummaryGrid
            items={[
              { label: 'Ledger', value: report.ledger_name },
              {
                label: 'Opening',
                value: formatAmount(parseAmount(report.opening_balance)),
              },
              {
                label: 'Closing',
                value: formatAmount(parseAmount(report.closing_balance)),
              },
              { label: 'Lines', value: lines.length },
            ]}
          />
        ) : undefined
      }
    >
      {lines.length > 0 && (
        <DataTable data={lines} columns={columns} getRowKey={(row) => row.item_id} />
      )}
    </ModuleReportPack>
  );
}
