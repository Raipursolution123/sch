import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { FormField } from '@components/forms/FormField';
import { Input } from '@components/ui/input';
import { Select } from '@components/ui/select';
import { useClasses } from '@hooks/useClasses';
import { useClassSections } from '@hooks/useClassSections';
import { sectionOptionsForClass } from '@features/students/utils/class-section-options';
import { todayIsoDate } from '@utils/student';
import { ModuleMarkGridPack } from '@workflow-packs';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@services/api/client';

interface ReportRow {
  id: number;
  admission_no: string;
  student_name: string;
  subject_name: string;
  time_from: string;
  status: string;
  remark: string;
}

export function PeriodAttendanceByDatePage() {
  const { data: classesData } = useClasses();
  const classes = classesData?.results || [];
  const { data: classSectionsData } = useClassSections();
  const classSections = classSectionsData?.results || [];

  const [date, setDate] = useState(todayIsoDate());
  const [classId, setClassId] = useState<number>(0);
  const [sectionId, setSectionId] = useState<number>(0);
  const [hasSearched, setHasSearched] = useState(false);

  const activeClasses = useMemo(
    () => classes.filter((c) => c.is_active === 'yes').sort((a, b) => a.sort_order - b.sort_order),
    [classes]
  );

  const sectionOptions = useMemo(
    () => sectionOptionsForClass(classSections, classId),
    [classSections, classId]
  );

  const filtersReady = classId > 0 && sectionId > 0 && Boolean(date);

  // Fetch periods for the selected class/section/date
  const { data: periods = [], isLoading: periodsLoading } = useQuery({
    queryKey: ['attendance', 'subject', 'periods', classId, sectionId, date],
    queryFn: async () => {
      const { data } = await apiClient.get('/attendance/subject/periods/', {
        params: { class_id: classId, section_id: sectionId, date },
      });
      return data.data || [];
    },
    enabled: filtersReady && hasSearched,
  });

  // Fetch rosters for all periods on this date and aggregate
  const { data: reportRecords = [], isLoading: reportLoading, refetch } = useQuery({
    queryKey: ['attendance', 'subject', 'report-by-date', classId, sectionId, date, periods],
    queryFn: async () => {
      const rows: ReportRow[] = [];
      let rowId = 1;

      for (const period of periods) {
        try {
          const { data } = await apiClient.get('/attendance/subject/roster/', {
            params: { subject_timetable_id: period.id, date },
          });
          const entries = data.data?.entries || [];

          for (const entry of entries) {
            // Only add if attendance has been marked
            rows.push({
              id: rowId++,
              admission_no: entry.admission_no || '',
              student_name: entry.full_name || '',
              subject_name: period.subject_name || 'Subject',
              time_from: period.time_from || period.start_time || '—',
              status: entry.status_label || 'Not Marked',
              remark: entry.remark || '',
            });
          }
        } catch (e) {
          // ignore error
        }
      }
      return rows;
    },
    enabled: periods.length > 0 && hasSearched,
  });

  const handleSearch = () => {
    if (!classId || !sectionId) {
      return;
    }
    setHasSearched(true);
  };

  const columns: DataTableColumn<ReportRow>[] = [
    { id: 'admission_no', header: 'Admission No', cell: (r) => r.admission_no },
    { id: 'student_name', header: 'Student Name', cellClassName: 'font-medium', cell: (r) => r.student_name },
    { id: 'subject_name', header: 'Subject', cell: (r) => r.subject_name },
    { id: 'time_from', header: 'Time', cell: (r) => r.time_from },
    { id: 'status', header: 'Status', cell: (r) => r.status },
    { id: 'remark', header: 'Remark', cell: (r) => r.remark || '—' },
  ];

  return (
    <ModuleMarkGridPack
      title="Period Attendance By Date"
      description="View and verify student period-wise attendance reports for a specific date."
      actions={
        <button
          onClick={handleSearch}
          disabled={!filtersReady}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          <Search className="h-4 w-4" />
          Search Report
        </button>
      }
      filters={
        <>
          <FormField label="Date" htmlFor="period_date">
            <Input id="period_date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </FormField>
          <FormField label="Class" htmlFor="period_class">
            <Select
              id="period_class"
              options={activeClasses.map((c) => ({ value: String(c.id), label: c.class_name }))}
              value={classId ? String(classId) : ''}
              onChange={(e) => {
                setClassId(Number(e.target.value));
                setSectionId(0);
                setHasSearched(false);
              }}
              placeholder="Select class"
            />
          </FormField>
          <FormField label="Section" htmlFor="period_section">
            <Select
              id="period_section"
              options={sectionOptions}
              value={sectionId ? String(sectionId) : ''}
              onChange={(e) => {
                setSectionId(Number(e.target.value));
                setHasSearched(false);
              }}
              placeholder="Select section"
              disabled={!classId}
            />
          </FormField>
        </>
      }
      filtersReady={filtersReady}
      isLoading={periodsLoading || reportLoading}
      isEmpty={!hasSearched || reportRecords.length === 0}
      emptyTitle={hasSearched ? 'No records found' : 'Select parameters'}
      emptyDescription={
        hasSearched
          ? 'No subject attendance records exist for the selected class, section, and date.'
          : 'Select Class, Section, and Date, then click Search to display the attendance report.'
      }
      onRetry={() => void refetch()}
    >
      <DataTable data={reportRecords} columns={columns} getRowKey={(r) => r.id} />
    </ModuleMarkGridPack>
  );
}
