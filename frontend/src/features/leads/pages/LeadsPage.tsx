import { useEffect, useMemo, useState } from 'react';
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
  useCreateLead,
  useDeleteLead,
  useLeadCampaigns,
  useLeads,
  useUpdateLead,
} from '@hooks/useLeads';
import type { Lead } from '@app-types/leads';
import { ModuleListPack } from '@workflow-packs';

const schema = z.object({
  l_name: z.string().trim().min(1, 'Name is required'),
  l_phone_number: z.string().trim().min(1, 'Phone is required'),
  c_id: z.string().min(1, 'Campaign is required'),
  l_father_name: z.string().optional(),
  l_class: z.string().optional(),
  l_address: z.string().optional(),
  l_email: z.string().optional(),
  l_source: z.string().optional(),
  l_status: z.string().optional(),
  l_date: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

const columns: DataTableColumn<Lead>[] = [
  { id: 'l_name', header: 'Name', cellClassName: 'font-medium', cell: (r) => r.l_name },
  { id: 'phone', header: 'Phone', cell: (r) => r.l_phone_number || '—' },
  { id: 'class', header: 'Class', cell: (r) => r.l_class || '—' },
  { id: 'source', header: 'Source', cell: (r) => r.l_source || '—' },
  { id: 'status', header: 'Status', cell: (r) => r.l_status || '—' },
  { id: 'date', header: 'Date', cell: (r) => r.l_date || '—' },
];

export function LeadsPage() {
  const { data = [], isLoading, isError, error, refetch } = useLeads();
  const { data: campaigns = [] } = useLeadCampaigns();
  const createMutation = useCreateLead();
  const updateMutation = useUpdateLead();
  const deleteMutation = useDeleteLead();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Lead | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Lead | null>(null);
  const { control, handleSubmit, reset, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      l_name: '',
      l_phone_number: '',
      c_id: '',
      l_father_name: '',
      l_class: '',
      l_address: '',
      l_email: '',
      l_source: '',
      l_status: 'Open',
      l_date: '',
    },
  });

  const campaignOptions = useMemo(
    () => campaigns.map((c) => ({ value: String(c.id), label: c.c_title })),
    [campaigns],
  );

  useEffect(() => {
    if (!open) return;
    reset(
      selected
        ? {
            l_name: selected.l_name,
            l_phone_number: selected.l_phone_number,
            c_id: String(selected.c_id),
            l_father_name: selected.l_father_name || '',
            l_class: selected.l_class || '',
            l_address: selected.l_address || '',
            l_email: selected.l_email || '',
            l_source: selected.l_source || '',
            l_status: selected.l_status || 'Open',
            l_date: selected.l_date || '',
          }
        : {
            l_name: '',
            l_phone_number: '',
            c_id: '',
            l_father_name: '',
            l_class: '',
            l_address: '',
            l_email: '',
            l_source: '',
            l_status: 'Open',
            l_date: '',
          },
    );
  }, [open, selected, reset]);

  const addAction = (
    <PermissionButton
      permission="leads.create"
      onClick={() => {
        setSelected(null);
        setOpen(true);
      }}
      className="gap-1"
    >
      <Plus className="h-4 w-4" />
      Add Lead
    </PermissionButton>
  );

  return (
    <ModuleListPack
      title="All Leads"
      description="Track admission leads linked to campaigns."
      actions={addAction}
      isLoading={isLoading}
      loadingMessage="Loading leads..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && data.length === 0}
      emptyTitle="No leads yet"
      emptyDescription="Create a campaign first, then add leads."
      emptyAction={addAction}
    >
      <DataTable
        data={data}
        columns={columns}
        getRowKey={(r) => r.id}
        actions={(row) => (
          <>
            <PermissionButton
              permission="leads.edit"
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
              permission="leads.delete"
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
        title={selected ? 'Edit Lead' : 'Add Lead'}
        onSubmit={handleSubmit((values) => {
          const payload = {
            l_name: values.l_name.trim(),
            l_phone_number: values.l_phone_number.trim(),
            c_id: Number(values.c_id),
            l_father_name: values.l_father_name?.trim() || '',
            l_class: values.l_class?.trim() || '',
            l_address: values.l_address?.trim() || '',
            l_email: values.l_email?.trim() || '',
            l_source: values.l_source?.trim() || '',
            l_status: values.l_status?.trim() || 'Open',
            ...(values.l_date ? { l_date: values.l_date } : {}),
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
        <FormTextField control={control} name="l_name" label="Name" required />
        <FormTextField control={control} name="l_phone_number" label="Phone" required />
        <FormSelectField
          control={control}
          name="c_id"
          label="Campaign"
          required
          options={campaignOptions}
          placeholder="Select campaign"
        />
        <FormTextField control={control} name="l_father_name" label="Father name" />
        <FormTextField control={control} name="l_class" label="Class" />
        <FormTextField control={control} name="l_email" label="Email" />
        <FormTextField control={control} name="l_source" label="Source" />
        <FormTextField control={control} name="l_status" label="Status" />
        <FormDateField control={control} name="l_date" label="Lead date" />
        <FormTextareaField control={control} name="l_address" label="Address" />
      </EntityFormDialog>
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete lead?"
        description={`Remove lead “${deleteTarget?.l_name ?? ''}”.`}
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
