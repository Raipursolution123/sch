import { useState } from 'react';
import { Plus } from 'lucide-react';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { ClassFormDialog } from '@features/academics/classes/components/ClassFormDialog';
import { ClassesTable } from '@features/academics/classes/components/ClassesTable';
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
import { ModuleListPack } from '@workflow-packs';

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

  const addClassAction = (
    <PermissionButton permission="academics.manage" onClick={() => setDialogMode('create')} className="gap-1">
      <Plus className="h-4 w-4" aria-hidden="true" />
      Add Class
    </PermissionButton>
  );

  return (
    <ModuleListPack
      title="Classes"
      description="Manage school classes and their display order for enrollment and academics."
      actions={addClassAction}
      isLoading={isLoading}
      loadingMessage="Loading classes..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && classes?.length === 0}
      emptyTitle="No classes configured"
      emptyDescription="Add your first class to build the academic structure."
      emptyAction={addClassAction}
      footer={
        <>
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
        </>
      }
    >
      <ClassesTable
        classes={classes ?? []}
        pagination={{
          page,
          pageSize: 10,
          totalCount: count,
          onPageChange: setPage,
        }}
        onEdit={(schoolClass) => {
          setSelectedClass(schoolClass);
          setDialogMode('edit');
        }}
        onDelete={setDeleteTarget}
      />
    </ModuleListPack>
  );
}
