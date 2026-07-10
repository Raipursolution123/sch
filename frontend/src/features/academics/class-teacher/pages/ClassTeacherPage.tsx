import { useEffect, useMemo, useState } from 'react';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { Select } from '@components/ui/select';
import { ClassTeacherFormDialog } from '@features/academics/class-teacher/components/ClassTeacherFormDialog';
import { ClassTeachersTable } from '@features/academics/class-teacher/components/ClassTeachersTable';
import type { ClassTeacherFormValues } from '@features/academics/class-teacher/schemas/class-teacher.schema';
import { useActiveSession, useSessions } from '@features/academics/sessions/hooks/useSessions';
import {
  useAssignClassTeacher,
  useClassTeachers,
  useRemoveClassTeacher,
  useUpdateClassTeacher,
} from '@hooks/useClassTeachers';
import { useGeneralSettings } from '@hooks/useGeneralSettings';
import { useStaff } from '@hooks/useStaff';
import type { ClassTeacherAssignment } from '@app-types/academics/class-teacher';
import { ModuleListPack } from '@workflow-packs';

type DialogMode = 'assign' | 'edit' | null;

export function ClassTeacherPage() {
  const { data: activeSessionData } = useActiveSession();
  const activeSessionId = activeSessionData?.id;

  const { data: sessionsData } = useSessions();
  const sessions = sessionsData?.results ?? [];

  const [sessionFilter, setSessionFilter] = useState<number | undefined>(undefined);
  const [classFilter, setClassFilter] = useState<number | undefined>(undefined);
  const [sectionFilter, setSectionFilter] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (sessionFilter === undefined && activeSessionId) {
      setSessionFilter(activeSessionId);
    }
  }, [activeSessionId, sessionFilter]);

  const sessionId = sessionFilter ?? activeSessionId;

  const { data: rows, isLoading, isError, error, refetch } = useClassTeachers(
    sessionId,
    classFilter,
    sectionFilter,
  );

  const { data: staffData } = useStaff(1);
  const staff = staffData?.results ?? [];

  const { data: generalSettings } = useGeneralSettings();
  const featureDisabled = generalSettings?.class_teacher === 'disabled';

  const assignMutation = useAssignClassTeacher();
  const updateMutation = useUpdateClassTeacher();
  const removeMutation = useRemoveClassTeacher();

  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [selectedRow, setSelectedRow] = useState<ClassTeacherAssignment | null>(null);
  const [removeTarget, setRemoveTarget] = useState<ClassTeacherAssignment | null>(null);

  const classOptions = useMemo(() => {
    const seen = new Map<number, string>();
    for (const row of rows ?? []) {
      if (row.class_id && row.class_name) seen.set(row.class_id, row.class_name);
    }
    return Array.from(seen.entries())
      .map(([value, label]) => ({ value: String(value), label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [rows]);

  const sectionOptions = useMemo(() => {
    const seen = new Map<number, string>();
    for (const row of rows ?? []) {
      if (classFilter !== undefined && row.class_id !== classFilter) continue;
      if (row.section_id && row.section_name) seen.set(row.section_id, row.section_name);
    }
    return Array.from(seen.entries())
      .map(([value, label]) => ({ value: String(value), label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [rows, classFilter]);

  const closeDialog = () => {
    setDialogMode(null);
    setSelectedRow(null);
  };

  const openAssign = (row: ClassTeacherAssignment) => {
    setSelectedRow(row);
    setDialogMode('assign');
  };

  const openEdit = (row: ClassTeacherAssignment) => {
    setSelectedRow(row);
    setDialogMode('edit');
  };

  const handleSubmit = (values: ClassTeacherFormValues) => {
    if (!selectedRow || sessionId === undefined) return;

    if (dialogMode === 'edit' && selectedRow.id) {
      updateMutation.mutate(
        { id: selectedRow.id, payload: { staff_id: values.staff_id } },
        { onSuccess: closeDialog },
      );
      return;
    }

    assignMutation.mutate(
      {
        session_id: sessionId,
        class_id: selectedRow.class_id,
        section_id: selectedRow.section_id,
        staff_id: values.staff_id,
      },
      { onSuccess: closeDialog },
    );
  };

  const sessionOptions = sessions.map((s) => ({
    value: String(s.id),
    label: s.session,
  }));

  const filters = (
    <div className="flex flex-wrap items-end gap-3">
      <div>
        <label htmlFor="ct-session" className="mb-1 block text-xs text-muted-foreground">
          Session
        </label>
        <Select
          id="ct-session"
          className="w-40"
          options={sessionOptions}
          value={sessionId ? String(sessionId) : ''}
          onChange={(e) => {
            setSessionFilter(Number(e.target.value));
            setClassFilter(undefined);
            setSectionFilter(undefined);
          }}
        />
      </div>
      <div>
        <label htmlFor="ct-class" className="mb-1 block text-xs text-muted-foreground">
          Class
        </label>
        <Select
          id="ct-class"
          className="w-36"
          options={[{ value: '', label: 'All classes' }, ...classOptions]}
          value={classFilter ? String(classFilter) : ''}
          onChange={(e) => {
            const value = e.target.value;
            setClassFilter(value ? Number(value) : undefined);
            setSectionFilter(undefined);
          }}
        />
      </div>
      <div>
        <label htmlFor="ct-section" className="mb-1 block text-xs text-muted-foreground">
          Section
        </label>
        <Select
          id="ct-section"
          className="w-28"
          options={[{ value: '', label: 'All sections' }, ...sectionOptions]}
          value={sectionFilter ? String(sectionFilter) : ''}
          onChange={(e) => {
            const value = e.target.value;
            setSectionFilter(value ? Number(value) : undefined);
          }}
          disabled={classOptions.length === 0}
        />
      </div>
    </div>
  );

  return (
    <ModuleListPack
      title="Class Teacher"
      description="Assign a class in-charge for each class section in the selected session."
      actions={filters}
      isLoading={isLoading}
      loadingMessage="Loading class teacher assignments..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && sessionId !== undefined && (rows?.length ?? 0) === 0}
      emptyTitle="No class sections"
      emptyDescription="Create active class-section mappings before assigning class teachers."
      prerequisiteHint={
        sessionId === undefined ? (
          <p className="text-sm text-muted-foreground">Select a session to view assignments.</p>
        ) : featureDisabled ? (
          <p className="text-sm text-amber-700 dark:text-amber-400">
            Class teacher assignment is disabled in General Settings. You can still manage
            assignments here if you have permission.
          </p>
        ) : undefined
      }
      footer={
        <>
          <ClassTeacherFormDialog
            open={dialogMode !== null}
            onOpenChange={(open) => {
              if (!open) closeDialog();
            }}
            row={selectedRow}
            staff={staff}
            onSubmit={handleSubmit}
            isLoading={assignMutation.isPending || updateMutation.isPending}
          />

          <ConfirmDialog
            open={Boolean(removeTarget)}
            onOpenChange={(open) => {
              if (!open) setRemoveTarget(null);
            }}
            title="Remove class teacher?"
            description={
              removeTarget
                ? `Remove ${removeTarget.staff_name ?? 'this teacher'} from ${removeTarget.class_name} ${removeTarget.section_name}?`
                : ''
            }
            confirmLabel="Remove"
            destructive
            onConfirm={() => {
              if (!removeTarget?.id) return;
              removeMutation.mutate(removeTarget.id, {
                onSuccess: () => setRemoveTarget(null),
              });
            }}
            isLoading={removeMutation.isPending}
          />
        </>
      }
    >
      {rows && rows.length > 0 ? (
        <ClassTeachersTable
          rows={rows}
          onAssign={openAssign}
          onEdit={openEdit}
          onRemove={setRemoveTarget}
        />
      ) : null}
    </ModuleListPack>
  );
}
