import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@components/ui/button';
import { PageHeader } from '@components/layout/PageHeader';
import { EmptyState } from '@components/feedback/EmptyState';
import { LoadingState } from '@components/feedback/LoadingState';
import { ErrorState } from '@components/feedback/ErrorState';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { SubjectFormDialog } from '@features/academics/subjects/components/SubjectFormDialog';
import { SubjectsTable } from '@features/academics/subjects/components/SubjectsTable';
import { Pagination } from '@components/ui/Pagination';
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
  const totalPages = Math.ceil(count / 10); // StandardResultsSetPagination PAGE_SIZE is 10

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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subjects"
        description="Manage subjects for timetables, exams, and attendance tracking."
        actions={
          <Button onClick={() => setDialogMode('create')} className="gap-1">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Subject
          </Button>
        }
      />

      {isLoading && <LoadingState message="Loading subjects..." />}

      {isError && (
        <ErrorState
          message={error instanceof Error ? error.message : 'Could not load subjects'}
          onRetry={() => void refetch()}
        />
      )}

      {!isLoading && !isError && subjects?.length === 0 && (
        <EmptyState
          title="No subjects configured"
          description="Add your first subject to build the academic curriculum."
          action={
            <Button onClick={() => setDialogMode('create')} className="gap-1">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add Subject
            </Button>
          }
        />
      )}

      {!isLoading && !isError && subjects && subjects.length > 0 && (
        <div className="space-y-4">
          <SubjectsTable
            subjects={subjects}
            onEdit={(subject) => {
              setSelectedSubject(subject);
              setDialogMode('edit');
            }}
            onDelete={setDeleteTarget}
          />
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

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
    </div>
  );
}
