import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ListChecks, Pencil, Plus, Trash2, Users } from 'lucide-react';
import { z } from 'zod';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormField } from '@components/forms/FormField';
import {
  FormNumberField,
  FormSelectField,
  FormSwitchField,
  FormTextField,
  FormTextareaField,
} from '@components/forms/fields';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { Button } from '@components/ui/button';
import { Checkbox } from '@components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog';
import { Select } from '@components/ui/select';
import {
  firstSectionIdForClass,
  sectionOptionsForClass,
} from '@features/students/utils/class-section-options';
import {
  useAddOnlineExamQuestions,
  useAssignOnlineExamStudents,
  useCreateOnlineExam,
  useDeleteOnlineExam,
  useOnlineExamQuestions,
  useOnlineExamRoster,
  useOnlineExams,
  useQuestions,
  useRemoveOnlineExamQuestion,
  useUnassignOnlineExamStudent,
  useUpdateOnlineExam,
} from '@hooks/useOnlineExams';
import { useClasses } from '@hooks/useClasses';
import { useClassSections } from '@hooks/useClassSections';
import { useSessions } from '@hooks/useSessions';
import type {
  OnlineExam,
  OnlineExamQuestionLink,
  OnlineExamRosterStudent,
} from '@app-types/examinations/online-exams';
import { ModuleListPack } from '@workflow-packs';

const durationPattern = /^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/;

const schema = z.object({
  session_id: z.string().min(1, 'Session is required'),
  exam: z.string().trim().min(1, 'Exam name is required'),
  attempt: z.number({ error: 'Attempts is required' }).min(1),
  duration: z.string().trim().regex(durationPattern, 'Use HH:MM:SS (e.g. 01:00:00)'),
  passing_percentage: z.string().trim().min(1, 'Passing % is required'),
  description: z.string().optional(),
  is_active: z.boolean(),
  is_quiz: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

const defaultValues: FormValues = {
  session_id: '',
  exam: '',
  attempt: 1,
  duration: '01:00:00',
  passing_percentage: '0',
  description: '',
  is_active: true,
  is_quiz: false,
};

export function OnlineExamsPage() {
  const { data = [], isLoading, isError, error, refetch } = useOnlineExams();
  const { data: sessionsData } = useSessions();
  const sessions = sessionsData?.results || [];
  const createMutation = useCreateOnlineExam();
  const updateMutation = useUpdateOnlineExam();
  const deleteMutation = useDeleteOnlineExam();

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<OnlineExam | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<OnlineExam | null>(null);
  const [questionsExam, setQuestionsExam] = useState<OnlineExam | null>(null);
  const [assignExam, setAssignExam] = useState<OnlineExam | null>(null);

  const { control, handleSubmit, reset, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const sessionOptions = useMemo(
    () => sessions.map((s) => ({ value: String(s.id), label: s.session })),
    [sessions],
  );

  const sessionLabel = useMemo(() => {
    const map = new Map(sessions.map((s) => [s.id, s.session]));
    return (id: number | null) => (id ? map.get(id) || String(id) : '—');
  }, [sessions]);

  const columns: DataTableColumn<OnlineExam>[] = useMemo(
    () => [
      {
        id: 'exam',
        header: 'Exam',
        cellClassName: 'font-medium',
        cell: (r) => r.exam || '—',
      },
      {
        id: 'session',
        header: 'Session',
        cell: (r) => sessionLabel(r.session_id),
      },
      {
        id: 'duration',
        header: 'Duration',
        cell: (r) => r.duration || '—',
      },
      {
        id: 'passing',
        header: 'Passing %',
        cell: (r) => r.passing_percentage,
      },
      {
        id: 'questions',
        header: 'Questions',
        cell: (r) => r.question_count ?? 0,
      },
      {
        id: 'students',
        header: 'Students',
        cell: (r) => r.student_count ?? 0,
      },
      {
        id: 'status',
        header: 'Status',
        cell: (r) => (r.is_active === '1' || r.is_active === 'yes' ? 'Active' : 'Inactive'),
      },
    ],
    [sessionLabel],
  );

  useEffect(() => {
    if (!open) return;
    if (selected) {
      reset({
        session_id: selected.session_id ? String(selected.session_id) : '',
        exam: selected.exam || '',
        attempt: selected.attempt || 1,
        duration: selected.duration || '01:00:00',
        passing_percentage: selected.passing_percentage || '0',
        description: selected.description || '',
        is_active: selected.is_active === '1' || selected.is_active === 'yes',
        is_quiz: selected.is_quiz === 1,
      });
      return;
    }
    reset({
      ...defaultValues,
      session_id: sessionOptions[0]?.value || '',
    });
  }, [open, selected, reset, sessionOptions]);

  const addAction = (
    <PermissionButton
      permission="onlineexams.exam.create"
      onClick={() => {
        setSelected(null);
        setOpen(true);
      }}
      className="gap-1"
    >
      <Plus className="h-4 w-4" />
      Add Exam
    </PermissionButton>
  );

  return (
    <>
      <ModuleListPack
        title="Online Examinations"
        description="Create online exams, attach questions, and assign students."
        actions={addAction}
        isLoading={isLoading}
        loadingMessage="Loading online exams..."
        isError={isError}
        error={error}
        onRetry={() => void refetch()}
        isEmpty={!isLoading && !isError && data.length === 0}
        emptyTitle="No online exams"
        emptyDescription="Create an exam, then manage questions and assign students."
        emptyAction={addAction}
      >
        <DataTable
          data={data}
          columns={columns}
          getRowKey={(r) => r.id}
          actions={(row) => (
            <>
              <PermissionButton
                permission="onlineexams.exam.questions"
                variant="ghost"
                size="sm"
                title="Manage questions"
                onClick={() => setQuestionsExam(row)}
              >
                <ListChecks className="h-4 w-4" />
              </PermissionButton>
              <PermissionButton
                permission="onlineexams.exam.assign"
                variant="ghost"
                size="sm"
                title="Assign students"
                onClick={() => setAssignExam(row)}
              >
                <Users className="h-4 w-4" />
              </PermissionButton>
              <PermissionButton
                permission="onlineexams.exam.edit"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelected(row);
                  setOpen(true);
                }}
              >
                <Pencil className="h-4 w-4" />
              </PermissionButton>
              <PermissionButton
                permission="onlineexams.exam.delete"
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => setDeleteTarget(row)}
              >
                <Trash2 className="h-4 w-4" />
              </PermissionButton>
            </>
          )}
        />
      </ModuleListPack>

      <EntityFormDialog
        open={open}
        onOpenChange={setOpen}
        title={selected ? 'Edit Online Exam' : 'Add Online Exam'}
        scrollable
        onSubmit={handleSubmit((values) => {
          const payload = {
            session_id: Number(values.session_id),
            exam: values.exam,
            attempt: values.attempt,
            duration: values.duration,
            passing_percentage: values.passing_percentage,
            description: values.description || '',
            is_active: values.is_active ? '1' : '0',
            is_quiz: values.is_quiz ? 1 : 0,
          };
          if (selected) {
            updateMutation.mutate(
              { id: selected.id, payload },
              { onSuccess: () => setOpen(false) },
            );
            return;
          }
          createMutation.mutate(payload, { onSuccess: () => setOpen(false) });
        })}
        isLoading={createMutation.isPending || updateMutation.isPending}
      >
        <FormErrorSummary errors={formState.errors} />
        <FormSelectField
          control={control}
          name="session_id"
          label="Session"
          options={sessionOptions}
          required
        />
        <FormTextField control={control} name="exam" label="Exam name" required />
        <FormNumberField control={control} name="attempt" label="Attempts" min={1} />
        <FormTextField
          control={control}
          name="duration"
          label="Duration"
          hint="HH:MM:SS"
          required
        />
        <FormTextField control={control} name="passing_percentage" label="Passing %" required />
        <FormTextareaField control={control} name="description" label="Description" />
        <FormSwitchField control={control} name="is_active" label="Active" />
        <FormSwitchField control={control} name="is_quiz" label="Quiz mode" />
      </EntityFormDialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete online exam?"
        description={`Remove “${deleteTarget?.exam ?? ''}” and its question/student links.`}
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteMutation.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
        }}
        isLoading={deleteMutation.isPending}
      />

      {questionsExam ? (
        <ManageQuestionsDialog
          exam={questionsExam}
          open={questionsExam !== null}
          onOpenChange={(v) => !v && setQuestionsExam(null)}
        />
      ) : null}

      {assignExam ? (
        <AssignStudentsDialog
          exam={assignExam}
          open={assignExam !== null}
          onOpenChange={(v) => !v && setAssignExam(null)}
        />
      ) : null}
    </>
  );
}

function ManageQuestionsDialog({
  exam,
  open,
  onOpenChange,
}: {
  exam: OnlineExam;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: linked = [], isLoading } = useOnlineExamQuestions(exam.id, open);
  const { data: bank = [] } = useQuestions();
  const addMutation = useAddOnlineExamQuestions(exam.id);
  const removeMutation = useRemoveOnlineExamQuestion(exam.id);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [removeTarget, setRemoveTarget] = useState<OnlineExamQuestionLink | null>(null);

  const linkedIds = useMemo(() => new Set(linked.map((l) => l.question_id)), [linked]);
  const available = useMemo(() => bank.filter((q) => !linkedIds.has(q.id)), [bank, linkedIds]);

  useEffect(() => {
    if (!open) setSelectedIds([]);
  }, [open]);

  const linkedColumns: DataTableColumn<OnlineExamQuestionLink>[] = [
    {
      id: 'question',
      header: 'Question',
      cellClassName: 'font-medium max-w-sm truncate',
      cell: (r) => r.question || `Question #${r.question_id}`,
    },
    { id: 'type', header: 'Type', cell: (r) => r.question_type || '—' },
    { id: 'marks', header: 'Marks', cell: (r) => r.marks ?? '—' },
  ];

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Manage questions — {exam.exam}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div>
              <h3 className="mb-2 text-sm font-medium">Linked questions ({linked.length})</h3>
              {isLoading ? (
                <p className="text-sm text-muted-foreground">Loading…</p>
              ) : linked.length === 0 ? (
                <p className="text-sm text-muted-foreground">No questions linked yet.</p>
              ) : (
                <DataTable
                  data={linked}
                  columns={linkedColumns}
                  getRowKey={(r) => r.id}
                  actions={(row) => (
                    <PermissionButton
                      permission="onlineexams.exam.questions"
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setRemoveTarget(row)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </PermissionButton>
                  )}
                />
              )}
            </div>

            <div>
              <h3 className="mb-2 text-sm font-medium">Add from question bank</h3>
              {available.length === 0 ? (
                <p className="text-sm text-muted-foreground">No more questions available to add.</p>
              ) : (
                <div className="max-h-56 space-y-2 overflow-y-auto rounded-md border p-3">
                  {available.map((q) => {
                    const checked = selectedIds.includes(q.id);
                    return (
                      <label key={q.id} className="flex cursor-pointer items-start gap-2 text-sm">
                        <Checkbox
                          className="mt-0.5"
                          checked={checked}
                          onChange={(e) =>
                            setSelectedIds((prev) =>
                              e.target.checked ? [...prev, q.id] : prev.filter((id) => id !== q.id),
                            )
                          }
                        />
                        <span className="line-clamp-2">
                          {q.question || `Question #${q.id}`}
                          <span className="ml-2 text-xs text-muted-foreground">
                            ({q.question_type})
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <PermissionButton
              permission="onlineexams.exam.questions"
              disabled={selectedIds.length === 0 || addMutation.isPending}
              onClick={() => {
                addMutation.mutate(
                  {
                    questions: selectedIds.map((question_id) => ({ question_id })),
                  },
                  { onSuccess: () => setSelectedIds([]) },
                );
              }}
            >
              Add selected ({selectedIds.length})
            </PermissionButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={removeTarget !== null}
        onOpenChange={(v) => !v && setRemoveTarget(null)}
        title="Remove question from exam?"
        description="This unlinks the question; it remains in the question bank."
        confirmLabel="Remove"
        destructive
        isLoading={removeMutation.isPending}
        onConfirm={() => {
          if (!removeTarget) return;
          removeMutation.mutate(removeTarget.id, { onSuccess: () => setRemoveTarget(null) });
        }}
      />
    </>
  );
}

function AssignStudentsDialog({
  exam,
  open,
  onOpenChange,
}: {
  exam: OnlineExam;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: classesData } = useClasses();
  const classes = classesData?.results || [];
  const { data: classSectionsData } = useClassSections();
  const classSections = classSectionsData?.results || [];

  const [classId, setClassId] = useState(0);
  const [sectionId, setSectionId] = useState(0);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [unassignTarget, setUnassignTarget] = useState<OnlineExamRosterStudent | null>(null);

  const activeClasses = useMemo(
    () => classes.filter((c) => c.is_active === 'yes').sort((a, b) => a.sort_order - b.sort_order),
    [classes],
  );

  const sectionOptions = useMemo(
    () => sectionOptionsForClass(classSections, classId),
    [classSections, classId],
  );

  const filtersReady = open && classId > 0 && sectionId > 0;
  const {
    data: roster,
    isLoading,
    isError,
    error,
    refetch,
  } = useOnlineExamRoster(exam.id, classId, sectionId, filtersReady);

  const assignMutation = useAssignOnlineExamStudents(exam.id);
  const unassignMutation = useUnassignOnlineExamStudent(exam.id);

  useEffect(() => {
    if (!open) return;
    if (activeClasses.length > 0 && classId === 0) {
      setClassId(activeClasses[0].id);
    }
  }, [open, activeClasses, classId]);

  useEffect(() => {
    if (!open || classId <= 0) return;
    const nextSectionId = firstSectionIdForClass(classSections, classId);
    if (nextSectionId && sectionId !== nextSectionId) {
      setSectionId(nextSectionId);
    }
  }, [open, classId, classSections, sectionId]);

  useEffect(() => {
    setSelectedIds([]);
  }, [classId, sectionId, roster?.students]);

  const students = roster?.students ?? [];
  const selectable = students.filter((row) => !row.is_assigned);
  const allSelectableChecked =
    selectable.length > 0 &&
    selectable.every((row) => selectedIds.includes(row.student_session_id));

  const columns: DataTableColumn<OnlineExamRosterStudent>[] = [
    {
      id: 'select',
      header: (
        <Checkbox
          checked={allSelectableChecked}
          onChange={(e) => {
            if (!e.target.checked) {
              setSelectedIds([]);
              return;
            }
            setSelectedIds(selectable.map((row) => row.student_session_id));
          }}
          aria-label="Select all unassigned students"
          disabled={selectable.length === 0}
        />
      ),
      cell: (row) =>
        row.is_assigned ? (
          <span className="text-xs text-muted-foreground">Assigned</span>
        ) : (
          <Checkbox
            checked={selectedIds.includes(row.student_session_id)}
            onChange={(e) =>
              setSelectedIds((prev) =>
                e.target.checked
                  ? [...prev, row.student_session_id]
                  : prev.filter((id) => id !== row.student_session_id),
              )
            }
            aria-label={`Select ${row.full_name}`}
          />
        ),
    },
    {
      id: 'admission',
      header: 'Admission No',
      cellClassName: 'tabular-nums text-muted-foreground',
      cell: (row) => row.admission_no ?? '—',
    },
    {
      id: 'name',
      header: 'Student',
      cellClassName: 'font-medium',
      cell: (row) => row.full_name,
    },
    {
      id: 'roll',
      header: 'Roll',
      cellClassName: 'tabular-nums text-muted-foreground',
      cell: (row) => row.roll_no ?? '—',
    },
    {
      id: 'actions',
      header: '',
      cellClassName: 'text-right',
      cell: (row) =>
        row.is_assigned && row.assignment_id ? (
          <PermissionButton
            permission="onlineexams.exam.assign"
            variant="ghost"
            size="sm"
            disabled={unassignMutation.isPending || row.is_attempted === 1}
            className="text-destructive hover:text-destructive"
            onClick={() => setUnassignTarget(row)}
          >
            Unassign
          </PermissionButton>
        ) : (
          <Button variant="ghost" size="sm" disabled>
            —
          </Button>
        ),
    },
  ];

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Assign students — {exam.exam}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-3 sm:grid-cols-3">
            <FormField label="Class" htmlFor="online_exam_assign_class">
              <Select
                id="online_exam_assign_class"
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
              />
            </FormField>
            <FormField label="Section" htmlFor="online_exam_assign_section">
              <Select
                id="online_exam_assign_section"
                placeholder="Select section"
                options={sectionOptions}
                value={sectionId ? String(sectionId) : ''}
                onChange={(e) => setSectionId(Number(e.target.value))}
                disabled={sectionOptions.length === 0}
              />
            </FormField>
            <FormField label="Session" htmlFor="online_exam_assign_session">
              <Select
                id="online_exam_assign_session"
                options={
                  roster?.session_name
                    ? [{ value: roster.session_name, label: roster.session_name }]
                    : []
                }
                value={roster?.session_name ?? ''}
                disabled
              />
            </FormField>
          </div>

          {filtersReady && isLoading ? (
            <p className="text-sm text-muted-foreground">Loading students…</p>
          ) : null}
          {filtersReady && isError ? (
            <div className="space-y-2">
              <p className="text-sm text-destructive">
                {(error as Error)?.message || 'Failed to load roster'}
              </p>
              <Button type="button" variant="outline" size="sm" onClick={() => void refetch()}>
                Retry
              </Button>
            </div>
          ) : null}
          {filtersReady && !isLoading && !isError && students.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No students in this class section for the exam session.
            </p>
          ) : null}
          {filtersReady && !isLoading && !isError && students.length > 0 ? (
            <DataTable data={students} columns={columns} getRowKey={(r) => r.student_session_id} />
          ) : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <PermissionButton
              permission="onlineexams.exam.assign"
              disabled={selectedIds.length === 0 || assignMutation.isPending}
              onClick={() => {
                assignMutation.mutate(selectedIds, { onSuccess: () => setSelectedIds([]) });
              }}
            >
              Assign selected ({selectedIds.length})
            </PermissionButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={unassignTarget !== null}
        onOpenChange={(v) => !v && setUnassignTarget(null)}
        title="Unassign student?"
        description={
          unassignTarget ? `Remove ${unassignTarget.full_name} from this online exam?` : ''
        }
        confirmLabel="Unassign"
        destructive
        isLoading={unassignMutation.isPending}
        onConfirm={() => {
          if (!unassignTarget?.assignment_id) return;
          unassignMutation.mutate(unassignTarget.assignment_id, {
            onSuccess: () => setUnassignTarget(null),
          });
        }}
      />
    </>
  );
}
