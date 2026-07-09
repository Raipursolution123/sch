import { useState } from 'react';
import { Plus } from 'lucide-react';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { SubjectFormDialog } from '@features/academics/subjects/components/SubjectFormDialog';
import { SubjectsTable } from '@features/academics/subjects/components/SubjectsTable';
import type { SubjectFormValues } from '@features/academics/subjects/schemas/subject.schema';
import {
  useCreateSubject,
  useDeleteSubject,
  useSubjects,
  useUpdateSubject,
} from '@hooks/useSubjects';
import { useClasses } from '@hooks/useClasses';
import type { Subject } from '@app-types/academics/subject';
import type { ActiveFlag } from '@app-types/settings/session';
import { ModuleListPack } from '@workflow-packs';

type DialogMode = 'create' | 'edit' | null;

function toPayload(values: SubjectFormValues) {
  return {
    name: values.name,
    code: values.code,
    type: values.type,
    linked_class_ids: values.linked_class_ids,
    is_active: (values.is_active ? 'yes' : 'no') as ActiveFlag,
  };
}

export function SubjectsPage() {
  const [page, setPage] = useState(1);
  const { data: subjectsData, isLoading, isError, error, refetch } = useSubjects(page);
  const subjects = subjectsData?.results;
  const count = subjectsData?.count || 0;

  const { data: classesData } = useClasses();
  const classes = classesData?.results || [];
  const createMutation = useCreateSubject();
  const updateMutation = useUpdateSubject();
  const deleteMutation = useDeleteSubject();

  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Subject | null>(null);

  const closeFormDialog = () => {
    setDialogMode(null);
    setSelectedSubject(null);
  };

  const handleFormSubmit = (values: SubjectFormValues) => {
    const payload = toPayload(values);
    if (dialogMode === 'edit' && selectedSubject) {
      updateMutation.mutate({ id: selectedSubject.id, payload }, { onSuccess: closeFormDialog });
      return;
    }
    createMutation.mutate(payload, { onSuccess: closeFormDialog });
  };

  const isFormLoading = createMutation.isPending || updateMutation.isPending;

  const addSubjectAction = (
    <PermissionButton permission="academics.manage" onClick={() => setDialogMode('create')} className="gap-1">
      <Plus className="h-4 w-4" aria-hidden="true" />
      Add Subject
    </PermissionButton>
  );

  return (
    <ModuleListPack
      title="Subjects"
      description="Manage subjects for timetables, exams, and attendance tracking."
      actions={addSubjectAction}
      isLoading={isLoading}
      loadingMessage="Loading subjects..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && subjects?.length === 0}
      emptyTitle="No subjects configured"
      emptyDescription="Add your first subject to build the academic curriculum."
      emptyAction={addSubjectAction}
      footer={
        <>
          <SubjectFormDialog
            open={dialogMode !== null}
            onOpenChange={(open) => {
              if (!open) closeFormDialog();
            }}
            subject={dialogMode === 'edit' ? selectedSubject : null}
            classes={classes}
            onSubmit={handleFormSubmit}
            isLoading={isFormLoading}
          />

          <ConfirmDialog
            open={Boolean(deleteTarget)}
            onOpenChange={(open) => {
              if (!open) setDeleteTarget(null);
            }}
            title="Delete subject?"
            description={
              deleteTarget
                ? `Permanently delete "${deleteTarget.name}" (${deleteTarget.code})? This cannot be undone.`
                : ''
            }
            confirmLabel="Delete"
            destructive
            onConfirm={() => {
              if (!deleteTarget) return;
              deleteMutation.mutate(deleteTarget.id, {
                onSuccess: () => setDeleteTarget(null),
              });
            }}
            isLoading={deleteMutation.isPending}
          />
        </>
      }
    >
      <SubjectsTable
        subjects={subjects ?? []}
        pagination={{
          page,
          pageSize: 10,
          totalCount: count,
          onPageChange: setPage,
        }}
        onEdit={(subject) => {
          setSelectedSubject(subject);
          setDialogMode('edit');
        }}
        onDelete={setDeleteTarget}
      />
    </ModuleListPack>
  );
}
