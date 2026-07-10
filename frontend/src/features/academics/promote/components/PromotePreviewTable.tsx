import { Checkbox } from '@components/ui/checkbox';
import type { PromotePreviewStudent } from '@app-types/academics/promote';

interface PromotePreviewTableProps {
  students: PromotePreviewStudent[];
  selectedIds: number[];
  onToggle: (studentId: number, checked: boolean) => void;
  onToggleAll: (checked: boolean) => void;
}

export function PromotePreviewTable({
  students,
  selectedIds,
  onToggle,
  onToggleAll,
}: PromotePreviewTableProps) {
  const eligibleIds = students.filter((s) => s.eligible).map((s) => s.student_id);
  const allEligibleSelected =
    eligibleIds.length > 0 && eligibleIds.every((id) => selectedIds.includes(id));

  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left">
          <tr>
            <th className="px-3 py-2">
              <Checkbox
                checked={allEligibleSelected}
                onChange={(e) => onToggleAll(e.target.checked)}
                aria-label="Select all eligible students"
              />
            </th>
            <th className="px-3 py-2">Admission No</th>
            <th className="px-3 py-2">Name</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2">Notes</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => {
            const notes = [
              ...student.blockers,
              ...(student.fee_warning ? ['Active fees on source enrollment'] : []),
            ];
            return (
              <tr key={student.student_id} className="border-t">
                <td className="px-3 py-2">
                  <Checkbox
                    checked={selectedIds.includes(student.student_id)}
                    disabled={!student.eligible}
                    onChange={(e) => onToggle(student.student_id, e.target.checked)}
                    aria-label={`Select ${student.name ?? student.student_id}`}
                  />
                </td>
                <td className="px-3 py-2">{student.admission_no ?? '—'}</td>
                <td className="px-3 py-2">{student.name ?? '—'}</td>
                <td className="px-3 py-2">
                  {student.eligible ? (
                    <span className="text-green-700">Eligible</span>
                  ) : (
                    <span className="text-amber-700">Skipped</span>
                  )}
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  {notes.length ? notes.join('; ') : '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
