import { useEffect, useMemo, useState } from 'react';
import { FormField } from '@components/forms/FormField';
import { Select } from '@components/ui/select';
import { Input } from '@components/ui/input';
import { ReportSummaryGrid } from '@components/reports';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { useIncomeHeads, useIncomeList } from '@hooks/useIncomeExpense';
import type { IncomeRecord } from '@app-types/income-expense';
import { formatAmount, formatDate } from '@utils/format';
import { exportToCsv } from '@utils/export-csv';
import { printReport } from '@utils/print-report';
import { ModuleReportPack } from '@workflow-packs';


function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function getDateRange(type: string): { from: string; to: string } {
  const today = new Date();
  const format = (d: Date) => d.toISOString().slice(0, 10);
  
  if (type === 'today') {
    return { from: format(today), to: format(today) };
  }
  if (type === 'this_week') {
    const start = new Date(today);
    start.setDate(today.getDate() - today.getDay());
    return { from: format(start), to: format(today) };
  }
  if (type === 'last_week') {
    const start = new Date(today);
    start.setDate(today.getDate() - today.getDay() - 7);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return { from: format(start), to: format(end) };
  }
  if (type === 'this_month') {
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    return { from: format(start), to: format(today) };
  }
  if (type === 'last_month') {
    const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const end = new Date(today.getFullYear(), today.getMonth(), 0);
    return { from: format(start), to: format(end) };
  }
  if (type === 'this_year') {
    const start = new Date(today.getFullYear(), 0, 1);
    return { from: format(start), to: format(today) };
  }
  if (type === 'last_year') {
    const start = new Date(today.getFullYear() - 1, 0, 1);
    const end = new Date(today.getFullYear() - 1, 11, 31);
    return { from: format(start), to: format(end) };
  }
  return { from: '', to: '' };
}

export function SearchIncomePage() {
  const [searchType, setSearchType] = useState('today');
  const [fromDate, setFromDate] = useState(todayIsoDate());
  const [toDate, setToDate] = useState(todayIsoDate());
  const [searchQuery, setSearchQuery] = useState('');
  const [submitted, setSubmitted] = useState(true);

  // Sync date fields when searchType changes
  useEffect(() => {
    if (searchType !== 'period') {
      const range = getDateRange(searchType);
      setFromDate(range.from);
      setToDate(range.to);
    }
  }, [searchType]);

  const { data: rawIncome = [], isLoading, isError, error, refetch } = useIncomeList(submitted ? searchQuery : '');
  const { data: heads = [] } = useIncomeHeads();

  const headNameMap = useMemo(() => {
    return new Map(heads.map((h) => [h.id, h.income_category || `#${h.id}`]));
  }, [heads]);

  // Client-side date range filtering
  const filteredData = useMemo(() => {
    if (!submitted) return [];
    return rawIncome.filter((item) => {
      if (!item.date) return false;
      const d = item.date;
      return d >= fromDate && d <= toDate;
    });
  }, [rawIncome, fromDate, toDate, submitted]);

  const totalAmount = useMemo(() => {
    return filteredData.reduce((sum, item) => sum + (item.amount || 0), 0);
  }, [filteredData]);

  const handleExportCsv = () => {
    if (filteredData.length === 0) return;
    exportToCsv(
      `income-report-${fromDate}-to-${toDate}`,
      ['Name', 'Head', 'Invoice No', 'Date', 'Amount', 'Note'],
      filteredData.map((row) => [
        row.name || '—',
        row.income_head_id ? headNameMap.get(row.income_head_id) || `#${row.income_head_id}` : '—',
        row.invoice_no || '—',
        row.date ? formatDate(row.date) : '—',
        String(row.amount),
        row.note || '—',
      ]),
    );
  };

  const columns: DataTableColumn<IncomeRecord>[] = [
    { id: 'name', header: 'Name', cellClassName: 'font-semibold', cell: (r) => r.name || '—' },
    { id: 'head', header: 'Income Head', cell: (r) => (r.income_head_id ? headNameMap.get(r.income_head_id) || `#${r.income_head_id}` : '—') },
    { id: 'invoice', header: 'Invoice No', cell: (r) => r.invoice_no || '—' },
    { id: 'date', header: 'Date', cell: (r) => (r.date ? formatDate(r.date) : '—') },
    { id: 'amount', header: 'Amount', cellClassName: 'text-right font-medium', cell: (r) => formatAmount(r.amount) },
    { id: 'note', header: 'Note', cell: (r) => r.note || '—' },
  ];

  return (
    <ModuleReportPack
      title="Search Income"
      description="Search income records by date range and query parameters."
      printTitle={`Income Search Report (${fromDate} to ${toDate})`}
      onPrint={printReport}
      onExportCsv={handleExportCsv}
      exportDisabled={filteredData.length === 0}
      onApply={() => setSubmitted(true)}
      applyDisabled={!fromDate || !toDate || (submitted && isLoading)}
      submitted={submitted}
      hasData={filteredData.length > 0}
      isLoading={submitted && isLoading}
      loadingMessage="Searching income..."
      isError={submitted && isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={submitted && !isLoading && !isError && filteredData.length === 0}
      emptyTitle="No income records found"
      emptyDescription="No records matched your search parameters. Try adjusting filters."
      summary={
        filteredData.length > 0 ? (
          <ReportSummaryGrid
            items={[
              { label: 'Total Records', value: filteredData.length },
              { label: 'Total Income Amount', value: formatAmount(totalAmount), tone: 'success' },
            ]}
          />
        ) : undefined
      }
      filters={
        <>
          <FormField label="Search Type" htmlFor="search_type">
            <Select
              id="search_type"
              value={searchType}
              onChange={(e) => {
                setSearchType(e.target.value);
                setSubmitted(false);
              }}
              options={[
                { value: 'today', label: 'Today' },
                { value: 'this_week', label: 'This Week' },
                { value: 'last_week', label: 'Last Week' },
                { value: 'this_month', label: 'This Month' },
                { value: 'last_month', label: 'Last Month' },
                { value: 'this_year', label: 'This Year' },
                { value: 'last_year', label: 'Last Year' },
                { value: 'period', label: 'Period / Custom' },
              ]}
            />
          </FormField>

          {searchType === 'period' && (
            <>
              <FormField label="From Date" htmlFor="from_date">
                <Input
                  id="from_date"
                  type="date"
                  value={fromDate}
                  onChange={(e) => {
                    setFromDate(e.target.value);
                    setSubmitted(false);
                  }}
                />
              </FormField>
              <FormField label="To Date" htmlFor="to_date">
                <Input
                  id="to_date"
                  type="date"
                  value={toDate}
                  onChange={(e) => {
                    setToDate(e.target.value);
                    setSubmitted(false);
                  }}
                />
              </FormField>
            </>
          )}

          <FormField label="Search Query" htmlFor="search_query">
            <Input
              id="search_query"
              placeholder="Search by name, invoice, note..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSubmitted(false);
              }}
            />
          </FormField>
        </>
      }
    >
      {filteredData.length > 0 && (
        <DataTable columns={columns} data={filteredData} getRowKey={(r) => r.id} />
      )}
    </ModuleReportPack>
  );
}
