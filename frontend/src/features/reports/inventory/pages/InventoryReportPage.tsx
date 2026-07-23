import { useMemo, useState } from 'react';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { FormField } from '@components/forms/FormField';
import { ReportSummaryGrid } from '@components/reports';
import { Select } from '@components/ui/select';
import { useInventoryItems, useItemIssues, useItemStock } from '@hooks/useInventory';
import type { InventoryItem, ItemIssue, ItemStock } from '@app-types/inventory';
import { exportToCsv } from '@utils/export-csv';
import { printReport } from '@utils/print-report';
import { ModuleReportPack } from '@workflow-packs';

export function InventoryReportPage() {
  const [issueStatus, setIssueStatus] = useState<'open' | 'returned' | 'all'>('open');
  const itemsQuery = useInventoryItems();
  const stockQuery = useItemStock();
  const issuesQuery = useItemIssues(issueStatus);

  const items = itemsQuery.data ?? [];
  const stock = stockQuery.data ?? [];
  const issues = issuesQuery.data ?? [];

  const isLoading = itemsQuery.isLoading || stockQuery.isLoading || issuesQuery.isLoading;
  const isError = itemsQuery.isError || stockQuery.isError || issuesQuery.isError;
  const error = itemsQuery.error ?? stockQuery.error ?? issuesQuery.error;

  const totalQty = useMemo(() => items.reduce((sum, row) => sum + (row.quantity ?? 0), 0), [items]);
  const stockQty = useMemo(() => stock.reduce((sum, row) => sum + (row.quantity ?? 0), 0), [stock]);

  const itemColumns: DataTableColumn<InventoryItem>[] = [
    { id: 'name', header: 'Item', cellClassName: 'font-medium', cell: (r) => r.name },
    { id: 'unit', header: 'Unit', cell: (r) => r.unit || '—' },
    {
      id: 'qty',
      header: 'Qty',
      cellClassName: 'tabular-nums',
      cell: (r) => r.quantity ?? '—',
    },
  ];

  const stockColumns: DataTableColumn<ItemStock>[] = [
    {
      id: 'item',
      header: 'Item ID',
      cellClassName: 'font-medium',
      cell: (r) => (r.item_id != null ? String(r.item_id) : '—'),
    },
    {
      id: 'qty',
      header: 'Qty',
      cellClassName: 'tabular-nums',
      cell: (r) => r.quantity ?? '—',
    },
    {
      id: 'price',
      header: 'Purchase price',
      cellClassName: 'tabular-nums',
      cell: (r) => r.purchase_price ?? '—',
    },
    { id: 'date', header: 'Date', cell: (r) => r.date || '—' },
  ];

  const issueColumns: DataTableColumn<ItemIssue>[] = [
    {
      id: 'item',
      header: 'Item ID',
      cellClassName: 'font-medium',
      cell: (r) => (r.item_id != null ? String(r.item_id) : '—'),
    },
    {
      id: 'qty',
      header: 'Qty',
      cellClassName: 'tabular-nums',
      cell: (r) => r.quantity,
    },
    { id: 'issue_date', header: 'Issued', cell: (r) => r.issue_date || '—' },
    {
      id: 'status',
      header: 'Status',
      cell: (r) => (r.is_returned === 1 ? 'Returned' : 'Open'),
    },
  ];

  const hasData = items.length > 0 || stock.length > 0 || issues.length > 0;

  const handleExportCsv = () => {
    exportToCsv(
      'inventory-report',
      ['Section', 'Name / Item', 'Detail', 'Qty / Status'],
      [
        ...items.map((row) => ['Catalog', row.name, row.unit, String(row.quantity ?? '')]),
        ...stock.map((row) => [
          'Stock',
          String(row.item_id ?? ''),
          row.date || '',
          String(row.quantity ?? ''),
        ]),
        ...issues.map((row) => [
          'Issue',
          String(row.item_id ?? ''),
          row.issue_date || '',
          row.is_returned === 1 ? 'Returned' : 'Open',
        ]),
      ],
    );
  };

  return (
    <ModuleReportPack
      title="Inventory Report"
      description="Item catalog, stock receipts, and issue activity."
      printTitle="Inventory Report"
      onPrint={printReport}
      onExportCsv={handleExportCsv}
      exportDisabled={!hasData}
      submitted
      hasData={hasData || isLoading}
      isLoading={isLoading}
      loadingMessage="Loading inventory report..."
      isError={isError}
      error={error}
      onRetry={() => {
        void itemsQuery.refetch();
        void stockQuery.refetch();
        void issuesQuery.refetch();
      }}
      isEmpty={!isLoading && !isError && !hasData}
      emptyTitle="No inventory records"
      emptyDescription="Add items, stock, and issues to populate this report."
      filters={
        <FormField label="Issue status" htmlFor="inventory-issue-status">
          <Select
            id="inventory-issue-status"
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
              { label: 'Items', value: items.length },
              { label: 'Catalog qty', value: totalQty },
              { label: 'Stock entries', value: stock.length },
              { label: 'Stock qty', value: stockQty },
              { label: 'Issues (filter)', value: issues.length },
            ]}
          />
        ) : undefined
      }
    >
      <div className="space-y-8">
        {items.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Item catalog
            </h2>
            <DataTable data={items} columns={itemColumns} getRowKey={(row) => row.id} />
          </section>
        )}
        {stock.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Stock receipts
            </h2>
            <DataTable data={stock} columns={stockColumns} getRowKey={(row) => row.id} />
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
