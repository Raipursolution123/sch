import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { z } from 'zod';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormDateField, FormTextField, FormTextareaField } from '@components/forms/fields';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { PermissionButton } from '@components/rbac/PermissionButton';
import {
  useCmsEvents,
  useCreateCmsEvent,
  useDeleteCmsEvent,
  useUpdateCmsEvent,
} from '@hooks/useCms';
import type { CmsEvent } from '@app-types/cms';
import { ModuleListPack } from '@workflow-packs';

const schema = z.object({
  event_title: z.string().trim().min(1, 'Title is required'),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  event_description: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

const columns: DataTableColumn<CmsEvent>[] = [
  {
    id: 'title',
    header: 'Event',
    cellClassName: 'font-medium',
    cell: (r) => r.event_title,
  },
  { id: 'start', header: 'Start', cell: (r) => String(r.start_date).slice(0, 10) },
  { id: 'end', header: 'End', cell: (r) => String(r.end_date).slice(0, 10) },
  { id: 'type', header: 'Type', cell: (r) => r.event_type || '—' },
];

export function EventsPage() {
  const { data = [], isLoading, isError, error, refetch } = useCmsEvents();
  const createMutation = useCreateCmsEvent();
  const updateMutation = useUpdateCmsEvent();
  const deleteMutation = useDeleteCmsEvent();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<CmsEvent | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CmsEvent | null>(null);
  const { control, handleSubmit, reset, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { event_title: '', start_date: '', end_date: '', event_description: '' },
  });

  useEffect(() => {
    if (!open) return;
    reset(
      selected
        ? {
            event_title: selected.event_title,
            start_date: String(selected.start_date).slice(0, 10),
            end_date: String(selected.end_date).slice(0, 10),
            event_description: selected.event_description || '',
          }
        : { event_title: '', start_date: '', end_date: '', event_description: '' },
    );
  }, [open, selected, reset]);

  const addAction = (
    <PermissionButton
      permission="cms.event.create"
      onClick={() => {
        setSelected(null);
        setOpen(true);
      }}
      className="gap-1"
    >
      <Plus className="h-4 w-4" />
      Add Event
    </PermissionButton>
  );

  return (
    <ModuleListPack
      title="Events"
      description="Publish school events on the front CMS."
      actions={addAction}
      isLoading={isLoading}
      loadingMessage="Loading events..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && data.length === 0}
      emptyTitle="No events"
      emptyDescription="Create the first CMS event."
      emptyAction={addAction}
    >
      <DataTable
        data={data}
        columns={columns}
        getRowKey={(r) => r.id}
        actions={(row) => (
          <>
            <PermissionButton
              permission="cms.event.edit"
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
              permission="cms.event.delete"
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
        title={selected ? 'Edit Event' : 'Add Event'}
        onSubmit={handleSubmit((values) => {
          const payload = {
            event_title: values.event_title.trim(),
            start_date: values.start_date,
            end_date: values.end_date,
            event_description: values.event_description?.trim() || '',
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
        <FormTextField control={control} name="event_title" label="Title" required />
        <FormDateField control={control} name="start_date" label="Start date" required />
        <FormDateField control={control} name="end_date" label="End date" required />
        <FormTextareaField control={control} name="event_description" label="Description" />
      </EntityFormDialog>
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete event?"
        description={`Remove “${deleteTarget?.event_title ?? ''}”.`}
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
