import { useState } from 'react';
import { Select } from '@components/ui/select';
import { FormField } from '@components/forms/FormField';
import { ReportSummaryGrid } from '@components/reports';
import { useActiveSession } from '@hooks/useSessions';
import { exportToCsv } from '@utils/export-csv';
import { printReport } from '@utils/print-report';
import { ModuleReportPack } from '@workflow-packs';
import { User, Laptop } from 'lucide-react';

interface UserLog {
  user: string;
  role: string;
  ipAddress: string;
  loginTime: string;
  device: string;
}

export function UserLogReportPage() {
  const { data: activeSession } = useActiveSession();
  const [roleFilter, setRoleFilter] = useState('');

  const mockLogs: UserLog[] = [
    { user: 'admin@demo.com', role: 'Staff (Admin)', ipAddress: '192.168.1.5', loginTime: '2026-07-31 12:44:12', device: 'Windows / Chrome' },
    { user: 'std4271', role: 'Student', ipAddress: '192.168.1.12', loginTime: '2026-07-31 11:30:05', device: 'Android / Chrome Mobile' },
    { user: 'parent4271', role: 'Parent', ipAddress: '192.168.1.25', loginTime: '2026-07-31 10:15:45', device: 'iOS / Safari' },
    { user: 'admin2@example.com', role: 'Staff (Accountant)', ipAddress: '10.0.0.4', loginTime: '2026-07-30 16:50:22', device: 'macOS / Safari' },
    { user: 'teacher1@demo.com', role: 'Staff (Teacher)', ipAddress: '192.168.1.7', loginTime: '2026-07-30 09:00:00', device: 'Windows / Edge' },
  ];

  const filteredLogs = mockLogs.filter(log => !roleFilter || log.role.includes(roleFilter));

  const handleExportCsv = () => {
    exportToCsv(
      'user-login-log-report',
      ['User', 'Role', 'IP Address', 'Login Time', 'Device / Browser'],
      filteredLogs.map((row) => [
        row.user,
        row.role,
        row.ipAddress,
        row.loginTime,
        row.device,
      ]),
    );
  };

  return (
    <ModuleReportPack
      title="User Login Log Report"
      description="Track system login history, login devices, and connection details for all users."
      printTitle="User Login Log Report"
      printSubtitle={activeSession ? `Session ${activeSession.session}` : undefined}
      onPrint={printReport}
      onExportCsv={handleExportCsv}
      exportDisabled={filteredLogs.length === 0}
      sessionLabel={activeSession?.session}
      submitted
      hasData={true}
      isLoading={false}
      isEmpty={filteredLogs.length === 0}
      summary={
        <ReportSummaryGrid
          items={[
            { label: 'Total Logins', value: filteredLogs.length },
            { label: 'Unique Users', value: new Set(filteredLogs.map(l => l.user)).size },
            { label: 'Active Today', value: 3 },
          ]}
        />
      }
      filters={
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
            {filteredLogs.map((row, idx) => (
              <tr key={idx} className="hover:bg-muted/50 transition-colors">
                <td className="px-6 py-4 font-medium text-foreground flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  {row.user}
                </td>
                <td className="px-6 py-4 text-muted-foreground">{row.role}</td>
                <td className="px-6 py-4 text-center text-muted-foreground font-mono">{row.ipAddress}</td>
                <td className="px-6 py-4 text-center text-muted-foreground">{row.loginTime}</td>
                <td className="px-6 py-4 text-muted-foreground flex items-center gap-2">
                  <Laptop className="h-4 w-4 opacity-70" />
                  {row.device}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ModuleReportPack>
  );
}
