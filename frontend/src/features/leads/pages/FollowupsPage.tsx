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
  FormTextareaField,
  FormTimeField,
} from '@components/forms/fields';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { PermissionButton } from '@components/rbac/PermissionButton';
import {
  useCreateLeadFollowup,
  useDeleteLeadFollowup,
  useLeadFollowupStatuses,
  useLeadFollowups,
  useLeads,
  useUpdateLeadFollowup,
} from '@hooks/useLeads';
import type { LeadFollowup } from '@app-types/leads';
import { ModuleListPack } from '@workflow-packs';

const schema = z.object({
  l_id: z.string().min(1, 'Lead is required'),
  followup_date: z.string().min(1, 'Follow-up date is required'),
  next_followup_date: z.string().min(1, 'Next follow-up date is required'),
  followup_time: z.string().optional(),
  next_followup_time: z.string().optional(),
  followup_remark: z.string().optional(),
  call_status: z.string().optional(),
  followup_priority: z.string().optional(),
  followup_status: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export function FollowupsPage() {
  const { data = [], isLoading, isError, error, refetch } = useLeadFollowups();
  const { data: leads = [] } = useLeads();
  const { data: statuses = [] } = useLeadFollowupStatuses();
  const createMutation = useCreateLeadFollowup();
  const updateMutation = useUpdateLeadFollowup();
  const deleteMutation = useDeleteLeadFollowup();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<LeadFollowup | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LeadFollowup | null>(null);
  const { control, handleSubmit, reset, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      l_id: '',
      followup_date: '',
      next_followup_date: '',
      followup_time: '',
      next_followup_time: '',
      followup_remark: '',
      call_status: 'Pending',
      followup_priority: 'Normal',
      followup_status: '',
    },
  });

  const leadOptions = useMemo(
    () => leads.map((l) => ({ value: String(l.id), label: `${l.l_name} (${l.l_phone_number})` })),
    [leads],
  );
  const statusOptions = useMemo(
    () => [
      { value: '0', label: 'None' },
      ...statuses.map((s) => ({ value: String(s.id), label: s.title })),
    ],
    [statuses],
  );
  const leadNameById = useMemo(() => {
    const map = new Map<number, string>();
    for (const l of leads) map.set(l.id, l.l_name);
    return map;
  }, [leads]);

  const columns: DataTableColumn<LeadFollowup>[] = [
    {
      id: 'lead',
      header: 'Lead',
      cellClassName: 'font-medium',
      cell: (r) => leadNameById.get(r.l_id) || `Lead #${r.l_id}`,
    },
    { id: 'date', header: 'Follow-up', cell: (r) => r.followup_date || '—' },
    { id: 'next', header: 'Next', cell: (r) => r.next_followup_date || '—' },
    { id: 'call', header: 'Call status', cell: (r) => r.call_status || '—' },
    { id: 'priority', header: 'Priority', cell: (r) => r.followup_priority || '—' },
  ];

  useEffect(() => {
    if (!open) return;
    reset(
      selected
        ? {
            l_id: String(selected.l_id),
            followup_date: selected.followup_date || '',
            next_followup_date: selected.next_followup_date || '',
            followup_time: selected.followup_time?.slice(0, 5) || '',
            next_followup_time: selected.next_followup_time?.slice(0, 5) || '',
            followup_remark: selected.followup_remark || '',
            call_status: selected.call_status || 'Pending',
            followup_priority: selected.followup_priority || 'Normal',
            followup_status: String(selected.followup_status ?? 0),
          }
        : {
            l_id: '',
            followup_date: '',
            next_followup_date: '',
            followup_time: '',
            next_followup_time: '',
            followup_remark: '',
            call_status: 'Pending',
            followup_priority: 'Normal',
            followup_status: '0',
          },
    );
  }, [open, selected, reset]);

  const addAction = (
    <PermissionButton
      permission="leads.followups.create"
      onClick={() => {
        setSelected(null);
        setOpen(true);
      }}
      className="gap-1"
    >
      <Plus className="h-4 w-4" />
      Add Follow-up
    </PermissionButton>
  );

  return (
    <ModuleListPack
      title="Follow-ups"
      description="Log and schedule lead follow-up calls."
      actions={addAction}
      isLoading={isLoading}
      loadingMessage="Loading follow-ups..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && data.length === 0}
      emptyTitle="No follow-ups"
      emptyDescription="Create a follow-up against an existing lead."
      emptyAction={addAction}
    >
      <DataTable
        data={data}
        columns={columns}
        getRowKey={(r) => r.id}
        actions={(row) => (
          <>
            <PermissionButton
              permission="leads.followups.edit"
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
              permission="leads.followups.delete"
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
        title={selected ? 'Edit Follow-up' : 'Add Follow-up'}
        onSubmit={handleSubmit((values) => {
          const base = {
            followup_date: values.followup_date,
            next_followup_date: values.next_followup_date,
            followup_time: values.followup_time?.trim() || undefined,
            next_followup_time: values.next_followup_time?.trim() || undefined,
            followup_remark: values.followup_remark?.trim() || '',
            call_status: values.call_status?.trim() || 'Pending',
            followup_priority: values.followup_priority?.trim() || 'Normal',
            followup_status: Number(values.followup_status || 0),
          };
          if (selected) {
            updateMutation.mutate(
              { id: selected.id, payload: base },
              { onSuccess: () => setOpen(false) },
            );
            return;
          }
          createMutation.mutate(
            { ...base, l_id: Number(values.l_id) },
            { onSuccess: () => setOpen(false) },
          );
        })}
        isLoading={createMutation.isPending || updateMutation.isPending}
      >
        <FormErrorSummary errors={formState.errors} />
        {!selected && (
          <FormSelectField
            control={control}
            name="l_id"
            label="Lead"
            required
            options={leadOptions}
            placeholder="Select lead"
          />
        )}
        <FormDateField control={control} name="followup_date" label="Follow-up date" required />
        <FormTimeField control={control} name="followup_time" label="Follow-up time" />
        <FormDateField
          control={control}
          name="next_followup_date"
          label="Next follow-up date"
          required
        />
        <FormTimeField control={control} name="next_followup_time" label="Next follow-up time" />
        <FormSelectField
          control={control}
          name="call_status"
          label="Call status"
          options={[
            { value: 'Pending', label: 'Pending' },
            { value: 'Connected', label: 'Connected' },
            { value: 'Missed', label: 'Missed' },
            { value: 'Busy', label: 'Busy' },
          ]}
        />
        <FormSelectField
          control={control}
          name="followup_priority"
          label="Priority"
          options={[
            { value: 'Low', label: 'Low' },
            { value: 'Normal', label: 'Normal' },
            { value: 'High', label: 'High' },
          ]}
        />
        <FormSelectField
          control={control}
          name="followup_status"
          label="Follow-up status"
          options={statusOptions}
        />
        <FormTextareaField control={control} name="followup_remark" label="Remark" />
      </EntityFormDialog>
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete follow-up?"
        description="Remove this follow-up record."
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
