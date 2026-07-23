import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { ReportSummaryGrid } from '@components/reports';
import { useDailyAssignments, useHomeworkList } from '@hooks/useHomework';
import type { DailyAssignment, Homework } from '@app-types/academics/homework';
import { exportToCsv } from '@utils/export-csv';
import { printReport } from '@utils/print-report';
import { ModuleReportPack } from '@workflow-packs';

export function HomeworkReportPage() {
  const homeworkQuery = useHomeworkList({ page: 1 });
  const dailyQuery = useDailyAssignments({ page: 1 });

  const homework = homeworkQuery.data?.results ?? [];
  const daily = dailyQuery.data?.results ?? [];

  const isLoading = homeworkQuery.isLoading || dailyQuery.isLoading;
  const isError = homeworkQuery.isError || dailyQuery.isError;
  const error = homeworkQuery.error ?? dailyQuery.error;
  const hasData = homework.length > 0 || daily.length > 0;

  const homeworkColumns: DataTableColumn<Homework>[] = [
    {
      id: 'id',
      header: 'ID',
      cellClassName: 'font-medium tabular-nums',
      cell: (r) => r.id,
    },
    {
      id: 'class',
      header: 'Class / Section',
      cell: (r) => `${r.class_id} / ${r.section_id}`,
    },
    { id: 'homework_date', header: 'Assigned', cell: (r) => r.homework_date || '—' },
    { id: 'submit_date', header: 'Due', cell: (r) => r.submit_date || '—' },
    {
      id: 'description',
      header: 'Description',
      cellClassName: 'text-muted-foreground max-w-xs truncate',
      cell: (r) => r.description || '—',
    },
  ];

  const dailyColumns: DataTableColumn<DailyAssignment>[] = [
    {
      id: 'title',
      header: 'Title',
      cellClassName: 'font-medium',
      cell: (r) => r.title || `Assignment #${r.id}`,
    },
    { id: 'date', header: 'Date', cell: (r) => r.date || '—' },
    {
      id: 'remark',
      header: 'Remark',
      cellClassName: 'text-muted-foreground',
      cell: (r) => r.remark || '—',
    },
  ];

  const handleExportCsv = () => {
    exportToCsv(
      'homework-report',
      ['Section', 'Title / ID', 'Date', 'Detail'],
      [
        ...homework.map((row) => [
          'Homework',
          String(row.id),
          row.homework_date || '',
          row.description || '',
        ]),
        ...daily.map((row) => [
          'Daily',
          row.title || String(row.id),
          row.date || '',
          row.remark || '',
        ]),
      ],
    );
  };

  return (
    <ModuleReportPack
      title="Homework Report"
      description="Homework assignments and daily assignment activity."
      printTitle="Homework Report"
      onPrint={printReport}
      onExportCsv={handleExportCsv}
      exportDisabled={!hasData}
      submitted
      hasData={hasData || isLoading}
      isLoading={isLoading}
      loadingMessage="Loading homework report..."
      isError={isError}
      error={error}
      onRetry={() => {
        void homeworkQuery.refetch();
        void dailyQuery.refetch();
      }}
      isEmpty={!isLoading && !isError && !hasData}
      emptyTitle="No homework records"
      emptyDescription="Create homework or daily assignments to populate this report."
      filters={
        <p className="col-span-full text-sm text-muted-foreground">
          Export or print homework and daily assignment lists.
        </p>
      }
      summary={
        hasData ? (
          <ReportSummaryGrid
            items={[
              { label: 'Homework', value: homework.length },
              { label: 'Daily assignments', value: daily.length },
            ]}
          />
        ) : undefined
      }
    >
      <div className="space-y-8">
        {homework.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Homework
            </h2>
            <DataTable data={homework} columns={homeworkColumns} getRowKey={(row) => row.id} />
          </section>
        )}
        {daily.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Daily assignments
            </h2>
            <DataTable data={daily} columns={dailyColumns} getRowKey={(row) => row.id} />
          </section>
        )}
      </div>
    </ModuleReportPack>
  );
}
