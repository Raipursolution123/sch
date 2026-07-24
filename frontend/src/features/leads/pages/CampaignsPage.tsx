import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { z } from 'zod';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import {
  FormDateField,
  FormSelectField,
  FormTextField,
  FormTextareaField,
} from '@components/forms/fields';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { PermissionButton } from '@components/rbac/PermissionButton';
import {
  useCreateLeadCampaign,
  useDeleteLeadCampaign,
  useLeadCampaigns,
  useUpdateLeadCampaign,
} from '@hooks/useLeads';
import type { LeadCampaign } from '@app-types/leads';
import { ModuleListPack } from '@workflow-packs';

const schema = z.object({
  c_title: z.string().trim().min(1, 'Title is required'),
  c_description: z.string().optional(),
  c_date: z.string().optional(),
  c_status: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

const columns: DataTableColumn<LeadCampaign>[] = [
  { id: 'c_title', header: 'Campaign', cellClassName: 'font-medium', cell: (r) => r.c_title },
  { id: 'c_date', header: 'Date', cell: (r) => r.c_date || '—' },
  { id: 'c_status', header: 'Status', cell: (r) => r.c_status || '—' },
  {
    id: 'leads',
    header: 'Leads',
    cellClassName: 'tabular-nums',
    cell: (r) => r.lead_count ?? 0,
  },
];

export function CampaignsPage() {
  const { data = [], isLoading, isError, error, refetch } = useLeadCampaigns();
  const createMutation = useCreateLeadCampaign();
  const updateMutation = useUpdateLeadCampaign();
  const deleteMutation = useDeleteLeadCampaign();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<LeadCampaign | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LeadCampaign | null>(null);
  const { control, handleSubmit, reset, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { c_title: '', c_description: '', c_date: '', c_status: 'Active' },
  });

  useEffect(() => {
    if (!open) return;
    reset(
      selected
        ? {
            c_title: selected.c_title,
            c_description: selected.c_description || '',
            c_date: selected.c_date || '',
            c_status: selected.c_status || 'Active',
          }
        : { c_title: '', c_description: '', c_date: '', c_status: 'Active' },
    );
  }, [open, selected, reset]);

  const addAction = (
    <PermissionButton
      permission="leads.campaigns.create"
      onClick={() => {
        setSelected(null);
        setOpen(true);
      }}
      className="gap-1"
    >
      <Plus className="h-4 w-4" />
      Add Campaign
    </PermissionButton>
  );

  return (
    <ModuleListPack
      title="Campaigns"
      description="Organize lead intake by campaign."
      actions={addAction}
      isLoading={isLoading}
      loadingMessage="Loading campaigns..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && data.length === 0}
      emptyTitle="No campaigns"
      emptyDescription="Create a campaign to start capturing leads."
      emptyAction={addAction}
    >
      <DataTable
        data={data}
        columns={columns}
        getRowKey={(r) => r.id}
        actions={(row) => (
          <>
            <PermissionButton
              permission="leads.campaigns.edit"
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
              permission="leads.campaigns.delete"
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
        title={selected ? 'Edit Campaign' : 'Add Campaign'}
        onSubmit={handleSubmit((values) => {
          const payload = {
            c_title: values.c_title.trim(),
            c_description: values.c_description?.trim() || '',
            c_status: values.c_status?.trim() || 'Active',
            ...(values.c_date ? { c_date: values.c_date } : {}),
          };
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
        <FormTextField control={control} name="c_title" label="Title" required />
        <FormTextareaField control={control} name="c_description" label="Description" />
        <FormDateField control={control} name="c_date" label="Date" />
        <FormSelectField
          control={control}
          name="c_status"
          label="Status"
          options={[
            { value: 'Active', label: 'Active' },
            { value: 'Inactive', label: 'Inactive' },
            { value: 'Closed', label: 'Closed' },
          ]}
        />
      </EntityFormDialog>
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete campaign?"
        description={`Remove “${deleteTarget?.c_title ?? ''}”. Campaigns with leads cannot be deleted.`}
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
