import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@components/ui/button';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { StatusBadge } from '@components/feedback/StatusBadge';
import type { ExamSchedule } from '@app-types/examinations/exam-schedule';
import { formatDate } from '@utils/format';

interface ExamSchedulesTableProps {
  schedules: ExamSchedule[];
  onEdit: (schedule: ExamSchedule) => void;
  onDelete: (schedule: ExamSchedule) => void;
}

function formatTimeRange(start: string | null, end: string | null): string {
  if (!start && !end) return '—';
  if (start && end) return `${start} – ${end}`;
  return start ?? end ?? '—';
}

const columns: DataTableColumn<ExamSchedule>[] = [
  {
    id: 'exam',
    header: 'Exam',
    cellClassName: 'font-medium',
    cell: (row) => row.exam_name,
  },
  {
    id: 'subject',
    header: 'Subject',
    cell: (row) => row.subject_name,
  },
  {
    id: 'session',
    header: 'Session',
    cellClassName: 'text-muted-foreground',
    cell: (row) => row.session_name,
  },
  {
    id: 'date',
    header: 'Date',
    cellClassName: 'text-muted-foreground',
    cell: (row) => formatDate(row.date_of_exam),
  },
  {
    id: 'time',
    header: 'Time',
    cellClassName: 'text-muted-foreground tabular-nums',
    cell: (row) => formatTimeRange(row.start_time, row.end_time),
  },
  {
    id: 'room',
    header: 'Room',
    cellClassName: 'text-muted-foreground',
    cell: (row) => row.room_no ?? '—',
  },
  {
    id: 'marks',
    header: 'Marks',
    cellClassName: 'tabular-nums text-muted-foreground',
    cell: (row) => {
      if (row.full_marks == null && row.passing_marks == null) return '—';
      return `${row.full_marks ?? '—'} / ${row.passing_marks ?? '—'}`;
    },
  },
  {
    id: 'status',
    header: 'Status',
    cell: (row) => <StatusBadge isActive={row.is_active} />,
  },
];

export function ExamSchedulesTable({ schedules, onEdit, onDelete }: ExamSchedulesTableProps) {
  return (
    <DataTable
      data={schedules}
      columns={columns}
      getRowKey={(schedule) => schedule.id}
      actions={(schedule) => {
        const isActive = schedule.is_active === 'yes';
        return (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(schedule)}
              aria-label={`Edit schedule for ${schedule.subject_name}`}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={isActive}
              onClick={() => onDelete(schedule)}
              aria-label={`Delete schedule for ${schedule.subject_name}`}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        );
      }}
    />
  );
}
