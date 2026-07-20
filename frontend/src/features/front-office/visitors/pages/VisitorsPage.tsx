import { useState } from 'react';
import { Plus } from 'lucide-react';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { ModuleListPack } from '@workflow-packs';
import { VisitorsTable } from '@features/front-office/visitors/components/VisitorsTable';
import { VisitorFormDialog } from '@features/front-office/visitors/components/VisitorFormDialog';
import type { VisitorFormValues } from '@features/front-office/visitors/schemas/visitor.schema';
import {
  useCreateVisitor,
  useDeleteVisitor,
  useUpdateVisitor,
  useVisitorsBook,
} from '@hooks/useVisitorsBook';
import type { VisitorsBookEntry } from '@app-types/front-office/visitors-book';

type DialogMode = 'create' | 'edit' | null;

function toPayload(values: VisitorFormValues) {
  return {
    name: values.name,
    contact: values.contact,
    purpose: values.purpose,
    email: values.email?.trim() ? values.email.trim() : null,
    source: values.source?.trim() ?? '',
    id_proof: values.id_proof?.trim() ?? '',
    no_of_people: values.no_of_people ?? 1,
    date: values.date,
    in_time: values.in_time?.trim() ?? '',
    out_time: values.out_time?.trim() ?? '',
    meeting_with: values.meeting_with?.trim() ?? '',
    note: values.note?.trim() ?? '',
  };
}

export function VisitorsPage() {
  const { data: visitors, isLoading, isError, error, refetch } = useVisitorsBook();
  const createMutation = useCreateVisitor();
  const updateMutation = useUpdateVisitor();
  const deleteMutation = useDeleteVisitor();

  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [selectedVisitor, setSelectedVisitor] = useState<VisitorsBookEntry | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<VisitorsBookEntry | null>(null);

  const closeFormDialog = () => {
    setDialogMode(null);
    setSelectedVisitor(null);
  };

  const handleFormSubmit = (values: VisitorFormValues) => {
    const payload = toPayload(values);
    if (dialogMode === 'edit' && selectedVisitor) {
      updateMutation.mutate({ id: selectedVisitor.id, payload }, { onSuccess: closeFormDialog });
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
      Add Visitor
    </PermissionButton>
  );

  return (
    <ModuleListPack
      title="Visitor Book"
      description="Track visitors entering and leaving the school premises."
      actions={addAction}
      isLoading={isLoading}
      loadingMessage="Loading visitor records..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && (visitors?.length ?? 0) === 0}
      emptyTitle="No visitors yet"
      emptyDescription="Add the first visitor record to start tracking entries."
      emptyAction={addAction}
      footer={
        <>
          <VisitorFormDialog
            open={dialogMode !== null}
            onOpenChange={(open) => {
              if (!open) closeFormDialog();
            }}
            visitor={dialogMode === 'edit' ? selectedVisitor : null}
            onSubmit={handleFormSubmit}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
          <ConfirmDialog
            open={deleteTarget !== null}
            onOpenChange={(open) => {
              if (!open) setDeleteTarget(null);
            }}
            title="Delete visitor record"
            description={
              deleteTarget
                ? `Delete visitor record for "${deleteTarget.name}"? This cannot be undone.`
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
      <VisitorsTable
        visitors={visitors ?? []}
        onEdit={(row) => {
          setSelectedVisitor(row);
          setDialogMode('edit');
        }}
        onDelete={setDeleteTarget}
      />
    </ModuleListPack>
  );
}
