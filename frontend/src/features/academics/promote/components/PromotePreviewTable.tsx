import { useMemo } from 'react';
import { Checkbox } from '@components/ui/checkbox';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import type { PromotePreviewStudent } from '@app-types/academics/promote';

interface PromotePreviewTableProps {
  students: PromotePreviewStudent[];
  selectedIds: number[];
  onToggle: (studentId: number, checked: boolean) => void;
  onToggleAll: (checked: boolean) => void;
}

function studentNotes(student: PromotePreviewStudent): string {
  const notes = [
    ...student.blockers,
    ...(student.fee_warning ? ['Active fees on source enrollment'] : []),
  ];
  return notes.length ? notes.join('; ') : '—';
}

export function PromotePreviewTable({
  students,
  selectedIds,
  onToggle,
  onToggleAll,
}: PromotePreviewTableProps) {
  const eligibleIds = useMemo(
    () => students.filter((s) => s.eligible).map((s) => s.student_id),
    [students],
  );
  const allEligibleSelected =
    eligibleIds.length > 0 && eligibleIds.every((id) => selectedIds.includes(id));

  const columns = useMemo<DataTableColumn<PromotePreviewStudent>[]>(
    () => [
      {
        id: 'select',
        header: (
          <Checkbox
            checked={allEligibleSelected}
            onChange={(e) => onToggleAll(e.target.checked)}
            aria-label="Select all eligible students"
          />
        ),
        cell: (student) => (
          <Checkbox
            checked={selectedIds.includes(student.student_id)}
            disabled={!student.eligible}
            onChange={(e) => onToggle(student.student_id, e.target.checked)}
            aria-label={`Select ${student.name ?? student.student_id}`}
          />
        ),
      },
      {
        id: 'admission_no',
        header: 'Admission No',
        cell: (student) => student.admission_no ?? '—',
      },
      {
        id: 'name',
        header: 'Name',
        cell: (student) => student.name ?? '—',
      },
      {
        id: 'status',
        header: 'Status',
        cell: (student) =>
          student.eligible ? (
            <span className="text-green-700">Eligible</span>
          ) : (
            <span className="text-amber-700">Skipped</span>
          ),
      },
      {
        id: 'notes',
        header: 'Notes',
        cell: (student) => <span className="text-muted-foreground">{studentNotes(student)}</span>,
        wrap: true,
      },
    ],
    [allEligibleSelected, onToggle, onToggleAll, selectedIds],
  );

  return (
    <DataTable
      data={students}
      columns={columns}
      getRowKey={(student) => student.student_id}
      emptyMessage="No students found for the selected source class-section."
    />
  );
}
