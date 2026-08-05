import { useMemo, useState } from 'react';
import { FormField } from '@components/forms/FormField';
import { Input } from '@components/ui/input';
import { ReportSummaryGrid } from '@components/reports';
import { useActiveSession } from '@hooks/useSessions';
import { useAuditTrail } from '@hooks/useSystemReports';
import { exportToCsv } from '@utils/export-csv';
import { printReport } from '@utils/print-report';
import { ModuleReportPack } from '@workflow-packs';
import { User } from 'lucide-react';

export function AuditTrailReportPage() {
  const { data: activeSession } = useActiveSession();
  const [actionFilter, setActionFilter] = useState('');
  const [q, setQ] = useState('');

  const filters = useMemo(
    () => ({
      action: actionFilter.trim() || undefined,
      q: q.trim() || undefined,
      page_size: 200,
    }),
    [actionFilter, q],
  );

  const { data, isLoading, isError, error, refetch } = useAuditTrail(filters);
  const audits = data?.results ?? [];

  const handleExportCsv = () => {
    exportToCsv(
      'audit-trail-report',
      ['Timestamp', 'User', 'Action', 'IP', 'Details'],
      audits.map((row) => [row.time || '', row.user_name, row.action, row.ip_address, row.message]),
    );
  };

  const uniqueUsers = new Set(audits.map((a) => a.user_name)).size;

  return (
    <ModuleReportPack
      title="System Audit Trail Report"
      description="Detailed historical logs of all administrative actions, data creations, mutations, and status changes."
      printTitle="System Audit Trail Report"
      printSubtitle={activeSession ? `Session ${activeSession.session}` : undefined}
      onPrint={printReport}
      onExportCsv={handleExportCsv}
      exportDisabled={audits.length === 0}
      sessionLabel={activeSession?.session}
      submitted
      hasData={audits.length > 0 || isLoading}
      isLoading={isLoading}
      isEmpty={!isLoading && audits.length === 0}
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      summary={
        <ReportSummaryGrid
          items={[
            { label: 'Total Operations', value: data?.count ?? audits.length },
            { label: 'Unique Actors', value: uniqueUsers },
            {
              label: 'Distinct Actions',
              value: new Set(audits.map((a) => a.action)).size,
            },
          ]}
        />
      }
      filters={
        <>
          <FormField label="Filter by Action">
            <Input
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              placeholder="e.g. Insert, Update, Delete"
            />
          </FormField>
          <FormField label="Search">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Message, IP, or platform"
            />
          </FormField>
        </>
      }
    >
      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-6 py-4">Timestamp</th>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Action</th>
              <th className="px-6 py-4">IP</th>
              <th className="px-6 py-4">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {audits.map((row) => (
              <tr key={row.id} className="transition-colors hover:bg-muted/50">
                <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                  {row.time || '—'}
                </td>
                <td className="flex items-center gap-2 px-6 py-4 font-medium text-foreground">
                  <User className="h-4 w-4 text-primary" />
                  {row.user_name}
                </td>
                <td className="px-6 py-4 font-semibold text-ink">{row.action}</td>
                <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                  {row.ip_address || '—'}
                </td>
                <td className="px-6 py-4 text-muted-foreground">{row.message || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ModuleReportPack>
  );
}
