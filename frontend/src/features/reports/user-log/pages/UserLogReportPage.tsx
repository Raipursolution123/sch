import { useMemo, useState } from 'react';
import { Select } from '@components/ui/select';
import { FormField } from '@components/forms/FormField';
import { Input } from '@components/ui/input';
import { ReportSummaryGrid } from '@components/reports';
import { useActiveSession } from '@hooks/useSessions';
import { useUserLogs } from '@hooks/useSystemReports';
import { exportToCsv } from '@utils/export-csv';
import { printReport } from '@utils/print-report';
import { ModuleReportPack } from '@workflow-packs';
import { Laptop, User } from 'lucide-react';

export function UserLogReportPage() {
  const { data: activeSession } = useActiveSession();
  const [roleFilter, setRoleFilter] = useState('');
  const [q, setQ] = useState('');

  const filters = useMemo(
    () => ({
      role: roleFilter || undefined,
      q: q.trim() || undefined,
      page_size: 200,
    }),
    [roleFilter, q],
  );

  const { data, isLoading, isError, error, refetch } = useUserLogs(filters);
  const logs = data?.results ?? [];

  const handleExportCsv = () => {
    exportToCsv(
      'user-login-log-report',
      ['User', 'Role', 'IP Address', 'Login Time', 'Device / Browser'],
      logs.map((row) => [
        row.user,
        row.role,
        row.ipaddress,
        row.login_datetime || '',
        row.user_agent,
      ]),
    );
  };

  const uniqueUsers = new Set(logs.map((l) => l.user)).size;
  const today = new Date().toISOString().slice(0, 10);
  const activeToday = logs.filter((l) => (l.login_datetime || '').startsWith(today)).length;

  return (
    <ModuleReportPack
      title="User Login Log Report"
      description="Track system login history, login devices, and connection details for all users."
      printTitle="User Login Log Report"
      printSubtitle={activeSession ? `Session ${activeSession.session}` : undefined}
      onPrint={printReport}
      onExportCsv={handleExportCsv}
      exportDisabled={logs.length === 0}
      sessionLabel={activeSession?.session}
      submitted
      hasData={logs.length > 0 || isLoading}
      isLoading={isLoading}
      isEmpty={!isLoading && logs.length === 0}
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      summary={
        <ReportSummaryGrid
          items={[
            { label: 'Total Logins', value: data?.count ?? logs.length },
            { label: 'Unique Users', value: uniqueUsers },
            { label: 'Active Today', value: activeToday },
          ]}
        />
      }
      filters={
        <>
          <FormField label="Filter by Role">
            <Select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              options={[
                { value: '', label: 'All roles' },
                { value: 'Staff', label: 'Staff members' },
                { value: 'Student', label: 'Students' },
                { value: 'Parent', label: 'Parents' },
              ]}
            />
          </FormField>
          <FormField label="Search">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="User, IP, or browser"
            />
          </FormField>
        </>
      }
    >
      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4 text-center">IP Address</th>
              <th className="px-6 py-4 text-center">Login Time</th>
              <th className="px-6 py-4">Device / Browser</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {logs.map((row) => (
              <tr key={row.id} className="transition-colors hover:bg-muted/50">
                <td className="flex items-center gap-2 px-6 py-4 font-medium text-foreground">
                  <User className="h-4 w-4 text-primary" />
                  {row.user}
                </td>
                <td className="px-6 py-4 text-muted-foreground">{row.role}</td>
                <td className="px-6 py-4 text-center font-mono text-muted-foreground">
                  {row.ipaddress}
                </td>
                <td className="px-6 py-4 text-center text-muted-foreground">
                  {row.login_datetime || '—'}
                </td>
                <td className="flex items-center gap-2 px-6 py-4 text-muted-foreground">
                  <Laptop className="h-4 w-4 opacity-70" />
                  <span className="line-clamp-1 max-w-md">{row.user_agent || '—'}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ModuleReportPack>
  );
}
