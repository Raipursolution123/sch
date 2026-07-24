import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { Select } from '@components/ui/select';
import { FormField } from '@components/forms/FormField';
import { HomeworkFormDialog } from '@features/homework/assignments/components/HomeworkFormDialog';
import { HomeworkTable } from '@features/homework/assignments/components/HomeworkTable';
import type { HomeworkFormValues } from '@features/homework/schemas/homework.schema';
import {
  firstSectionIdForClass,
  sectionOptionsForClass,
} from '@features/students/utils/class-section-options';
import { useAuth } from '@hooks/useAuth';
import { useClasses } from '@hooks/useClasses';
import { useClassSections } from '@hooks/useClassSections';
import {
  useCreateHomework,
  useDeleteHomework,
  useHomeworkList,
  useUpdateHomework,
} from '@hooks/useHomework';
import { useActiveSession } from '@hooks/useSessions';
import { useStaff } from '@hooks/useStaff';
import { useSubjects } from '@hooks/useSubjects';
import type { CreateHomeworkPayload, Homework } from '@app-types/academics/homework';
import { todayIsoDate } from '@utils/student';
import { ModuleListPack } from '@workflow-packs';

type DialogMode = 'create' | 'edit' | null;

export function HomeworkPage() {
  const { user } = useAuth();
  const { data: activeSession } = useActiveSession();
  const sessionId = activeSession?.id ?? 0;
  const defaultStaffId = user?.user_id ?? 0;

  const { data: classesData } = useClasses();
  const classes = classesData?.results ?? [];
  const { data: classSectionsData } = useClassSections();
  const classSections = classSectionsData?.results ?? [];
  const { data: subjectsData } = useSubjects();
  const subjects = subjectsData?.results ?? [];
  const { data: staffData } = useStaff(1);
  const staff = staffData?.results ?? [];

  const [classId, setClassId] = useState(0);
  const [sectionId, setSectionId] = useState(0);
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [selected, setSelected] = useState<Homework | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Homework | null>(null);

  const filters = useMemo(
    () => ({
      ...(sessionId > 0 ? { session_id: sessionId } : {}),
      ...(classId > 0 ? { class_id: classId } : {}),
      ...(sectionId > 0 ? { section_id: sectionId } : {}),
    }),
    [sessionId, classId, sectionId],
  );

  const { data, isLoading, isError, error, refetch } = useHomeworkList(filters);
  const rows = data?.results ?? [];

  const createMutation = useCreateHomework();
  const updateMutation = useUpdateHomework();
  const deleteMutation = useDeleteHomework();

  const classOptions = classes
    .filter((c) => c.is_active === 'yes')
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((c) => ({ value: String(c.id), label: c.class_name }));

  const sectionFilterOptions = useMemo(() => {
    if (classId <= 0) return [{ value: '', label: 'All sections' }];
    return [
      { value: '', label: 'All sections' },
      ...sectionOptionsForClass(classSections, classId),
    ];
  }, [classId, classSections]);

  const subjectOptions = subjects
    .filter((s) => s.is_active === 'yes')
    .map((s) => ({ value: String(s.id), label: s.name }));

  const staffOptions = staff.map((s) => ({
    value: String(s.id),
    label: s.full_name || `${s.name} ${s.surname}`.trim(),
  }));

  const classNameById = useMemo(() => new Map(classes.map((c) => [c.id, c.class_name])), [classes]);
  const sectionNameById = useMemo(() => {
    const map = new Map<number, string>();
    for (const row of classSections) {
      map.set(row.section_id, row.section_name);
    }
    return map;
  }, [classSections]);
  const subjectNameById = useMemo(() => new Map(subjects.map((s) => [s.id, s.name])), [subjects]);
  const staffNameById = useMemo(() => new Map(staff.map((s) => [s.id, s.full_name])), [staff]);

  const toPayload = (values: HomeworkFormValues): CreateHomeworkPayload => ({
    class_id: values.class_id,
    section_id: values.section_id,
    session_id: values.session_id || sessionId,
    staff_id: values.staff_id,
    subject_id: values.subject_id && values.subject_id > 0 ? values.subject_id : null,
    homework_date: values.homework_date,
    submit_date: values.submit_date,
    marks: values.marks ?? null,
    description: values.description?.trim() ? values.description.trim() : null,
    create_date: todayIsoDate(),
    created_by: defaultStaffId || values.staff_id,
  });

  const handleSubmit = (values: HomeworkFormValues) => {
    const payload = toPayload(values);
    if (dialogMode === 'edit' && selected) {
      updateMutation.mutate(
        { id: selected.id, payload },
        {
          onSuccess: () => {
            setDialogMode(null);
            setSelected(null);
          },
        },
      );
      return;
    }
    createMutation.mutate(payload, {
      onSuccess: () => {
        setDialogMode(null);
        setSelected(null);
      },
    });
  };

  return (
    <>
      <ModuleListPack
        title="Homework"
        description={
          activeSession
            ? `Assign and manage class homework for session ${activeSession.session}.`
            : 'Assign and manage class homework for the active session.'
        }
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={() => void refetch()}
        isEmpty={!isLoading && !isError && rows.length === 0}
        emptyTitle="No homework yet"
        emptyDescription="Assign homework to a class section to get started."
        actions={
          <PermissionButton
            permission="homework.create"
            className="gap-1"
            disabled={sessionId <= 0}
            onClick={() => {
              setSelected(null);
              setDialogMode('create');
            }}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Assign homework
          </PermissionButton>
        }
        prerequisiteHint={
          <div className="grid gap-4 rounded-lg border bg-card p-4 sm:grid-cols-2 lg:grid-cols-3">
            <FormField label="Class" htmlFor="homework_filter_class">
              <Select
                id="homework_filter_class"
                options={[{ value: '', label: 'All classes' }, ...classOptions]}
                value={classId ? String(classId) : ''}
                onChange={(e) => {
                  const next = Number(e.target.value) || 0;
                  setClassId(next);
                  setSectionId(next > 0 ? (firstSectionIdForClass(classSections, next) ?? 0) : 0);
                }}
              />
            </FormField>
            <FormField label="Section" htmlFor="homework_filter_section">
              <Select
                id="homework_filter_section"
                options={sectionFilterOptions}
                value={sectionId ? String(sectionId) : ''}
                onChange={(e) => setSectionId(Number(e.target.value) || 0)}
                disabled={classId <= 0}
              />
            </FormField>
          </div>
        }
      >
        <HomeworkTable
          rows={rows}
          classNameById={classNameById}
          sectionNameById={sectionNameById}
          subjectNameById={subjectNameById}
          staffNameById={staffNameById}
          onEdit={(row) => {
            setSelected(row);
            setDialogMode('edit');
          }}
          onDelete={setDeleteTarget}
        />
      </ModuleListPack>

      <HomeworkFormDialog
        open={dialogMode !== null}
        mode={dialogMode === 'edit' ? 'edit' : 'create'}
        initial={selected}
        classOptions={classOptions}
        classSections={classSections}
        subjectOptions={subjectOptions}
        staffOptions={staffOptions}
        sessionId={sessionId}
        defaultStaffId={defaultStaffId}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        onClose={() => {
          setDialogMode(null);
          setSelected(null);
        }}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete homework?"
        description="This removes the homework assignment. Student submissions linked to it may remain in the database."
        confirmLabel="Delete"
        destructive
        isLoading={deleteMutation.isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteMutation.mutate(deleteTarget.id, {
            onSuccess: () => setDeleteTarget(null),
          });
        }}
      />
    </>
  );
}
