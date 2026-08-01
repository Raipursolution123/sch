import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { ReportSummaryGrid } from '@components/reports';
import { useLeadReport } from '@hooks/useLeads';
import { exportToCsv } from '@utils/export-csv';
import { printReport } from '@utils/print-report';
import { ModuleReportPack } from '@workflow-packs';

export function LeadReportsPage() {
  const location = useLocation();
  const { data, isLoading, isError, error, refetch } = useLeadReport();

  const byCampaign = data?.by_campaign ?? [];
  const byStatus = data?.by_status ?? [];
  const bySource = data?.by_source ?? [];
  const hasData = Boolean(data && data.total > 0);

  // Determine current report type
  const reportType = useMemo(() => {
    const path = location.pathname;
    if (path.endsWith('promoter-commission-report')) return 'commission';
    if (path.endsWith('brief-reports')) return 'brief';
    if (path.endsWith('call-reports')) return 'call';
    if (path.endsWith('travel-reports')) return 'travel';
    return 'default';
  }, [location.pathname]);

  // Mock data for specific sub-reports
  const commissionData = [
    {
      id: 1,
      name: 'Rahul Sharma',
      campaign: 'Online Admissions 2026',
      leads: 15,
      admitted: 5,
      commission: 5000,
    },
    {
      id: 2,
      name: 'Nidhi Gupta',
      campaign: 'Newspaper Ad Campaign',
      leads: 10,
      admitted: 2,
      commission: 2000,
    },
  ];

  const briefData = [
    { id: 1, metric: 'Total Enquiries', target: 500, achieved: 420, conversion: '84%' },
    { id: 2, metric: 'Follow-ups Made', target: 300, achieved: 280, conversion: '93%' },
    { id: 3, metric: 'Admissions Confirmed', target: 50, achieved: 42, conversion: '84%' },
  ];

  const callData = [
    { id: 1, caller: 'Rahul Sharma', total: 50, connected: 40, noAnswer: 10, scheduled: 12 },
    { id: 2, caller: 'Nidhi Gupta', total: 45, connected: 35, noAnswer: 10, scheduled: 15 },
  ];

  const travelData = [
    {
      id: 1,
      promoter: 'Rahul Sharma',
      area: 'Sector 15, Dwarka',
      date: '2026-08-01',
      allowance: 450,
    },
    {
      id: 2,
      promoter: 'Nidhi Gupta',
      area: 'Civil Lines, Jaipur',
      date: '2026-08-01',
      allowance: 600,
    },
  ];

  // Table Columns
  const commissionColumns: DataTableColumn<(typeof commissionData)[number]>[] = [
    { id: 'name', header: 'Promoter Name', cell: (r) => r.name },
    { id: 'campaign', header: 'Campaign', cell: (r) => r.campaign },
    { id: 'leads', header: 'Leads Brought', cell: (r) => r.leads },
    { id: 'admitted', header: 'Admitted', cell: (r) => r.admitted },
    { id: 'commission', header: 'Commission Earned', cell: (r) => `₹${r.commission}` },
  ];

  const briefColumns: DataTableColumn<(typeof briefData)[number]>[] = [
    { id: 'metric', header: 'Performance Metric', cell: (r) => r.metric },
    { id: 'target', header: 'Target', cell: (r) => r.target },
    { id: 'achieved', header: 'Achieved', cell: (r) => r.achieved },
    { id: 'conversion', header: 'Success / Conversion', cell: (r) => r.conversion },
  ];

  const callColumns: DataTableColumn<(typeof callData)[number]>[] = [
    { id: 'caller', header: 'Counsellor', cell: (r) => r.caller },
    { id: 'total', header: 'Total Calls', cell: (r) => r.total },
    { id: 'connected', header: 'Connected', cell: (r) => r.connected },
    { id: 'noAnswer', header: 'Not Picked', cell: (r) => r.noAnswer },
    { id: 'scheduled', header: 'Follow-ups', cell: (r) => r.scheduled },
  ];

  const travelColumns: DataTableColumn<(typeof travelData)[number]>[] = [
    { id: 'promoter', header: 'Promoter', cell: (r) => r.promoter },
    { id: 'area', header: 'Area Covered', cell: (r) => r.area },
    { id: 'date', header: 'Date', cell: (r) => r.date },
    { id: 'allowance', header: 'Conveyance Allowance', cell: (r) => `₹${r.allowance}` },
  ];

  const defaultCampaignColumns: DataTableColumn<(typeof byCampaign)[number]>[] = [
    { id: 'title', header: 'Campaign', cellClassName: 'font-medium', cell: (r) => r.c_title },
    { id: 'count', header: 'Leads', cellClassName: 'tabular-nums', cell: (r) => r.count },
  ];

  const defaultStatusColumns: DataTableColumn<(typeof byStatus)[number]>[] = [
    { id: 'status', header: 'Status', cell: (r) => r.l_status || '—' },
    { id: 'count', header: 'Count', cellClassName: 'tabular-nums', cell: (r) => r.count },
  ];

  const defaultSourceColumns: DataTableColumn<(typeof bySource)[number]>[] = [
    { id: 'source', header: 'Source', cell: (r) => r.l_source || '—' },
    { id: 'count', header: 'Count', cellClassName: 'tabular-nums', cell: (r) => r.count },
  ];

  // Dynamic values
  const title = useMemo(() => {
    if (reportType === 'commission') return 'Promoter Commission Report';
    if (reportType === 'brief') return 'Brief Performance Reports';
    if (reportType === 'call') return 'Call Logs & Follow-up Reports';
    if (reportType === 'travel') return 'Promoter Travel Logs';
    return 'Lead Reports';
  }, [reportType]);

  const description = useMemo(() => {
    if (reportType === 'commission') return 'Commission details for promoters and sales agents.';
    if (reportType === 'brief') return 'Brief highlights and conversions of the lead pipeline.';
    if (reportType === 'call') return 'Analysis of outbound calls made by counsellors.';
    if (reportType === 'travel') return 'Conveyance and field travel details of promoter staff.';
    return 'Summary of leads by campaign, status, and source.';
  }, [reportType]);

  const handleExportCsv = () => {
    if (reportType === 'commission') {
      exportToCsv(
        'commission-report',
        ['Promoter', 'Campaign', 'Leads', 'Admitted', 'Commission'],
        commissionData.map((r) => [
          r.name,
          r.campaign,
          String(r.leads),
          String(r.admitted),
          String(r.commission),
        ]),
      );
    } else if (reportType === 'brief') {
      exportToCsv(
        'brief-performance-report',
        ['Metric', 'Target', 'Achieved', 'Conversion'],
        briefData.map((r) => [r.metric, String(r.target), String(r.achieved), r.conversion]),
      );
    } else if (reportType === 'call') {
      exportToCsv(
        'call-logs-report',
        ['Counsellor', 'Total', 'Connected', 'No Answer', 'Scheduled'],
        callData.map((r) => [
          r.caller,
          String(r.total),
          String(r.connected),
          String(r.noAnswer),
          String(r.scheduled),
        ]),
      );
    } else if (reportType === 'travel') {
      exportToCsv(
        'travel-allowance-report',
        ['Promoter', 'Area', 'Date', 'Allowance'],
        travelData.map((r) => [r.promoter, r.area, r.date, String(r.allowance)]),
      );
    } else if (data) {
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
    }
  };

  const renderContent = () => {
    if (reportType === 'commission') {
      return (
        <DataTable data={commissionData} columns={commissionColumns} getRowKey={(r) => r.id} />
      );
    }
    if (reportType === 'brief') {
      return <DataTable data={briefData} columns={briefColumns} getRowKey={(r) => r.id} />;
    }
    if (reportType === 'call') {
      return <DataTable data={callData} columns={callColumns} getRowKey={(r) => r.id} />;
    }
    if (reportType === 'travel') {
      return <DataTable data={travelData} columns={travelColumns} getRowKey={(r) => r.id} />;
    }
    return (
      <div className="space-y-8">
        {byCampaign.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              By campaign
            </h2>
            <DataTable
              data={byCampaign}
              columns={defaultCampaignColumns}
              getRowKey={(r) => r.c_id}
            />
          </section>
        )}
        {byStatus.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              By status
            </h2>
            <DataTable
              data={byStatus}
              columns={defaultStatusColumns}
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
              columns={defaultSourceColumns}
              getRowKey={(r) => `source-${r.l_source ?? 'none'}-${r.count}`}
            />
          </section>
        )}
      </div>
    );
  };

  const summaryGrid = () => {
    if (reportType !== 'default') return null;
    return data ? (
      <ReportSummaryGrid
        items={[
          { label: 'Total', value: data.total },
          { label: 'Open', value: data.open },
          { label: 'Closed', value: data.closed },
          { label: 'Follow-ups', value: data.followups },
        ]}
      />
    ) : undefined;
  };

  return (
    <ModuleReportPack
      title={title}
      description={description}
      printTitle={title}
      onPrint={printReport}
      onExportCsv={handleExportCsv}
      exportDisabled={reportType === 'default' && !hasData}
      submitted
      hasData={reportType !== 'default' || hasData || isLoading}
      isLoading={reportType === 'default' && isLoading}
      loadingMessage="Loading lead report..."
      isError={reportType === 'default' && isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={reportType === 'default' && !isLoading && !isError && !hasData}
      emptyTitle="No lead data"
      emptyDescription="Lead totals will appear once leads are created."
      filters={
        <p className="col-span-full text-sm text-muted-foreground">
          Snapshot of lead pipeline metrics.
        </p>
      }
      summary={summaryGrid()}
    >
      {renderContent()}
    </ModuleReportPack>
  );
}
