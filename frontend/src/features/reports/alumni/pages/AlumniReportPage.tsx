import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { ReportSummaryGrid } from '@components/reports';
import { useAlumniReport } from '@hooks/useAlumni';
import type { AlumniStudent } from '@app-types/alumni';
import { exportToCsv } from '@utils/export-csv';
import { printReport } from '@utils/print-report';
import { ModuleReportPack } from '@workflow-packs';

const columns: DataTableColumn<AlumniStudent>[] = [
  {
    id: 'student_name',
    header: 'Student',
    cellClassName: 'font-medium',
    cell: (r) => r.student_name || `Student #${r.student_id}`,
  },
  { id: 'admission_no', header: 'Admission No', cell: (r) => r.admission_no || '—' },
  { id: 'current_email', header: 'Email', cell: (r) => r.current_email || '—' },
  { id: 'current_phone', header: 'Phone', cell: (r) => r.current_phone || '—' },
  { id: 'occupation', header: 'Occupation', cell: (r) => r.occupation || '—' },
  {
    id: 'address',
    header: 'Address',
    cellClassName: 'text-muted-foreground',
    cell: (r) => r.address || '—',
  },
];

export function AlumniReportPage() {
  const { data = [], isLoading, isError, error, refetch } = useAlumniReport();

  const handleExportCsv = () => {
    exportToCsv(
      'alumni-report',
      ['Student', 'Admission No', 'Email', 'Phone', 'Occupation', 'Address'],
      data.map((row) => [
        row.student_name || String(row.student_id),
        row.admission_no || '',
        row.current_email || '',
        row.current_phone || '',
        row.occupation || '',
        row.address || '',
      ]),
    );
  };

  return (
    <ModuleReportPack
      title="Alumni Report"
      description="Read-only directory of alumni contact details."
      printTitle="Alumni Report"
      onPrint={printReport}
      onExportCsv={handleExportCsv}
      exportDisabled={data.length === 0}
      submitted
      hasData={data.length > 0 || isLoading}
      isLoading={isLoading}
      loadingMessage="Loading alumni report..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && data.length === 0}
      emptyTitle="No alumni"
      emptyDescription="Alumni records will appear here once created."
      filters={
        <p className="col-span-full text-sm text-muted-foreground">
          Export or print the full alumni directory.
        </p>
      }
      summary={
        data.length > 0 ? (
          <ReportSummaryGrid items={[{ label: 'Alumni', value: data.length }]} />
        ) : undefined
      }
    >
      {data.length > 0 && <DataTable data={data} columns={columns} getRowKey={(row) => row.id} />}
    </ModuleReportPack>
  );
}
