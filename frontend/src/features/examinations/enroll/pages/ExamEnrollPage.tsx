import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FormField } from '@components/forms/FormField';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { Select } from '@components/ui/select';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { ExamEnrollmentTable } from '@features/examinations/enroll/components/ExamEnrollmentTable';
import {
  firstSectionIdForClass,
  sectionOptionsForClass,
} from '@features/students/utils/class-section-options';
import {
  useEnrollExamStudents,
  useExamEnrollmentRoster,
  useUnenrollExamStudent,
} from '@hooks/useExamEnrollments';
import { useClasses } from '@hooks/useClasses';
import { useClassSections } from '@hooks/useClassSections';
import { useExams } from '@hooks/useExams';
import type { ExamEnrollmentRosterStudent } from '@app-types/examinations/exam-enrollment';
import { ModuleMarkGridPack } from '@workflow-packs';

export function ExamEnrollPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: examsData } = useExams();
  const exams = examsData?.results || [];
  const { data: classesData } = useClasses();
  const classes = classesData?.results || [];
  const { data: classSectionsData } = useClassSections();
  const classSections = classSectionsData?.results || [];

  const activeExams = useMemo(() => exams.filter((e) => e.is_active === 'yes'), [exams]);

  const [examId, setExamId] = useState(0);
  const [classId, setClassId] = useState(0);
  const [sectionId, setSectionId] = useState(0);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [unenrollTarget, setUnenrollTarget] = useState<ExamEnrollmentRosterStudent | null>(null);

  const activeClasses = useMemo(
    () => classes.filter((c) => c.is_active === 'yes').sort((a, b) => a.sort_order - b.sort_order),
    [classes],
  );

  const sectionOptions = useMemo(
    () => sectionOptionsForClass(classSections, classId),
    [classSections, classId],
  );

  const filtersReady = examId > 0 && classId > 0 && sectionId > 0;
  const {
    data: roster,
    isLoading,
    isError,
    error,
    refetch,
  } = useExamEnrollmentRoster(examId, classId, sectionId, filtersReady);

  const enrollMutation = useEnrollExamStudents();
  const unenrollMutation = useUnenrollExamStudent();

  useEffect(() => {
    if (examId > 0) return;
    const fromQuery = Number(searchParams.get('exam_id') || 0);
    if (fromQuery > 0) {
      setExamId(fromQuery);
      return;
    }
    if (activeExams.length > 0) {
      setExamId(activeExams[0].id);
    }
  }, [searchParams, activeExams, examId]);

  useEffect(() => {
    if (activeClasses.length > 0 && classId === 0) {
      setClassId(activeClasses[0].id);
    }
  }, [activeClasses, classId]);

  useEffect(() => {
    if (classId <= 0) return;
    const nextSectionId = firstSectionIdForClass(classSections, classId);
    if (nextSectionId && sectionId !== nextSectionId) {
      setSectionId(nextSectionId);
    }
  }, [classId, classSections, sectionId]);

  useEffect(() => {
    setSelectedIds([]);
  }, [examId, classId, sectionId, roster?.students]);

  const canEnroll =
    activeExams.length > 0 &&
    activeClasses.length > 0 &&
    classSections.some((row) => row.is_active === 'yes');

  const handleToggle = (studentSessionId: number, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...prev, studentSessionId] : prev.filter((id) => id !== studentSessionId),
    );
  };

  const handleToggleAll = (checked: boolean) => {
    if (!roster) return;
    if (!checked) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds(
      roster.students.filter((row) => !row.is_enrolled).map((row) => row.student_session_id),
    );
  };

  const handleEnroll = () => {
    if (!examId || selectedIds.length === 0) return;
    enrollMutation.mutate(
      { exam_id: examId, student_session_ids: selectedIds },
      { onSuccess: () => setSelectedIds([]) },
    );
  };

  return (
    <>
      <ModuleMarkGridPack
        title="Enroll Students"
        description="Select an exam, then enroll class-section students so results entry has a roster."
        prerequisiteHint={
          !canEnroll ? (
            <p className="text-sm text-muted-foreground">
              Create an active exam and configure class-section mappings before enrolling.
            </p>
          ) : undefined
        }
        filters={
          <>
            <FormField label="Exam" htmlFor="exam_enroll_exam">
              <Select
                id="exam_enroll_exam"
                placeholder="Select exam"
                options={activeExams.map((e) => ({
                  value: String(e.id),
                  label: e.name,
                }))}
                value={examId ? String(examId) : ''}
                onChange={(e) => {
                  const nextId = Number(e.target.value);
                  setExamId(nextId);
                  const params = new URLSearchParams(searchParams);
                  if (nextId > 0) params.set('exam_id', String(nextId));
                  else params.delete('exam_id');
                  setSearchParams(params, { replace: true });
                }}
                disabled={!canEnroll}
              />
            </FormField>
            <FormField label="Class" htmlFor="exam_enroll_class">
              <Select
                id="exam_enroll_class"
                placeholder="Select class"
                options={activeClasses.map((c) => ({
                  value: String(c.id),
                  label: c.class_name,
                }))}
                value={classId ? String(classId) : ''}
                onChange={(e) => {
                  const nextClassId = Number(e.target.value);
                  setClassId(nextClassId);
                  const nextSectionId = firstSectionIdForClass(classSections, nextClassId);
                  setSectionId(nextSectionId ?? 0);
                }}
                disabled={!canEnroll}
              />
            </FormField>
            <FormField label="Section" htmlFor="exam_enroll_section">
              <Select
                id="exam_enroll_section"
                placeholder="Select section"
                options={sectionOptions}
                value={sectionId ? String(sectionId) : ''}
                onChange={(e) => setSectionId(Number(e.target.value))}
                disabled={!canEnroll || sectionOptions.length === 0}
              />
            </FormField>
            <FormField label="Session" htmlFor="exam_enroll_session">
              <Select
                id="exam_enroll_session"
                placeholder="Exam session"
                options={
                  roster?.session_name
                    ? [{ value: roster.session_name, label: roster.session_name }]
                    : []
                }
                value={roster?.session_name ?? ''}
                disabled
              />
            </FormField>
          </>
        }
        actions={
          <PermissionButton
            permission="exams.create"
            disabled={selectedIds.length === 0 || enrollMutation.isPending}
            onClick={handleEnroll}
          >
            Enroll selected ({selectedIds.length})
          </PermissionButton>
        }
        isLoading={filtersReady && isLoading}
        loadingMessage="Loading students..."
        isError={filtersReady && isError}
        error={error}
        onRetry={() => void refetch()}
        isEmpty={filtersReady && !isLoading && !isError && (roster?.students.length ?? 0) === 0}
        emptyTitle="No students in this class section"
        emptyDescription="Choose another class or section with students in the exam session."
      >
        {filtersReady && roster ? (
          <ExamEnrollmentTable
            students={roster.students}
            selectedIds={selectedIds}
            onToggle={handleToggle}
            onToggleAll={handleToggleAll}
            onUnenroll={setUnenrollTarget}
            isUnenrollPending={unenrollMutation.isPending}
          />
        ) : null}
      </ModuleMarkGridPack>

      <ConfirmDialog
        open={unenrollTarget !== null}
        onOpenChange={(open) => {
          if (!open) setUnenrollTarget(null);
        }}
        title="Remove student from exam?"
        description={
          unenrollTarget ? `Remove ${unenrollTarget.full_name} from this exam enrollment?` : ''
        }
        confirmLabel="Remove"
        destructive
        isLoading={unenrollMutation.isPending}
        onConfirm={() => {
          if (!unenrollTarget?.enrollment_id) return;
          unenrollMutation.mutate(unenrollTarget.enrollment_id, {
            onSuccess: () => setUnenrollTarget(null),
          });
        }}
      />
    </>
  );
}
