import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@components/ui/button';
import { PageHeader } from '@components/layout/PageHeader';
import { EmptyState } from '@components/feedback/EmptyState';
import { LoadingState } from '@components/feedback/LoadingState';
import { ErrorState } from '@components/feedback/ErrorState';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { ClassFormDialog } from '@features/academics/classes/components/ClassFormDialog';
import { ClassesTable } from '@features/academics/classes/components/ClassesTable';
import { Pagination } from '@components/ui/Pagination';
import type { ClassFormValues } from '@features/academics/classes/schemas/class.schema';
import {
  useClasses,
  useCreateClass,
  useDeleteClass,
  useSuggestedClassSortOrder,
  useUpdateClass,
} from '@hooks/useClasses';
import type { SchoolClass } from '@app-types/academics/class';
import type { ActiveFlag } from '@app-types/settings/session';

type DialogMode = 'create' | 'edit' | null;

function toPayload(values: ClassFormValues) {
  return {
    class_name: values.class_name,
    sort_order: values.sort_order,
    is_hedu_program: values.is_hedu_program,
    is_active: (values.is_active ? 'yes' : 'no') as ActiveFlag,
  };
}

export function ClassesPage() {
  const [page, setPage] = useState(1);
  const { data: classesData, isLoading, isError, error, refetch } = useClasses(page);
  const classes = classesData?.results;
  const count = classesData?.count || 0;
  const totalPages = Math.ceil(count / 10); // StandardResultsSetPagination PAGE_SIZE is 10

  const createMutation = useCreateClass();
  const updateMutation = useUpdateClass();
  const deleteMutation = useDeleteClass();

  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [selectedClass, setSelectedClass] = useState<SchoolClass | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SchoolClass | null>(null);

  const { data: suggestedSortOrder } = useSuggestedClassSortOrder(dialogMode === 'create');

  const closeFormDialog = () => {
    setDialogMode(null);
    setSelectedClass(null);
  };

  const handleFormSubmit = (values: ClassFormValues) => {
    const payload = toPayload(values);
    if (dialogMode === 'edit' && selectedClass) {
      updateMutation.mutate({ id: selectedClass.id, payload }, { onSuccess: closeFormDialog });
      return;
    }
    createMutation.mutate(payload, { onSuccess: closeFormDialog });
  };

  const isFormLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Classes"
        description="Manage school classes and their display order for enrollment and academics."
        actions={
          <Button onClick={() => setDialogMode('create')} className="gap-1">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Class
          </Button>
        }
      />

      {isLoading && <LoadingState message="Loading classes..." />}

      {isError && (
        <ErrorState
          message={error instanceof Error ? error.message : 'Could not load classes'}
          onRetry={() => void refetch()}
        />
      )}

      {!isLoading && !isError && classes?.length === 0 && (
        <EmptyState
          title="No classes configured"
          description="Add your first class to build the academic structure."
          action={
            <Button onClick={() => setDialogMode('create')} className="gap-1">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add Class
            </Button>
          }
        />
      )}

      {!isLoading && !isError && classes && classes.length > 0 && (
        <div className="space-y-4">
          <ClassesTable
            classes={classes}
            onEdit={(schoolClass) => {
              setSelectedClass(schoolClass);
              setDialogMode('edit');
            }}
            onDelete={setDeleteTarget}
          />
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      <ClassFormDialog
        open={dialogMode !== null}
        onOpenChange={(open) => {
          if (!open) closeFormDialog();
        }}
        schoolClass={dialogMode === 'edit' ? selectedClass : null}
        suggestedSortOrder={suggestedSortOrder ?? 1}
        onSubmit={handleFormSubmit}
        isLoading={isFormLoading}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete class?"
        description={
          deleteTarget
            ? `Permanently delete "${deleteTarget.class_name}"? This cannot be undone.`
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
