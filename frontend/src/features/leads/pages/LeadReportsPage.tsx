import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { ReportSummaryGrid } from '@components/reports';
import { useLeadReport } from '@hooks/useLeads';
import { exportToCsv } from '@utils/export-csv';
import { printReport } from '@utils/print-report';
import { ModuleReportPack } from '@workflow-packs';

export function LeadReportsPage() {
  const { data, isLoading, isError, error, refetch } = useLeadReport();

  const byCampaign = data?.by_campaign ?? [];
  const byStatus = data?.by_status ?? [];
  const bySource = data?.by_source ?? [];
  const hasData = Boolean(data && data.total > 0);

  const campaignColumns: DataTableColumn<(typeof byCampaign)[number]>[] = [
    {
      id: 'title',
      header: 'Campaign',
      cellClassName: 'font-medium',
      cell: (r) => r.c_title,
    },
    {
      id: 'count',
      header: 'Leads',
      cellClassName: 'tabular-nums',
      cell: (r) => r.count,
    },
  ];

  const statusColumns: DataTableColumn<(typeof byStatus)[number]>[] = [
    { id: 'status', header: 'Status', cell: (r) => r.l_status || '—' },
    {
      id: 'count',
      header: 'Count',
      cellClassName: 'tabular-nums',
      cell: (r) => r.count,
    },
  ];

  const sourceColumns: DataTableColumn<(typeof bySource)[number]>[] = [
    { id: 'source', header: 'Source', cell: (r) => r.l_source || '—' },
    {
      id: 'count',
      header: 'Count',
      cellClassName: 'tabular-nums',
      cell: (r) => r.count,
    },
  ];

  const handleExportCsv = () => {
    if (!data) return;
    exportToCsv(
      'leads-report',
      ['Section', 'Label', 'Count'],
      [
        ['Summary', 'Total', String(data.total)],
        ['Summary', 'Open', String(data.open)],
        ['Summary', 'Closed', String(data.closed)],
        ['Summary', 'Follow-ups', String(data.followups)],
        ...byCampaign.map((r) => ['Campaign', r.c_title, String(r.count)]),
        ...byStatus.map((r) => ['Status', r.l_status || '', String(r.count)]),
        ...bySource.map((r) => ['Source', r.l_source || '', String(r.count)]),
      ],
    );
  };

  return (
    <ModuleReportPack
      title="Lead Reports"
      description="Summary of leads by campaign, status, and source."
      printTitle="Lead Reports"
      onPrint={printReport}
      onExportCsv={handleExportCsv}
      exportDisabled={!hasData}
      submitted
      hasData={hasData || isLoading}
      isLoading={isLoading}
      loadingMessage="Loading lead report..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && !hasData}
      emptyTitle="No lead data"
      emptyDescription="Lead totals will appear once leads are created."
      filters={
        <p className="col-span-full text-sm text-muted-foreground">
          Snapshot of lead pipeline metrics.
        </p>
      }
      summary={
        data ? (
          <ReportSummaryGrid
            items={[
              { label: 'Total', value: data.total },
              { label: 'Open', value: data.open },
              { label: 'Closed', value: data.closed },
              { label: 'Follow-ups', value: data.followups },
            ]}
          />
        ) : undefined
      }
    >
      <div className="space-y-8">
        {byCampaign.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              By campaign
            </h2>
            <DataTable data={byCampaign} columns={campaignColumns} getRowKey={(r) => r.c_id} />
          </section>
        )}
        {byStatus.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              By status
            </h2>
            <DataTable
              data={byStatus}
              columns={statusColumns}
              getRowKey={(r) => `status-${r.l_status ?? 'none'}-${r.count}`}
            />
          </section>
        )}
        {bySource.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              By source
            </h2>
            <DataTable
              data={bySource}
              columns={sourceColumns}
              getRowKey={(r) => `source-${r.l_source ?? 'none'}-${r.count}`}
            />
          </section>
        )}
      </div>
    </ModuleReportPack>
  );
}
