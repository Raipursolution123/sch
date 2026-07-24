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
  FormSwitchField,
  FormTextField,
  FormTextareaField,
} from '@components/forms/fields';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { PermissionButton } from '@components/rbac/PermissionButton';
import {
  useAlumniEvents,
  useCreateAlumniEvent,
  useDeleteAlumniEvent,
  useUpdateAlumniEvent,
} from '@hooks/useAlumni';
import { useClasses } from '@hooks/useClasses';
import { useSessions } from '@hooks/useSessions';
import type { AlumniEvent } from '@app-types/alumni';
import { ModuleListPack } from '@workflow-packs';

const schema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  event_for: z.string().optional(),
  session_id: z.string().optional(),
  class_id: z.string().optional(),
  section: z.string().optional(),
  from_date: z.string().min(1, 'From date is required'),
  to_date: z.string().min(1, 'To date is required'),
  note: z.string().optional(),
  photo: z.string().optional(),
  is_active: z.boolean(),
  event_notification_message: z.string().optional(),
  show_onwebsite: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

function toDateInput(value: string | null | undefined): string {
  if (!value) return '';
  return value.slice(0, 10);
}

const columns: DataTableColumn<AlumniEvent>[] = [
  {
    id: 'title',
    header: 'Title',
    cellClassName: 'font-medium',
    cell: (r) => r.title,
  },
  { id: 'event_for', header: 'Event for', cell: (r) => r.event_for || '—' },
  {
    id: 'dates',
    header: 'Dates',
    cell: (r) => `${toDateInput(r.from_date)} → ${toDateInput(r.to_date)}`,
  },
  {
    id: 'session',
    header: 'Session',
    cell: (r) => r.session_name || '—',
  },
  {
    id: 'class',
    header: 'Class',
    cell: (r) => r.class_name || '—',
  },
  {
    id: 'active',
    header: 'Active',
    cell: (r) => (r.is_active ? 'Yes' : 'No'),
  },
];

export function AlumniEventsPage() {
  const { data = [], isLoading, isError, error, refetch } = useAlumniEvents();
  const createMutation = useCreateAlumniEvent();
  const updateMutation = useUpdateAlumniEvent();
  const deleteMutation = useDeleteAlumniEvent();
  const { data: sessionsData } = useSessions();
  const { data: classesData } = useClasses();
  const sessions = sessionsData?.results ?? [];
  const classes = classesData?.results ?? [];

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<AlumniEvent | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AlumniEvent | null>(null);
  const { control, handleSubmit, reset, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      event_for: 'all',
      session_id: '',
      class_id: '',
      section: '',
      from_date: '',
      to_date: '',
      note: '',
      photo: '',
      is_active: true,
      event_notification_message: '',
      show_onwebsite: false,
    },
  });

  const sessionOptions = useMemo(
    () => [
      { value: '', label: 'None' },
      ...sessions.map((s) => ({ value: String(s.id), label: s.session })),
    ],
    [sessions],
  );

  const classOptions = useMemo(
    () => [
      { value: '', label: 'None' },
      ...classes.map((c) => ({ value: String(c.id), label: c.class_name })),
    ],
    [classes],
  );

  useEffect(() => {
    if (!open) return;
    reset(
      selected
        ? {
            title: selected.title,
            event_for: selected.event_for || 'all',
            session_id: selected.session_id != null ? String(selected.session_id) : '',
            class_id: selected.class_id != null ? String(selected.class_id) : '',
            section: selected.section || '',
            from_date: toDateInput(selected.from_date),
            to_date: toDateInput(selected.to_date),
            note: selected.note || '',
            photo: selected.photo || '',
            is_active: Boolean(selected.is_active),
            event_notification_message: selected.event_notification_message || '',
            show_onwebsite: Boolean(selected.show_onwebsite),
          }
        : {
            title: '',
            event_for: 'all',
            session_id: '',
            class_id: '',
            section: '',
            from_date: '',
            to_date: '',
            note: '',
            photo: '',
            is_active: true,
            event_notification_message: '',
            show_onwebsite: false,
          },
    );
  }, [open, selected, reset]);

  const addAction = (
    <PermissionButton
      permission="alumni.events.create"
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
      title="Alumni Events"
      description="Schedule and manage alumni events."
      actions={addAction}
      isLoading={isLoading}
      loadingMessage="Loading alumni events..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && data.length === 0}
      emptyTitle="No alumni events"
      emptyDescription="Create an event to invite alumni."
      emptyAction={addAction}
    >
      <DataTable
        data={data}
        columns={columns}
        getRowKey={(r) => r.id}
        actions={(row) => (
          <>
            <PermissionButton
              permission="alumni.events.edit"
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
              permission="alumni.events.delete"
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
        title={selected ? 'Edit Alumni Event' : 'Add Alumni Event'}
        onSubmit={handleSubmit((values) => {
          const payload = {
            title: values.title.trim(),
            event_for: values.event_for?.trim() || 'all',
            session_id: values.session_id ? Number(values.session_id) : null,
            class_id: values.class_id ? Number(values.class_id) : null,
            section: values.section?.trim() || '',
            from_date: values.from_date,
            to_date: values.to_date,
            note: values.note?.trim() || '',
            photo: values.photo?.trim() || null,
            is_active: values.is_active ? 1 : 0,
            event_notification_message: values.event_notification_message?.trim() || '',
            show_onwebsite: values.show_onwebsite ? 1 : 0,
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
        <FormTextField control={control} name="title" label="Title" required />
        <FormTextField control={control} name="event_for" label="Event for" />
        <FormSelectField
          control={control}
          name="session_id"
          label="Session"
          options={sessionOptions}
        />
        <FormSelectField control={control} name="class_id" label="Class" options={classOptions} />
        <FormTextField control={control} name="section" label="Section" />
        <FormDateField control={control} name="from_date" label="From date" required />
        <FormDateField control={control} name="to_date" label="To date" required />
        <FormTextareaField control={control} name="note" label="Note" />
        <FormTextField control={control} name="photo" label="Photo URL" />
        <FormTextareaField
          control={control}
          name="event_notification_message"
          label="Notification message"
        />
        <FormSwitchField control={control} name="is_active" label="Active" />
        <FormSwitchField control={control} name="show_onwebsite" label="Show on website" />
      </EntityFormDialog>
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete alumni event?"
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
