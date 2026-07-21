import { useState } from 'react';
import { Plus } from 'lucide-react';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { DailyAssignmentFormDialog } from '@features/homework/daily/components/DailyAssignmentFormDialog';
import { DailyAssignmentsTable } from '@features/homework/daily/components/DailyAssignmentsTable';
import type { DailyAssignmentFormValues } from '@features/homework/schemas/homework.schema';
import { useAuth } from '@hooks/useAuth';
import {
  useCreateDailyAssignment,
  useDailyAssignments,
  useDeleteDailyAssignment,
  useUpdateDailyAssignment,
} from '@hooks/useHomework';
import type { CreateDailyAssignmentPayload, DailyAssignment } from '@app-types/academics/homework';
import { ModuleListPack } from '@workflow-packs';

type DialogMode = 'create' | 'edit' | null;

export function DailyAssignmentsPage() {
  const { user } = useAuth();
  const defaultEvaluatorId = user?.user_id ?? 0;

  const { data, isLoading, isError, error, refetch } = useDailyAssignments();
  const rows = data?.results ?? [];

  const createMutation = useCreateDailyAssignment();
  const updateMutation = useUpdateDailyAssignment();
  const deleteMutation = useDeleteDailyAssignment();

  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [selected, setSelected] = useState<DailyAssignment | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DailyAssignment | null>(null);

  const toPayload = (values: DailyAssignmentFormValues): CreateDailyAssignmentPayload => ({
    student_session_id: values.student_session_id,
    subject_group_subject_id: values.subject_group_subject_id,
    title: values.title?.trim() ? values.title.trim() : null,
    description: values.description?.trim() ? values.description.trim() : null,
    date: values.date?.trim() ? values.date : null,
    remark: values.remark.trim(),
    evaluated_by:
      values.evaluated_by && values.evaluated_by > 0
        ? values.evaluated_by
        : defaultEvaluatorId || null,
  });

  const handleSubmit = (values: DailyAssignmentFormValues) => {
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
        title="Daily Assignment"
        description="Track per-student daily assignments linked to subject-group subjects."
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={() => void refetch()}
        isEmpty={!isLoading && !isError && rows.length === 0}
        emptyTitle="No daily assignments"
        emptyDescription="Create a daily assignment using a student session ID."
        actions={
          <PermissionButton
            permission="daily_assignment.create"
            className="gap-1"
            onClick={() => {
              setSelected(null);
              setDialogMode('create');
            }}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add assignment
          </PermissionButton>
        }
      >
        <DailyAssignmentsTable
          rows={rows}
          onEdit={(row) => {
            setSelected(row);
            setDialogMode('edit');
          }}
          onDelete={setDeleteTarget}
        />
      </ModuleListPack>

      <DailyAssignmentFormDialog
        open={dialogMode !== null}
        mode={dialogMode === 'edit' ? 'edit' : 'create'}
        initial={selected}
        defaultEvaluatorId={defaultEvaluatorId}
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
        title="Delete daily assignment?"
        description="This permanently removes the daily assignment record."
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
