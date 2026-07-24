import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { z } from 'zod';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormTextField, FormTextareaField } from '@components/forms/fields';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { PermissionButton } from '@components/rbac/PermissionButton';
import {
  useCreateVisitorPurpose,
  useDeleteVisitorPurpose,
  useUpdateVisitorPurpose,
  useVisitorPurposes,
} from '@hooks/usePhoneCallPurpose';
import type { VisitorPurpose } from '@app-types/front-office/phone-call-purpose';
import { ModuleListPack } from '@workflow-packs';

const schema = z.object({
  visitors_purpose: z.string().trim().min(1, 'Name is required'),
  description: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

const columns: DataTableColumn<VisitorPurpose>[] = [
  {
    id: 'name',
    header: 'Purpose',
    cellClassName: 'font-medium',
    cell: (r) => r.visitors_purpose || r.name,
  },
  { id: 'description', header: 'Description', cell: (r) => r.description || '—' },
];

export function VisitorPurposePage() {
  const { data = [], isLoading, isError, error, refetch } = useVisitorPurposes();
  const createMutation = useCreateVisitorPurpose();
  const updateMutation = useUpdateVisitorPurpose();
  const deleteMutation = useDeleteVisitorPurpose();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<VisitorPurpose | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<VisitorPurpose | null>(null);
  const { control, handleSubmit, reset, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { visitors_purpose: '', description: '' },
  });

  useEffect(() => {
    if (!open) return;
    reset(
      selected
        ? {
            visitors_purpose: selected.visitors_purpose || selected.name,
            description: selected.description || '',
          }
        : { visitors_purpose: '', description: '' },
    );
  }, [open, selected, reset]);

  const addAction = (
    <PermissionButton
      permission="front_office.visitor_purpose.create"
      onClick={() => {
        setSelected(null);
        setOpen(true);
      }}
      className="gap-1"
    >
      <Plus className="h-4 w-4" />
      Add purpose
    </PermissionButton>
  );

  return (
    <>
      <ModuleListPack
        title="Visitor Purpose"
        description="Maintain visit purpose options used in the visitor book."
        actions={addAction}
        isLoading={isLoading}
        loadingMessage="Loading visitor purposes..."
        isError={isError}
        error={error}
        onRetry={() => void refetch()}
        isEmpty={!isLoading && !isError && data.length === 0}
        emptyTitle="No visitor purposes"
        emptyDescription="Add purposes such as Meeting, Admission enquiry, or Delivery."
        emptyAction={addAction}
      >
        <DataTable
          data={data}
          columns={columns}
          getRowKey={(r) => r.id}
          actions={(row) => (
            <>
              <PermissionButton
                permission="front_office.visitor_purpose.edit"
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
                permission="front_office.visitor_purpose.delete"
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
      </ModuleListPack>
      <EntityFormDialog
        open={open}
        onOpenChange={setOpen}
        title={selected ? 'Edit visitor purpose' : 'Add visitor purpose'}
        onSubmit={handleSubmit((values) => {
          const payload = {
            visitors_purpose: values.visitors_purpose,
            description: values.description?.trim() || '',
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
        <FormTextField control={control} name="visitors_purpose" label="Purpose" required />
        <FormTextareaField control={control} name="description" label="Description" />
      </EntityFormDialog>
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete visitor purpose?"
        description={`Remove “${deleteTarget?.visitors_purpose || deleteTarget?.name || ''}”.`}
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteMutation.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
        }}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}
