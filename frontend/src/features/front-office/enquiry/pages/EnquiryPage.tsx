import { useState } from 'react';
import { Plus } from 'lucide-react';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { EnquiriesTable } from '@features/front-office/enquiry/components/EnquiriesTable';
import { EnquiryFormDialog } from '@features/front-office/enquiry/components/EnquiryFormDialog';
import type { EnquiryFormValues } from '@features/front-office/enquiry/schemas/enquiry.schema';
import {
  useCreateEnquiry,
  useDeleteEnquiry,
  useEnquiries,
  useUpdateEnquiry,
} from '@hooks/useEnquiries';
import type { Enquiry } from '@app-types/front-office/enquiry';
import { ModuleListPack } from '@workflow-packs';

type DialogMode = 'create' | 'edit' | null;

function toPayload(values: EnquiryFormValues) {
  return {
    name: values.name,
    contact: values.contact,
    email: values.email?.trim() ? values.email.trim() : null,
    source: values.source?.trim() ?? '',
    status: values.status,
    date: values.date,
    follow_up_date: values.follow_up_date,
    description: values.description?.trim() ?? '',
    note: values.note?.trim() ?? '',
  };
}

export function EnquiryPage() {
  const { data: enquiries, isLoading, isError, error, refetch } = useEnquiries();
  const createMutation = useCreateEnquiry();
  const updateMutation = useUpdateEnquiry();
  const deleteMutation = useDeleteEnquiry();

  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Enquiry | null>(null);

  const closeFormDialog = () => {
    setDialogMode(null);
    setSelectedEnquiry(null);
  };

  const handleFormSubmit = (values: EnquiryFormValues) => {
    const payload = toPayload(values);
    if (dialogMode === 'edit' && selectedEnquiry) {
      updateMutation.mutate({ id: selectedEnquiry.id, payload }, { onSuccess: closeFormDialog });
      return;
    }
    createMutation.mutate(payload, { onSuccess: closeFormDialog });
  };

  const isFormLoading = createMutation.isPending || updateMutation.isPending;

  const addAction = (
    <PermissionButton
      permission="staff.create"
      onClick={() => setDialogMode('create')}
      className="gap-1"
    >
      <Plus className="h-4 w-4" aria-hidden="true" />
      Add Enquiry
    </PermissionButton>
  );

  return (
    <ModuleListPack
      title="Admission Enquiries"
      description="Track front-office admission enquiries and follow-ups."
      actions={addAction}
      isLoading={isLoading}
      loadingMessage="Loading enquiries..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && (enquiries?.length ?? 0) === 0}
      emptyTitle="No enquiries yet"
      emptyDescription="Create the first enquiry to start tracking admission leads."
      emptyAction={addAction}
      footer={
        <>
          <EnquiryFormDialog
            open={dialogMode !== null}
            onOpenChange={(open) => {
              if (!open) closeFormDialog();
            }}
            enquiry={dialogMode === 'edit' ? selectedEnquiry : null}
            onSubmit={handleFormSubmit}
            isLoading={isFormLoading}
          />
          <ConfirmDialog
            open={deleteTarget !== null}
            onOpenChange={(open) => {
              if (!open) setDeleteTarget(null);
            }}
            title="Delete enquiry"
            description={
              deleteTarget
                ? `Delete enquiry for "${deleteTarget.name}"? This cannot be undone.`
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
      <EnquiriesTable
        enquiries={enquiries ?? []}
        onEdit={(row) => {
          setSelectedEnquiry(row);
          setDialogMode('edit');
        }}
        onDelete={setDeleteTarget}
      />
    </ModuleListPack>
  );
}
