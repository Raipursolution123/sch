import { useState } from 'react';
import { Plus } from 'lucide-react';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { ModuleListPack } from '@workflow-packs';
import { PostalRecordsTable } from '@features/front-office/postal/components/PostalRecordsTable';
import { PostalFormDialog } from '@features/front-office/postal/components/PostalFormDialog';
import type { PostalFormValues } from '@features/front-office/postal/schemas/postal.schema';
import {
  useCreatePostalRecord,
  useDeletePostalRecord,
  usePostalRecords,
  useUpdatePostalRecord,
} from '@hooks/usePostalRecords';
import type { PostalRecord, PostalRecordType } from '@app-types/front-office/postal';

type DialogMode = 'create' | 'edit' | null;

interface PostalRecordsPageProps {
  type: PostalRecordType;
}

const pageMeta: Record<
  PostalRecordType,
  {
    title: string;
    description: string;
    addLabel: string;
    emptyTitle: string;
    emptyDescription: string;
  }
> = {
  dispatch: {
    title: 'Postal Dispatch',
    description: 'Track outgoing postal dispatches from the school.',
    addLabel: 'Add Dispatch',
    emptyTitle: 'No dispatch records',
    emptyDescription: 'Create the first postal dispatch record.',
  },
  receive: {
    title: 'Postal Receive',
    description: 'Track incoming postal items received at the school.',
    addLabel: 'Add Receive',
    emptyTitle: 'No receive records',
    emptyDescription: 'Create the first postal receive record.',
  },
};

function toPayload(values: PostalFormValues, type: PostalRecordType) {
  return {
    reference_no: values.reference_no,
    to_title: values.to_title,
    type,
    from_title: values.from_title?.trim() ?? '',
    address: values.address?.trim() ?? '',
    note: values.note?.trim() ?? '',
    date: values.date?.trim() || null,
  };
}

export function PostalRecordsPage({ type }: PostalRecordsPageProps) {
  const meta = pageMeta[type];
  const { data: records, isLoading, isError, error, refetch } = usePostalRecords(type);
  const createMutation = useCreatePostalRecord();
  const updateMutation = useUpdatePostalRecord();
  const deleteMutation = useDeletePostalRecord();

  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [selectedRecord, setSelectedRecord] = useState<PostalRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PostalRecord | null>(null);

  const closeFormDialog = () => {
    setDialogMode(null);
    setSelectedRecord(null);
  };

  const handleFormSubmit = (values: PostalFormValues) => {
    const payload = toPayload(values, type);
    if (dialogMode === 'edit' && selectedRecord) {
      updateMutation.mutate({ id: selectedRecord.id, payload }, { onSuccess: closeFormDialog });
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
      {meta.addLabel}
    </PermissionButton>
  );

  return (
    <ModuleListPack
      title={meta.title}
      description={meta.description}
      actions={addAction}
      isLoading={isLoading}
      loadingMessage="Loading postal records..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && (records?.length ?? 0) === 0}
      emptyTitle={meta.emptyTitle}
      emptyDescription={meta.emptyDescription}
      emptyAction={addAction}
      footer={
        <>
          <PostalFormDialog
            open={dialogMode !== null}
            onOpenChange={(open) => {
              if (!open) closeFormDialog();
            }}
            record={dialogMode === 'edit' ? selectedRecord : null}
            onSubmit={handleFormSubmit}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
          <ConfirmDialog
            open={deleteTarget !== null}
            onOpenChange={(open) => {
              if (!open) setDeleteTarget(null);
            }}
            title="Delete postal record"
            description={
              deleteTarget
                ? `Delete record "${deleteTarget.reference_no}"? This cannot be undone.`
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
      <PostalRecordsTable
        records={records ?? []}
        onEdit={(row) => {
          setSelectedRecord(row);
          setDialogMode('edit');
        }}
        onDelete={setDeleteTarget}
      />
    </ModuleListPack>
  );
}

export function PostalDispatchPage() {
  return <PostalRecordsPage type="dispatch" />;
}

export function PostalReceivePage() {
  return <PostalRecordsPage type="receive" />;
}
