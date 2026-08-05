import { useEffect, useMemo, useState } from 'react';
import { Printer, Save } from 'lucide-react';
import { FormField } from '@components/forms/FormField';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { Combobox } from '@components/ui/combobox';
import { Input } from '@components/ui/input';
import { Select } from '@components/ui/select';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { CbseMarksheetPrintModal } from '@features/examinations/cbse-exams/components/CbseMarksheetPrintModal';
import { useCbseExams } from '@hooks/useCbseExams';
import { useCbseMarksRoster, useCbseTimetable, useSaveCbseMarks } from '@hooks/useCbseMarks';
import type { CbseMarksStudentRow } from '@app-types/examinations/cbse-marks';
import { ModuleMarkGridPack } from '@workflow-packs';

type EditableRow = CbseMarksStudentRow;

export function CbseMarksPage() {
  const { data: exams = [] } = useCbseExams();
  const [examId, setExamId] = useState(0);
  const [timetableId, setTimetableId] = useState(0);
  const [assessmentTypeId, setAssessmentTypeId] = useState<number | null>(null);
  const [rows, setRows] = useState<EditableRow[]>([]);
  const [printStudentId, setPrintStudentId] = useState(0);
  const [printOpen, setPrintOpen] = useState(false);

  const activeExams = useMemo(() => exams.filter((e) => e.is_active), [exams]);
  const { data: timetable = [] } = useCbseTimetable(examId, examId > 0);

  const selectedTimetable = timetable.find((t) => t.id === timetableId);
  const assessmentOptions = useMemo(
    () =>
      (selectedTimetable?.assessments || []).map((a) => ({
        value: String(a.assessment_type_id),
        label: `${a.assessment_name ?? 'Assessment'}${
          a.maximum_marks != null ? ` (Max ${a.maximum_marks})` : ''
        }`,
      })),
    [selectedTimetable],
  );

  const filtersReady = examId > 0 && timetableId > 0;
  const {
    data: roster,
    isLoading,
    isError,
    error,
    refetch,
  } = useCbseMarksRoster(examId, timetableId, assessmentTypeId, filtersReady);

  const saveMutation = useSaveCbseMarks();

  useEffect(() => {
    if (examId === 0 && activeExams.length > 0) {
      setExamId(activeExams[0].id);
    }
  }, [activeExams, examId]);

  useEffect(() => {
    if (examId <= 0) {
      setTimetableId(0);
      return;
    }
    if (timetable.length === 0) {
      setTimetableId(0);
      return;
    }
    if (!timetable.some((t) => t.id === timetableId)) {
      setTimetableId(timetable[0].id);
    }
  }, [examId, timetable, timetableId]);

  useEffect(() => {
    if (!selectedTimetable) {
      setAssessmentTypeId(null);
      return;
    }
    const first = selectedTimetable.assessments[0]?.assessment_type_id ?? null;
    if (
      assessmentTypeId == null ||
      !selectedTimetable.assessments.some((a) => a.assessment_type_id === assessmentTypeId)
    ) {
      setAssessmentTypeId(first);
    }
  }, [selectedTimetable, assessmentTypeId]);

  useEffect(() => {
    if (roster) setRows(roster.students);
  }, [roster]);

  const columns = useMemo<DataTableColumn<EditableRow>[]>(
    () => [
      {
        id: 'roll',
        header: 'Roll',
        cellClassName: 'tabular-nums',
        cell: (row) => row.roll_no ?? '—',
      },
      {
        id: 'student',
        header: 'Student',
        cellClassName: 'font-medium',
        cell: (row) => (
          <div>
            <div>{row.full_name}</div>
            <div className="text-xs text-muted-foreground">{row.admission_no}</div>
          </div>
        ),
      },
      {
        id: 'marks',
        header: `Marks${roster?.maximum_marks ? ` / ${roster.maximum_marks}` : ''}`,
        cell: (row) => (
          <Input
            type="number"
            className="h-8 w-24"
            min={0}
            max={roster?.maximum_marks || undefined}
            step={0.01}
            disabled={row.is_absent || saveMutation.isPending}
            value={row.is_absent ? '' : row.marks}
            onChange={(e) => {
              const value = Number(e.target.value);
              setRows((prev) =>
                prev.map((item) =>
                  item.cbse_exam_student_id === row.cbse_exam_student_id
                    ? { ...item, marks: Number.isFinite(value) ? value : 0 }
                    : item,
                ),
              );
            }}
          />
        ),
      },
      {
        id: 'absent',
        header: 'Absent',
        cell: (row) => (
          <input
            type="checkbox"
            checked={row.is_absent}
            disabled={saveMutation.isPending}
            onChange={(e) => {
              const checked = e.target.checked;
              setRows((prev) =>
                prev.map((item) =>
                  item.cbse_exam_student_id === row.cbse_exam_student_id
                    ? { ...item, is_absent: checked, marks: checked ? 0 : item.marks }
                    : item,
                ),
              );
            }}
          />
        ),
      },
      {
        id: 'grade',
        header: 'Grade',
        cell: (row) => (
          <Input
            className="h-8 w-20"
            value={row.marks_grade ?? ''}
            disabled={saveMutation.isPending}
            onChange={(e) => {
              const value = e.target.value;
              setRows((prev) =>
                prev.map((item) =>
                  item.cbse_exam_student_id === row.cbse_exam_student_id
                    ? { ...item, marks_grade: value || null }
                    : item,
                ),
              );
            }}
          />
        ),
      },
      {
        id: 'print',
        header: '',
        cellClassName: 'text-right',
        cell: (row) => (
          <PermissionButton
            permission="exams.edit"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              setPrintStudentId(row.cbse_exam_student_id);
              setPrintOpen(true);
            }}
            title="Print marksheet"
          >
            <Printer className="h-4 w-4" />
          </PermissionButton>
        ),
      },
    ],
    [roster?.maximum_marks, saveMutation.isPending],
  );

  const handleSave = () => {
    if (!roster) return;
    saveMutation.mutate({
      exam_id: examId,
      timetable_id: timetableId,
      assessment_type_id: assessmentTypeId,
      entries: rows.map((row) => ({
        cbse_exam_student_id: row.cbse_exam_student_id,
        marks: row.marks,
        is_absent: row.is_absent,
        note: row.note,
        marks_grade: row.marks_grade,
      })),
    });
  };

  return (
    <>
      <ModuleMarkGridPack
        title="CBSE Marks"
        description="Enter and print CBSE subject marks from production exam data."
        filters={
          <div className="grid gap-3 md:grid-cols-3">
            <FormField label="CBSE Exam" htmlFor="cbse-exam">
              <Combobox
                id="cbse-exam"
                options={activeExams.map((e) => ({ value: String(e.id), label: e.name }))}
                value={examId > 0 ? String(examId) : ''}
                onValueChange={(v) => setExamId(Number(v) || 0)}
                placeholder="Select exam"
              />
            </FormField>
            <FormField label="Subject / Timetable" htmlFor="cbse-timetable">
              <Combobox
                id="cbse-timetable"
                options={timetable.map((t) => ({
                  value: String(t.id),
                  label: t.subject_name
                    ? `${t.subject_name}${t.date ? ` (${t.date})` : ''}`
                    : `Subject #${t.subject_id}`,
                }))}
                value={timetableId > 0 ? String(timetableId) : ''}
                onValueChange={(v) => setTimetableId(Number(v) || 0)}
                placeholder="Select subject"
              />
            </FormField>
            <FormField label="Assessment" htmlFor="cbse-assessment">
              <Select
                id="cbse-assessment"
                options={assessmentOptions}
                value={assessmentTypeId != null ? String(assessmentTypeId) : ''}
                onChange={(e) => setAssessmentTypeId(Number(e.target.value) || null)}
                disabled={assessmentOptions.length === 0}
              />
            </FormField>
          </div>
        }
        actions={
          <PermissionButton
            permission="exams.edit"
            onClick={handleSave}
            disabled={!roster || rows.length === 0 || saveMutation.isPending}
          >
            <Save className="mr-2 h-4 w-4" />
            Save Marks
          </PermissionButton>
        }
        filtersReady={filtersReady}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={() => void refetch()}
        isEmpty={roster != null && rows.length === 0}
        emptyTitle="No enrolled students"
        emptyDescription="This exam has no enrolled students for marks entry."
      >
        {roster ? (
          <DataTable data={rows} columns={columns} getRowKey={(row) => row.cbse_exam_student_id} />
        ) : null}
      </ModuleMarkGridPack>

      <CbseMarksheetPrintModal
        open={printOpen}
        onOpenChange={setPrintOpen}
        examId={examId}
        cbseExamStudentId={printStudentId}
      />
    </>
  );
}
