import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog';
import { Button } from '@components/ui/button';
import { LoadingState } from '@components/feedback/LoadingState';
import { ErrorState } from '@components/feedback/ErrorState';
import { Printer } from 'lucide-react';
import { useCbseMarksheet } from '@hooks/useCbseMarks';
import { formatClassSection } from '@utils/student';

interface CbseMarksheetPrintModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  examId: number;
  cbseExamStudentId: number;
}

export function CbseMarksheetPrintModal({
  open,
  onOpenChange,
  examId,
  cbseExamStudentId,
}: CbseMarksheetPrintModalProps) {
  const { data, isLoading, isError, error, refetch } = useCbseMarksheet(
    examId,
    cbseExamStudentId,
    open && examId > 0 && cbseExamStudentId > 0,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto print:max-w-none">
        <DialogHeader className="print:hidden">
          <DialogTitle>CBSE Marksheet</DialogTitle>
        </DialogHeader>

        {isLoading ? <LoadingState message="Loading marksheet..." /> : null}
        {isError ? (
          <ErrorState
            title="Could not load marksheet"
            message={error instanceof Error ? error.message : 'Unknown error'}
            onRetry={() => void refetch()}
          />
        ) : null}

        {data ? (
          <div className="rounded-lg border-2 border-primary/20 bg-white p-6 text-gray-900 shadow-md print:border print:shadow-none">
            <div className="mb-4 border-b-2 border-primary pb-3">
              <h2 className="text-xl font-bold uppercase tracking-wide text-primary">
                {data.exam_name}
              </h2>
              <p className="text-xs font-semibold text-muted-foreground">
                Progress Report / Marksheet
              </p>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-3 rounded border bg-muted/20 p-3 text-xs md:grid-cols-4">
              <div>
                <span className="block text-[10px] font-semibold uppercase text-gray-500">
                  Student
                </span>
                <span className="text-sm font-bold">{data.full_name}</span>
              </div>
              <div>
                <span className="block text-[10px] font-semibold uppercase text-gray-500">
                  Admission No.
                </span>
                <span className="font-mono font-semibold">{data.admission_no || '—'}</span>
              </div>
              <div>
                <span className="block text-[10px] font-semibold uppercase text-gray-500">
                  Class / Section
                </span>
                <span className="font-semibold">
                  {formatClassSection(data.class_name, data.section_name)}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-semibold uppercase text-gray-500">
                  Roll No.
                </span>
                <span className="font-semibold">{data.roll_no ?? '—'}</span>
              </div>
            </div>

            <div className="overflow-hidden rounded border">
              <table className="w-full text-left text-xs">
                <thead className="border-b bg-gray-100 font-semibold text-gray-700">
                  <tr>
                    <th className="p-2">Subject</th>
                    <th className="p-2 text-right">Max</th>
                    <th className="p-2 text-right">Obtained</th>
                    <th className="p-2 text-right">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.subjects.map((subject) => (
                    <tr key={`${subject.subject_id}-${subject.subject_name}`}>
                      <td className="p-2 font-medium">{subject.subject_name}</td>
                      <td className="p-2 text-right font-mono">{subject.maximum_marks}</td>
                      <td className="p-2 text-right font-mono">
                        {subject.is_absent ? 'Absent' : subject.obtained_marks}
                      </td>
                      <td className="p-2 text-right">{subject.grade ?? '—'}</td>
                    </tr>
                  ))}
                  <tr className="bg-primary/5 font-bold">
                    <td className="p-2 text-primary">Total</td>
                    <td className="p-2 text-right font-mono">{data.total_maximum_marks}</td>
                    <td className="p-2 text-right font-mono">{data.total_obtained_marks}</td>
                    <td className="p-2 text-right">{data.percentage}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        <DialogFooter className="print:hidden">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button type="button" onClick={() => window.print()} disabled={!data}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
