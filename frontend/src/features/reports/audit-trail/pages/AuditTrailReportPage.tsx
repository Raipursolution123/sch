import { useState } from 'react';
import { Select } from '@components/ui/select';
import { FormField } from '@components/forms/FormField';
import { ReportSummaryGrid } from '@components/reports';
import { useActiveSession } from '@hooks/useSessions';
import { exportToCsv } from '@utils/export-csv';
import { printReport } from '@utils/print-report';
import { ModuleReportPack } from '@workflow-packs';
import { User } from 'lucide-react';

interface AuditTrailRecord {
  timestamp: string;
  user: string;
  action: string;
  section: string;
  details: string;
}

export function AuditTrailReportPage() {
  const { data: activeSession } = useActiveSession();
  const [sectionFilter, setSectionFilter] = useState('');

  const mockAudits: AuditTrailRecord[] = [
    { timestamp: '2026-07-31 12:35:10', user: 'admin@demo.com', action: 'Create Student Admission', section: 'Student Information', details: 'Admitted new student (std4273 / Pardeep Singh)' },
    { timestamp: '2026-07-31 11:20:00', user: 'admin2@example.com', action: 'Collect Fee', section: 'Fees Collection', details: 'Collected Rs. 5,000 from student std4271' },
    { timestamp: '2026-07-30 17:40:02', user: 'admin@demo.com', action: 'Update General Setting', section: 'System Settings', details: 'Updated school name and logo' },
    { timestamp: '2026-07-30 15:30:15', user: 'admin@demo.com', action: 'Deactivate Student', section: 'Student Information', details: 'Deactivated student due to fee defaults' },
    { timestamp: '2026-07-29 10:00:00', user: 'admin@demo.com', action: 'Add Homework', section: 'Homework', details: 'Assigned Homework: Math Assignment 3' },
  ];

  const filteredAudits = mockAudits.filter(audit => !sectionFilter || audit.section === sectionFilter);

  const handleExportCsv = () => {
    exportToCsv(
      'audit-trail-report',
      ['Timestamp', 'User', 'Action', 'Section', 'Details'],
      filteredAudits.map((row) => [
        row.timestamp,
        row.user,
        row.action,
        row.section,
        row.details,
      ]),
    );
  };

  return (
    <ModuleReportPack
      title="System Audit Trail Report"
      description="Detailed historical logs of all administrative actions, data creations, mutations, and status changes."
      printTitle="System Audit Trail Report"
      printSubtitle={activeSession ? `Session ${activeSession.session}` : undefined}
      onPrint={printReport}
      onExportCsv={handleExportCsv}
      exportDisabled={filteredAudits.length === 0}
      sessionLabel={activeSession?.session}
      submitted
      hasData={true}
      isLoading={false}
      isEmpty={filteredAudits.length === 0}
      summary={
        <ReportSummaryGrid
          items={[
            { label: 'Total Operations', value: filteredAudits.length },
            { label: 'Admin Actions', value: filteredAudits.filter(a => a.user === 'admin@demo.com').length },
            { label: 'Criticial Updates', value: 1 },
          ]}
        />
      }
      filters={
        <FormField label="Filter by Section">
          <Select
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value)}
            options={[
              { value: '', label: 'All sections' },
              { value: 'Student Information', label: 'Student Information' },
              { value: 'Fees Collection', label: 'Fees Collection' },
              { value: 'System Settings', label: 'System Settings' },
              { value: 'Homework', label: 'Homework' },
            ]}
          />
        </FormField>
      }
    >

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-6 py-4">Timestamp</th>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Action</th>
              <th className="px-6 py-4">Section</th>
              <th className="px-6 py-4">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredAudits.map((row, idx) => (
              <tr key={idx} className="hover:bg-muted/50 transition-colors">
                <td className="px-6 py-4 text-muted-foreground font-mono text-xs">{row.timestamp}</td>
                <td className="px-6 py-4 font-medium text-foreground flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  {row.user}
                </td>
                <td className="px-6 py-4 text-ink font-semibold">{row.action}</td>
                <td className="px-6 py-4 text-muted-foreground">{row.section}</td>
                <td className="px-6 py-4 text-muted-foreground">{row.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ModuleReportPack>
  );
}
