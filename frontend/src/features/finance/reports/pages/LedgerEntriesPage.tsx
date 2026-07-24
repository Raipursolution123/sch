import { useMemo, useState } from 'react';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { FormField } from '@components/forms/FormField';
import { ReportSummaryGrid } from '@components/reports';
import { Input } from '@components/ui/input';
import { Select } from '@components/ui/select';
import { useLedgerEntriesReport } from '@hooks/useFinanceReports';
import { useLedgersList } from '@hooks/useLedgers';
import type { LedgerEntryRow } from '@app-types/finance';
import { exportToCsv } from '@utils/export-csv';
import { formatAmount } from '@utils/format';
import { printReport } from '@utils/print-report';
import { ModuleReportPack } from '@workflow-packs';

function parseAmount(value: number | string): number {
  const num = typeof value === 'string' ? Number(value) : value;
  return Number.isFinite(num) ? num : 0;
}

const columns: DataTableColumn<LedgerEntryRow>[] = [
  { id: 'date', header: 'Date', cell: (row) => row.date || '—' },
  {
    id: 'entry_number',
    header: 'Entry #',
    cell: (row) => (row.entry_number != null ? String(row.entry_number) : '—'),
  },
  {
    id: 'ledger_name',
    header: 'Ledger',
    cellClassName: 'font-medium',
    cell: (row) => row.ledger_name,
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
    id: 'narration',
    header: 'Narration',
    cellClassName: 'text-muted-foreground',
    cell: (row) => row.narration || '—',
  },
];

export function LedgerEntriesPage() {
  const { data: ledgersData } = useLedgersList(1, 200);
  const ledgers = ledgersData?.results ?? [];

  const [ledgerId, setLedgerId] = useState(0);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [applied, setApplied] = useState({ ledger_id: 0, from_date: '', to_date: '' });

  const params = useMemo(
    () => ({
      ...(applied.ledger_id > 0 ? { ledger_id: applied.ledger_id } : {}),
      ...(applied.from_date ? { from_date: applied.from_date } : {}),
      ...(applied.to_date ? { to_date: applied.to_date } : {}),
    }),
    [applied],
  );

  const { data: report, isLoading, isError, error, refetch } = useLedgerEntriesReport(params);
  const rows = report?.rows ?? [];

  const ledgerOptions = [
    { value: '', label: 'All ledgers' },
    ...ledgers.map((l) => ({ value: String(l.id), label: l.name })),
  ];

  const handleExportCsv = () => {
    exportToCsv(
      'ledger-entries',
      ['Date', 'Entry #', 'Ledger', 'Dr/Cr', 'Amount', 'Narration'],
      rows.map((row) => [
        row.date || '',
        row.entry_number != null ? String(row.entry_number) : '',
        row.ledger_name,
        row.dc,
        String(parseAmount(row.amount)),
        row.narration,
      ]),
    );
  };

  return (
    <ModuleReportPack
      title="Ledger Entries"
      description="Journal entry lines filtered by ledger and date range."
      printTitle="Ledger Entries"
      onPrint={printReport}
      onExportCsv={handleExportCsv}
      exportDisabled={rows.length === 0}
      onApply={() => setApplied({ ledger_id: ledgerId, from_date: fromDate, to_date: toDate })}
      submitted
      hasData={rows.length > 0 || isLoading}
      isLoading={isLoading}
      loadingMessage="Loading ledger entries..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && rows.length === 0}
      emptyTitle="No entries"
      emptyDescription="No journal lines match the selected filters."
      filters={
        <>
          <FormField label="Ledger" htmlFor="le-ledger">
            <Select
              id="le-ledger"
              value={ledgerId > 0 ? String(ledgerId) : ''}
              onChange={(e) => setLedgerId(Number(e.target.value) || 0)}
              options={ledgerOptions}
            />
          </FormField>
          <FormField label="From date" htmlFor="le-from">
            <Input
              id="le-from"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </FormField>
          <FormField label="To date" htmlFor="le-to">
            <Input
              id="le-to"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </FormField>
        </>
      }
      summary={
        rows.length > 0 ? (
          <ReportSummaryGrid items={[{ label: 'Lines', value: rows.length }]} />
        ) : undefined
      }
    >
      {rows.length > 0 && (
        <DataTable
          data={rows}
          columns={columns}
          getRowKey={(row) => `${row.entry_id}-${row.ledger_id}-${row.dc}-${row.amount}`}
        />
      )}
    </ModuleReportPack>
  );
}
