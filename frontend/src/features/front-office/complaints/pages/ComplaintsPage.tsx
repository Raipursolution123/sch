import { useState } from 'react';
import { Plus } from 'lucide-react';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { ModuleListPack } from '@workflow-packs';
import { ComplaintsTable } from '@features/front-office/complaints/components/ComplaintsTable';
import { ComplaintFormDialog } from '@features/front-office/complaints/components/ComplaintFormDialog';
import type { ComplaintFormValues } from '@features/front-office/complaints/schemas/complaint.schema';
import {
  useComplaints,
  useCreateComplaint,
  useDeleteComplaint,
  useUpdateComplaint,
} from '@hooks/useComplaints';
import type { Complaint } from '@app-types/front-office/complaint';

type DialogMode = 'create' | 'edit' | null;

function toPayload(values: ComplaintFormValues) {
  return {
    name: values.name,
    complaint_type: values.complaint_type?.trim() ?? '',
    source: values.source?.trim() ?? '',
    contact: values.contact?.trim() ?? '',
    email: values.email?.trim() ?? '',
    date: values.date,
    description: values.description?.trim() ?? '',
    action_taken: values.action_taken?.trim() ?? '',
    assigned: values.assigned?.trim() ?? '',
    note: values.note?.trim() ?? '',
  };
}

export function ComplaintsPage() {
  const { data: complaints, isLoading, isError, error, refetch } = useComplaints();
  const createMutation = useCreateComplaint();
  const updateMutation = useUpdateComplaint();
  const deleteMutation = useDeleteComplaint();

  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Complaint | null>(null);

  const closeFormDialog = () => {
    setDialogMode(null);
    setSelectedComplaint(null);
  };

  const handleFormSubmit = (values: ComplaintFormValues) => {
    const payload = toPayload(values);
    if (dialogMode === 'edit' && selectedComplaint) {
      updateMutation.mutate({ id: selectedComplaint.id, payload }, { onSuccess: closeFormDialog });
      return;
    }
    createMutation.mutate(payload, { onSuccess: closeFormDialog });
  };

  const addAction = (
    <PermissionButton
      permission="staff.create"
      onClick={() => setDialogMode('create')}
      className="gap-1"
    >
      <Plus className="h-4 w-4" aria-hidden="true" />
      Add Complaint
    </PermissionButton>
  );

  return (
    <ModuleListPack
      title="Complaints"
      description="Manage complaints received at the front office."
      actions={addAction}
      isLoading={isLoading}
      loadingMessage="Loading complaints..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && (complaints?.length ?? 0) === 0}
      emptyTitle="No complaints yet"
      emptyDescription="Create the first complaint record to start tracking issues."
      emptyAction={addAction}
      footer={
        <>
          <ComplaintFormDialog
            open={dialogMode !== null}
            onOpenChange={(open) => {
              if (!open) closeFormDialog();
            }}
            complaint={dialogMode === 'edit' ? selectedComplaint : null}
            onSubmit={handleFormSubmit}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
          <ConfirmDialog
            open={deleteTarget !== null}
            onOpenChange={(open) => {
              if (!open) setDeleteTarget(null);
            }}
            title="Delete complaint"
            description={
              deleteTarget
                ? `Delete complaint from "${deleteTarget.name}"? This cannot be undone.`
                : ''
            }
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
      }
    >
      <ComplaintsTable
        complaints={complaints ?? []}
        onEdit={(row) => {
          setSelectedComplaint(row);
          setDialogMode('edit');
        }}
        onDelete={setDeleteTarget}
      />
    </ModuleListPack>
  );
}
