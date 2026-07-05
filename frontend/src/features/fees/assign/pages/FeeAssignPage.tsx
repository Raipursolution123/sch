import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@components/ui/button';
import { PageHeader } from '@components/layout/PageHeader';
import { EmptyState } from '@components/feedback/EmptyState';
import { LoadingState } from '@components/feedback/LoadingState';
import { ErrorState } from '@components/feedback/ErrorState';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { FeeAssignmentFormDialog } from '@features/fees/assign/components/FeeAssignmentFormDialog';
import { FeeAssignmentsTable } from '@features/fees/assign/components/FeeAssignmentsTable';
import type { FeeAssignmentFormValues } from '@features/fees/assign/schemas/fee-assignment.schema';
import {
  useCreateFeeAssignment,
  useDeleteFeeAssignment,
  useFeeAssignments,
  useUpdateFeeAssignment,
} from '@hooks/useFeeAssignments';
import { useClasses } from '@hooks/useClasses';
import { useFeeGroups } from '@hooks/useFeeGroups';
import { useFeeTypes } from '@hooks/useFeeTypes';
import { useSessions } from '@hooks/useSessions';
import type { FeeAssignment } from '@app-types/fees/fee-assignment';
import type { ActiveFlag } from '@app-types/settings/session';

type DialogMode = 'create' | 'edit' | null;

function toPayload(values: FeeAssignmentFormValues) {
  return {
    class_id: values.class_id,
    fee_group_id: values.fee_group_id,
    session_id: values.session_id,
    lines: values.lines.map((line) => ({
      feetype_id: line.feetype_id,
      amount: line.amount,
      due_date: line.due_date?.trim() ? line.due_date : null,
    })),
    is_active: (values.is_active ? 'yes' : 'no') as ActiveFlag,
  };
}

export function FeeAssignPage() {
  const { data: assignments, isLoading, isError, error, refetch } = useFeeAssignments();
  const { data: classesData } = useClasses();
  const classes = classesData?.results || [];
  
  const { data: sectionsData } = useSections();
  const sections = sectionsData?.results || [];
  const { data: feeGroups = [] } = useFeeGroups();
  const { data: feeTypes = [] } = useFeeTypes();
  const { data: sessions = [] } = useSessions();
  const createMutation = useCreateFeeAssignment();
  const updateMutation = useUpdateFeeAssignment();
  const deleteMutation = useDeleteFeeAssignment();

  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<FeeAssignment | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FeeAssignment | null>(null);

  const canAssign = useMemo(
    () =>
      classes.some((c) => c.is_active === 'yes') &&
      feeGroups.some((g) => g.is_active === 'yes') &&
      feeTypes.some((f) => f.is_active === 'yes') &&
      sessions.length > 0,
    [classes, feeGroups, feeTypes, sessions],
  );

  const closeFormDialog = () => {
    setDialogMode(null);
    setSelectedAssignment(null);
  };

  const handleFormSubmit = (values: FeeAssignmentFormValues) => {
    const payload = toPayload(values);
    if (dialogMode === 'edit' && selectedAssignment) {
      updateMutation.mutate({ id: selectedAssignment.id, payload }, { onSuccess: closeFormDialog });
      return;
    }
    createMutation.mutate(payload, { onSuccess: closeFormDialog });
  };

  const isFormLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assign Fees"
        description="Assign fee groups to classes for the active session with per-line amounts."
        actions={
          <Button
            onClick={() => setDialogMode('create')}
            className="gap-1"
            disabled={!canAssign}
            title={
              canAssign ? undefined : 'Configure classes, fee types, groups, and sessions first'
            }
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Assign Fees
          </Button>
        }
      />

      {!canAssign && !isLoading && (
        <p className="text-sm text-muted-foreground">
          Set up fee types, fee groups, classes, and academic sessions before assigning fees.
        </p>
      )}

      {isLoading && <LoadingState message="Loading fee assignments..." />}

      {isError && (
        <ErrorState
          message={error instanceof Error ? error.message : 'Could not load fee assignments'}
          onRetry={() => void refetch()}
        />
      )}

      {!isLoading && !isError && assignments?.length === 0 && (
        <EmptyState
          title="No fee assignments"
          description="Assign a fee group to a class to define what students owe."
          action={
            canAssign ? (
              <Button onClick={() => setDialogMode('create')} className="gap-1">
                <Plus className="h-4 w-4" aria-hidden="true" />
                Assign Fees
              </Button>
            ) : undefined
          }
        />
      )}

      {!isLoading && !isError && assignments && assignments.length > 0 && (
        <FeeAssignmentsTable
          assignments={assignments}
          onEdit={(assignment) => {
            setSelectedAssignment(assignment);
            setDialogMode('edit');
          }}
          onDelete={setDeleteTarget}
        />
      )}

      <FeeAssignmentFormDialog
        open={dialogMode !== null}
        onOpenChange={(open) => {
          if (!open) closeFormDialog();
        }}
        classes={classes}
        feeGroups={feeGroups}
        feeTypes={feeTypes}
        sessions={sessions}
        assignment={dialogMode === 'edit' ? selectedAssignment : null}
        onSubmit={handleFormSubmit}
        isLoading={isFormLoading}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete fee assignment"
        description={
          deleteTarget
            ? `Delete the "${deleteTarget.fee_group_name}" assignment for ${deleteTarget.class_name}?`
            : ''
        }
        confirmLabel="Delete"
        destructive
        isLoading={deleteMutation.isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteMutation.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
        }}
      />
    </div>
  );
}
