import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2 } from 'lucide-react';
import { z } from 'zod';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormSelectField } from '@components/forms/fields';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { PermissionButton } from '@components/rbac/PermissionButton';
import {
  useCreateLeadPromoter,
  useDeleteLeadPromoter,
  useLeadCampaigns,
  useLeadPromoters,
} from '@hooks/useLeads';
import { useStaff } from '@hooks/useStaff';
import type { LeadPromoter } from '@app-types/leads';
import { ModuleListPack } from '@workflow-packs';

const schema = z.object({
  c_id: z.string().min(1, 'Campaign is required'),
  staff_id: z.string().min(1, 'Staff is required'),
});
type FormValues = z.infer<typeof schema>;

export function PromotersPage() {
  const { data = [], isLoading, isError, error, refetch } = useLeadPromoters();
  const { data: campaigns = [] } = useLeadCampaigns();
  const { data: staffPage } = useStaff(1);
  const createMutation = useCreateLeadPromoter();
  const deleteMutation = useDeleteLeadPromoter();
  const [open, setOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<LeadPromoter | null>(null);
  const { control, handleSubmit, reset, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { c_id: '', staff_id: '' },
  });

  const staffOptions = useMemo(
    () =>
      (staffPage?.results ?? []).map((s) => ({
        value: String(s.id),
        label: s.full_name || `Staff #${s.id}`,
      })),
    [staffPage],
  );

  const campaignOptions = useMemo(
    () => campaigns.map((c) => ({ value: String(c.id), label: c.c_title })),
    [campaigns],
  );

  const staffNameById = useMemo(() => {
    const map = new Map<number, string>();
    for (const s of staffPage?.results ?? []) {
      map.set(s.id, s.full_name || `Staff #${s.id}`);
    }
    return map;
  }, [staffPage]);

  const columns: DataTableColumn<LeadPromoter>[] = [
    {
      id: 'campaign',
      header: 'Campaign',
      cellClassName: 'font-medium',
      cell: (r) => r.campaign_title || `Campaign #${r.c_id}`,
    },
    {
      id: 'staff',
      header: 'Staff',
      cell: (r) => staffNameById.get(r.staff_id) || `Staff #${r.staff_id}`,
    },
  ];

  useEffect(() => {
    if (!open) return;
    reset({ c_id: '', staff_id: '' });
  }, [open, reset]);

  const addAction = (
    <PermissionButton
      permission="leads.promoters.create"
      onClick={() => setOpen(true)}
      className="gap-1"
    >
      <Plus className="h-4 w-4" />
      Assign Promoter
    </PermissionButton>
  );

  return (
    <ModuleListPack
      title="Promoters"
      description="Assign staff counsellors to campaigns."
      actions={addAction}
      isLoading={isLoading}
      loadingMessage="Loading promoters..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && data.length === 0}
      emptyTitle="No promoters"
      emptyDescription="Assign staff to a campaign as promoters."
      emptyAction={addAction}
    >
      <DataTable
        data={data}
        columns={columns}
        getRowKey={(r) => r.id}
        actions={(row) => (
          <PermissionButton
            permission="leads.promoters.delete"
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => setDeleteTarget(row)}
          >
            <Trash2 className="h-4 w-4" />
          </PermissionButton>
        )}
      />
      <EntityFormDialog
        open={open}
        onOpenChange={setOpen}
        title="Assign Promoter"
        onSubmit={handleSubmit((values) => {
          createMutation.mutate(
            { c_id: Number(values.c_id), staff_id: Number(values.staff_id) },
            { onSuccess: () => setOpen(false) },
          );
        })}
        isLoading={createMutation.isPending}
      >
        <FormErrorSummary errors={formState.errors} />
        <FormSelectField
          control={control}
          name="c_id"
          label="Campaign"
          required
          options={campaignOptions}
          placeholder="Select campaign"
        />
        <FormSelectField
          control={control}
          name="staff_id"
          label="Staff"
          required
          options={staffOptions}
          placeholder="Select staff"
        />
      </EntityFormDialog>
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Remove promoter?"
        description="Unassign this staff member from the campaign."
        confirmLabel="Remove"
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
