import { useMemo, useState } from 'react';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { FormField } from '@components/forms/FormField';
import { ReportSummaryGrid } from '@components/reports';
import { Select } from '@components/ui/select';
import { useBookIssues, useLibraryBooks } from '@hooks/useLibrary';
import type { BookIssue, LibraryBook } from '@app-types/library';
import { exportToCsv } from '@utils/export-csv';
import { printReport } from '@utils/print-report';
import { ModuleReportPack } from '@workflow-packs';

export function LibraryReportPage() {
  const [issueStatus, setIssueStatus] = useState<'open' | 'returned' | 'all'>('open');
  const booksQuery = useLibraryBooks();
  const issuesQuery = useBookIssues(issueStatus);

  const books = booksQuery.data ?? [];
  const issues = issuesQuery.data ?? [];

  const isLoading = booksQuery.isLoading || issuesQuery.isLoading;
  const isError = booksQuery.isError || issuesQuery.isError;
  const error = booksQuery.error ?? issuesQuery.error;

  const availableCount = useMemo(() => books.filter((b) => b.available === 'yes').length, [books]);
  const totalQty = useMemo(() => books.reduce((sum, b) => sum + (b.qty ?? 0), 0), [books]);

  const bookColumns: DataTableColumn<LibraryBook>[] = [
    {
      id: 'title',
      header: 'Title',
      cellClassName: 'font-medium',
      cell: (row) => row.book_title,
    },
    { id: 'book_no', header: 'Book No', cell: (row) => row.book_no },
    {
      id: 'author',
      header: 'Author',
      cellClassName: 'text-muted-foreground',
      cell: (row) => row.author || '—',
    },
    {
      id: 'qty',
      header: 'Qty',
      cellClassName: 'tabular-nums',
      cell: (row) => row.qty ?? '—',
    },
    {
      id: 'available',
      header: 'Available',
      cell: (row) => (row.available === 'yes' ? 'Yes' : 'No'),
    },
  ];

  const issueColumns: DataTableColumn<BookIssue>[] = [
    {
      id: 'book',
      header: 'Book',
      cellClassName: 'font-medium',
      cell: (row) => row.book_title || row.book_no || String(row.book_id),
    },
    {
      id: 'member',
      header: 'Member',
      cell: (row) => row.library_card_no || (row.member_id != null ? String(row.member_id) : '—'),
    },
    {
      id: 'issue_date',
      header: 'Issued',
      cell: (row) => row.issue_date || '—',
    },
    {
      id: 'due',
      header: 'Due',
      cell: (row) => row.duereturn_date || '—',
    },
    {
      id: 'status',
      header: 'Status',
      cell: (row) => (row.is_returned === 1 ? 'Returned' : 'Open'),
    },
  ];

  const hasData = books.length > 0 || issues.length > 0;

  const handleExportCsv = () => {
    exportToCsv(
      'library-report',
      ['Section', 'Title / Book', 'Detail', 'Qty / Status'],
      [
        ...books.map((row) => [
          'Catalog',
          row.book_title,
          row.author || row.book_no,
          String(row.qty ?? ''),
        ]),
        ...issues.map((row) => [
          'Issue',
          row.book_title || row.book_no || String(row.book_id),
          row.library_card_no || String(row.member_id ?? ''),
          row.is_returned === 1 ? 'Returned' : 'Open',
        ]),
      ],
    );
  };

  return (
    <ModuleReportPack
      title="Library Report"
      description="Book catalog stock and issue/return activity."
      printTitle="Library Report"
      onPrint={printReport}
      onExportCsv={handleExportCsv}
      exportDisabled={!hasData}
      submitted
      hasData={hasData || isLoading}
      isLoading={isLoading}
      loadingMessage="Loading library report..."
      isError={isError}
      error={error}
      onRetry={() => {
        void booksQuery.refetch();
        void issuesQuery.refetch();
      }}
      isEmpty={!isLoading && !isError && !hasData}
      emptyTitle="No library records"
      emptyDescription="Add books and issue activity to populate this report."
      filters={
        <FormField label="Issue status" htmlFor="library-issue-status">
          <Select
            id="library-issue-status"
            value={issueStatus}
            onChange={(e) => setIssueStatus(e.target.value as 'open' | 'returned' | 'all')}
            options={[
              { value: 'open', label: 'Open issues' },
              { value: 'returned', label: 'Returned' },
              { value: 'all', label: 'All issues' },
            ]}
          />
        </FormField>
      }
      summary={
        hasData ? (
          <ReportSummaryGrid
            items={[
              { label: 'Titles', value: books.length },
              { label: 'Total copies', value: totalQty },
              { label: 'Available titles', value: availableCount },
              { label: 'Issues (filter)', value: issues.length },
            ]}
          />
        ) : undefined
      }
    >
      <div className="space-y-8">
        {books.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Book catalog
            </h2>
            <DataTable data={books} columns={bookColumns} getRowKey={(row) => row.id} />
          </section>
        )}
        {issues.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Issues
            </h2>
            <DataTable data={issues} columns={issueColumns} getRowKey={(row) => row.id} />
          </section>
        )}
      </div>
    </ModuleReportPack>
  );
}
