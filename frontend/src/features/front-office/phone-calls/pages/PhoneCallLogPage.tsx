import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { z } from 'zod';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormSelectField, FormTextField, FormTextareaField } from '@components/forms/fields';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { PermissionButton } from '@components/rbac/PermissionButton';
import {
  useCreatePhoneCallLog,
  useDeletePhoneCallLog,
  usePhoneCallLogs,
  useUpdatePhoneCallLog,
} from '@hooks/usePhoneCallPurpose';
import type { PhoneCallLog } from '@app-types/front-office/phone-call-purpose';
import { todayIsoDate } from '@utils/student';
import { ModuleListPack } from '@workflow-packs';

const schema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  contact: z.string().trim().min(1, 'Contact is required'),
  date: z.string().min(1, 'Date is required'),
  follow_up_date: z.string().optional(),
  call_type: z.enum(['Incoming', 'Outgoing']),
  call_duration: z.string().optional(),
  description: z.string().optional(),
  note: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

const columns: DataTableColumn<PhoneCallLog>[] = [
  { id: 'name', header: 'Name', cellClassName: 'font-medium', cell: (r) => r.name },
  { id: 'contact', header: 'Contact', cell: (r) => r.contact },
  { id: 'type', header: 'Type', cell: (r) => r.call_type },
  { id: 'date', header: 'Date', cell: (r) => r.date || '—' },
  { id: 'duration', header: 'Duration', cell: (r) => r.call_duration || '—' },
];

export function PhoneCallLogPage() {
  const { data = [], isLoading, isError, error, refetch } = usePhoneCallLogs();
  const createMutation = useCreatePhoneCallLog();
  const updateMutation = useUpdatePhoneCallLog();
  const deleteMutation = useDeletePhoneCallLog();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<PhoneCallLog | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PhoneCallLog | null>(null);
  const { control, handleSubmit, reset, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      contact: '',
      date: todayIsoDate(),
      follow_up_date: todayIsoDate(),
      call_type: 'Incoming',
      call_duration: '',
      description: '',
      note: '',
    },
  });

  useEffect(() => {
    if (!open) return;
    reset(
      selected
        ? {
            name: selected.name,
            contact: selected.contact,
            date: selected.date || todayIsoDate(),
            follow_up_date: selected.follow_up_date || selected.date || todayIsoDate(),
            call_type: selected.call_type === 'Outgoing' ? 'Outgoing' : 'Incoming',
            call_duration: selected.call_duration || '',
            description: selected.description || '',
            note: selected.note || '',
          }
        : {
            name: '',
            contact: '',
            date: todayIsoDate(),
            follow_up_date: todayIsoDate(),
            call_type: 'Incoming',
            call_duration: '',
            description: '',
            note: '',
          },
    );
  }, [open, selected, reset]);

  const addAction = (
    <PermissionButton
      permission="front_office.phone_calls.create"
      onClick={() => {
        setSelected(null);
        setOpen(true);
      }}
      className="gap-1"
    >
      <Plus className="h-4 w-4" />
      Log call
    </PermissionButton>
  );

  return (
    <>
      <ModuleListPack
        title="Phone Call Log"
        description="Record inbound and outbound calls with follow-up dates."
        actions={addAction}
        isLoading={isLoading}
        loadingMessage="Loading call log..."
        isError={isError}
        error={error}
        onRetry={() => void refetch()}
        isEmpty={!isLoading && !isError && data.length === 0}
        emptyTitle="No phone calls logged"
        emptyDescription="Log the first call to start the front-office call history."
        emptyAction={addAction}
      >
        <DataTable
          data={data}
          columns={columns}
          getRowKey={(r) => r.id}
          actions={(row) => (
            <>
              <PermissionButton
                permission="front_office.phone_calls.edit"
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
                permission="front_office.phone_calls.delete"
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
        title={selected ? 'Edit phone call' : 'Log phone call'}
        onSubmit={handleSubmit((values) => {
          const payload = {
            name: values.name,
            contact: values.contact,
            date: values.date,
            follow_up_date: values.follow_up_date || values.date,
            call_type: values.call_type,
            call_duration: values.call_duration?.trim() || '',
            description: values.description?.trim() || '',
            note: values.note?.trim() || '',
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
        <FormTextField control={control} name="name" label="Name" required />
        <FormTextField control={control} name="contact" label="Contact" required />
        <FormTextField control={control} name="date" label="Date" type="date" required />
        <FormTextField control={control} name="follow_up_date" label="Follow-up date" type="date" />
        <FormSelectField
          control={control}
          name="call_type"
          label="Call type"
          required
          options={[
            { value: 'Incoming', label: 'Incoming' },
            { value: 'Outgoing', label: 'Outgoing' },
          ]}
        />
        <FormTextField control={control} name="call_duration" label="Duration" />
        <FormTextareaField control={control} name="description" label="Description" />
        <FormTextareaField control={control} name="note" label="Note" />
      </EntityFormDialog>
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete phone call?"
        description={`Remove call with ${deleteTarget?.name ?? ''}.`}
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
