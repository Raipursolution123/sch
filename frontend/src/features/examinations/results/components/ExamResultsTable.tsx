import { Input } from '@components/ui/input';
import { Select } from '@components/ui/select';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import type {
  ExamResultAttendence,
  ExamResultRosterStudent,
} from '@app-types/examinations/exam-result';

export type ExamResultRow = ExamResultRosterStudent;

interface ExamResultsTableProps {
  students: ExamResultRow[];
  fullMarks: number | null;
  onMarksChange: (enrollmentId: number, marks: number) => void;
  onAttendenceChange: (enrollmentId: number, attendence: ExamResultAttendence) => void;
  onNoteChange: (enrollmentId: number, note: string) => void;
}

const ATTENDENCE_OPTIONS = [
  { value: 'present', label: 'Present' },
  { value: 'absent', label: 'Absent' },
];

export function ExamResultsTable({
  students,
  fullMarks,
  onMarksChange,
  onAttendenceChange,
  onNoteChange,
}: ExamResultsTableProps) {
  const columns: DataTableColumn<ExamResultRow>[] = [
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
      cell: (row) => (
        <Select
          aria-label={`Attendance for ${row.full_name}`}
          options={ATTENDENCE_OPTIONS}
          value={row.attendence === 'absent' ? 'absent' : 'present'}
          onChange={(e) =>
            onAttendenceChange(
              row.exam_group_class_batch_exam_student_id,
              e.target.value as ExamResultAttendence,
            )
          }
        />
      ),
    },
    {
      id: 'marks',
      header: fullMarks != null ? `Marks / ${fullMarks}` : 'Marks',
      cell: (row) => (
        <Input
          type="number"
          min={0}
          max={fullMarks ?? undefined}
          step="0.01"
          aria-label={`Marks for ${row.full_name}`}
          value={row.get_marks}
          disabled={row.attendence === 'absent'}
          onChange={(e) => {
            const next = e.target.value;
            onMarksChange(
              row.exam_group_class_batch_exam_student_id,
              next === '' ? 0 : Number(next),
            );
          }}
          className="w-28 tabular-nums"
        />
      ),
    },
    {
      id: 'note',
      header: 'Note',
      cell: (row) => (
        <Input
          aria-label={`Note for ${row.full_name}`}
          value={row.note ?? ''}
          placeholder="Optional"
          onChange={(e) => onNoteChange(row.exam_group_class_batch_exam_student_id, e.target.value)}
        />
      ),
    },
  ];

  return (
    <DataTable
      data={students}
      columns={columns}
      getRowKey={(row) => row.exam_group_class_batch_exam_student_id}
    />
  );
}
