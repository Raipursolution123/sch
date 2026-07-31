import { useState } from 'react';
import { Select } from '@components/ui/select';
import { FormField } from '@components/forms/FormField';
import { ReportSummaryGrid } from '@components/reports';
import { useActiveSession } from '@hooks/useSessions';
import { exportToCsv } from '@utils/export-csv';
import { printReport } from '@utils/print-report';
import { ModuleReportPack } from '@workflow-packs';
import { CheckCircle, Award } from 'lucide-react';

interface OnlineExamReport {
  examName: string;
  className: string;
  totalStudents: number;
  passedStudents: number;
  passPercentage: number;
  status: string;
}

export function OnlineExamReportPage() {
  const { data: activeSession } = useActiveSession();
  const [classFilter, setClassFilter] = useState('');

  const mockExamReports: OnlineExamReport[] = [
    {
      examName: 'Mathematics Monthly Quiz 1',
      className: 'Class 10 (Section A)',
      totalStudents: 45,
      passedStudents: 42,
      passPercentage: 93,
      status: 'Published',
    },
    {
      examName: 'Physics Term 1 Exam',
      className: 'Class 11 (Section B)',
      totalStudents: 38,
      passedStudents: 32,
      passPercentage: 84,
      status: 'Published',
    },
    {
      examName: 'Chemistry Practical Quiz',
      className: 'Class 12 (Section A)',
      totalStudents: 40,
      passedStudents: 40,
      passPercentage: 100,
      status: 'Published',
    },
    {
      examName: 'English Literature Test',
      className: 'Class 9 (Section C)',
      totalStudents: 35,
      passedStudents: 30,
      passPercentage: 85,
      status: 'Published',
    },
  ];

  const filteredReports = mockExamReports.filter(
    (report) => !classFilter || report.className.includes(classFilter),
  );

  const handleExportCsv = () => {
    exportToCsv(
      'online-exam-performance-report',
      ['Exam Name', 'Class', 'Total Registered', 'Passed Students', 'Pass %', 'Status'],
      filteredReports.map((row) => [
        row.examName,
        row.className,
        String(row.totalStudents),
        String(row.passedStudents),
        `${row.passPercentage}%`,
        row.status,
      ]),
    );
  };

  return (
    <ModuleReportPack
      title="Online Examination Report"
      description="Performances, registrations, pass/fail counts, and stats for published online examinations."
      printTitle="Online Exam Report"
      printSubtitle={activeSession ? `Session ${activeSession.session}` : undefined}
      onPrint={printReport}
      onExportCsv={handleExportCsv}
      exportDisabled={filteredReports.length === 0}
      sessionLabel={activeSession?.session}
      submitted
      hasData={true}
      isLoading={false}
      isEmpty={filteredReports.length === 0}
      summary={
        <ReportSummaryGrid
          items={[
            { label: 'Total Exams', value: filteredReports.length },
            { label: 'Avg. Pass %', value: '90.5%' },
            { label: 'Top Performer', value: 'Chemistry Practical (100%)' },
          ]}
        />
      }
      filters={
        <FormField label="Filter by Class">
          <Select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            options={[
              { value: '', label: 'All classes' },
              { value: 'Class 10', label: 'Class 10' },
              { value: 'Class 11', label: 'Class 11' },
              { value: 'Class 12', label: 'Class 12' },
              { value: 'Class 9', label: 'Class 9' },
            ]}
          />
        </FormField>
      }
    >
      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-6 py-4">Exam Name</th>
              <th className="px-6 py-4">Class</th>
              <th className="px-6 py-4 text-center">Total Students</th>
              <th className="px-6 py-4 text-center">Passed</th>
              <th className="px-6 py-4">Performance</th>
              <th className="px-6 py-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredReports.map((row, idx) => (
              <tr key={idx} className="transition-colors hover:bg-muted/50">
                <td className="flex items-center gap-2 px-6 py-4 font-medium text-foreground">
                  <Award className="h-4 w-4 text-primary" />
                  {row.examName}
                </td>
                <td className="px-6 py-4 text-muted-foreground">{row.className}</td>
                <td className="px-6 py-4 text-center text-muted-foreground">{row.totalStudents}</td>
                <td className="px-6 py-4 text-center font-semibold text-green-600 text-muted-foreground">
                  {row.passedStudents}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${row.passPercentage}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-ink">{row.passPercentage}%</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-xs font-semibold text-green-700">
                    <CheckCircle className="h-3 w-3" />
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ModuleReportPack>
  );
}
