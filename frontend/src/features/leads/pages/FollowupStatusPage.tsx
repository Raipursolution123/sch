import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { z } from 'zod';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormTextField } from '@components/forms/fields';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { PermissionButton } from '@components/rbac/PermissionButton';
import {
  useCreateLeadFollowupStatus,
  useDeleteLeadFollowupStatus,
  useLeadFollowupStatuses,
  useUpdateLeadFollowupStatus,
} from '@hooks/useLeads';
import type { LeadFollowupStatus } from '@app-types/leads';
import { ModuleListPack } from '@workflow-packs';

const schema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
});
type FormValues = z.infer<typeof schema>;

const columns: DataTableColumn<LeadFollowupStatus>[] = [
  { id: 'title', header: 'Status', cellClassName: 'font-medium', cell: (r) => r.title },
];

export function FollowupStatusPage() {
  const { data = [], isLoading, isError, error, refetch } = useLeadFollowupStatuses();
  const createMutation = useCreateLeadFollowupStatus();
  const updateMutation = useUpdateLeadFollowupStatus();
  const deleteMutation = useDeleteLeadFollowupStatus();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<LeadFollowupStatus | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LeadFollowupStatus | null>(null);
  const { control, handleSubmit, reset, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: '' },
  });

  useEffect(() => {
    if (!open) return;
    reset({ title: selected?.title || '' });
  }, [open, selected, reset]);

  const addAction = (
    <PermissionButton
      permission="leads.followup_status.create"
      onClick={() => {
        setSelected(null);
        setOpen(true);
      }}
      className="gap-1"
    >
      <Plus className="h-4 w-4" />
      Add Status
    </PermissionButton>
  );

  return (
    <ModuleListPack
      title="Follow-up Status"
      description="Manage follow-up status labels."
      actions={addAction}
      isLoading={isLoading}
      loadingMessage="Loading statuses..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && data.length === 0}
      emptyTitle="No statuses"
      emptyDescription="Add statuses used when logging follow-ups."
      emptyAction={addAction}
    >
      <DataTable
        data={data}
        columns={columns}
        getRowKey={(r) => r.id}
        actions={(row) => (
          <>
            <PermissionButton
              permission="leads.followup_status.edit"
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelected(row);
                setOpen(true);
              }}
            >
              <Pencil className="h-4 w-4" />
            </PermissionButton>
            <PermissionButton
              permission="leads.followup_status.delete"
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => setDeleteTarget(row)}
            >
              <Trash2 className="h-4 w-4" />
            </PermissionButton>
          </>
        )}
      />
      <EntityFormDialog
        open={open}
        onOpenChange={setOpen}
        title={selected ? 'Edit Status' : 'Add Status'}
        onSubmit={handleSubmit((values) => {
          const payload = { title: values.title.trim() };
          if (selected) {
            updateMutation.mutate(
              { id: selected.id, payload },
              { onSuccess: () => setOpen(false) },
            );
            return;
          }
          createMutation.mutate(payload, { onSuccess: () => setOpen(false) });
        })}
        isLoading={createMutation.isPending || updateMutation.isPending}
      >
        <FormErrorSummary errors={formState.errors} />
        <FormTextField control={control} name="title" label="Title" required />
      </EntityFormDialog>
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete status?"
        description={`Remove “${deleteTarget?.title ?? ''}”.`}
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteMutation.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
        }}
        isLoading={deleteMutation.isPending}
      />
    </ModuleListPack>
  );
}
