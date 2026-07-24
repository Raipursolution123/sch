import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import type { ExamResultRosterStudent } from '@app-types/examinations/exam-result';

interface ExamReportTableProps {
  students: ExamResultRosterStudent[];
  fullMarks: number | null;
}

export function ExamReportTable({ students, fullMarks }: ExamReportTableProps) {
  const columns: DataTableColumn<ExamResultRosterStudent>[] = [
    {
      id: 'roll',
      header: 'Roll',
      cellClassName: 'tabular-nums text-muted-foreground w-16',
      cell: (row) => row.roll_no ?? '—',
    },
    {
      id: 'student',
      header: 'Student',
      cellClassName: 'font-medium',
      cell: (row) => (
        <div>
          <span>{row.full_name}</span>
          <p className="text-xs font-normal text-muted-foreground">{row.admission_no ?? '—'}</p>
        </div>
      ),
    },
    {
      id: 'attendence',
      header: 'Attendance',
      cell: (row) => (row.attendence === 'absent' ? 'Absent' : 'Present'),
    },
    {
      id: 'marks',
      header: fullMarks != null ? `Marks / ${fullMarks}` : 'Marks',
      cellClassName: 'tabular-nums',
      cell: (row) => (row.attendence === 'absent' ? '—' : row.get_marks),
    },
    {
      id: 'note',
      header: 'Note',
      cellClassName: 'text-muted-foreground max-w-xs truncate',
      cell: (row) => row.note?.trim() || '—',
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={students}
      getRowKey={(row) => row.exam_group_class_batch_exam_student_id}
      emptyMessage="No exam results for this paper."
    />
  );
}
