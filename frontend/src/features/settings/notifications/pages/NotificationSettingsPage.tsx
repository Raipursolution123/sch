import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormSwitchField, FormTextField, FormTextareaField } from '@components/forms/fields';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { StatusBadge } from '@components/feedback/StatusBadge';
import { Button, Input, Pagination } from '@components/ui';
import {
  useCreateNotificationSetting,
  useDeleteNotificationSetting,
  useNotificationSettings,
  useUpdateNotificationSetting,
} from '@hooks/useSystemConfig';
import type { NotificationSetting } from '@app-types/settings/system-config';
import { ModuleListPack } from '@workflow-packs';

const schema = z.object({
  type: z.string().trim().max(100),
  subject: z.string().trim().min(1, 'Subject is required').max(255),
  template_id: z.string().trim().max(100),
  template: z.string().trim().min(1, 'Template is required'),
  variables: z.string().trim(),
  is_mail: z.boolean(),
  is_sms: z.boolean(),
  is_notification: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

const defaults: FormValues = {
  type: '',
  subject: '',
  template_id: '',
  template: '',
  variables: '',
  is_mail: false,
  is_sms: false,
  is_notification: false,
};

function toForm(row: NotificationSetting): FormValues {
  return {
    type: row.type,
    subject: row.subject,
    template_id: row.template_id,
    template: row.template,
    variables: row.variables,
    is_mail: row.is_mail === '1',
    is_sms: row.is_sms === '1',
    is_notification: Boolean(row.is_notification),
  };
}

function toPayload(values: FormValues) {
  return {
    type: values.type,
    subject: values.subject,
    template_id: values.template_id,
    template: values.template,
    variables: values.variables,
    is_mail: values.is_mail ? '1' : '0',
    is_sms: values.is_sms ? '1' : '0',
    is_notification: values.is_notification ? 1 : 0,
  };
}

export function NotificationSettingsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const { data, isLoading, isError, error, refetch } = useNotificationSettings(page, query);
  const rows = data?.results ?? [];
  const totalCount = data?.count ?? 0;
  const createMutation = useCreateNotificationSetting();
  const updateMutation = useUpdateNotificationSetting();
  const deleteMutation = useDeleteNotificationSetting();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<NotificationSetting | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<NotificationSetting | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: defaults });

  useEffect(() => {
    if (dialogOpen) reset(selected ? toForm(selected) : defaults);
  }, [dialogOpen, selected, reset]);

  const closeDialog = () => {
    setDialogOpen(false);
    setSelected(null);
  };

  const onSubmit = (values: FormValues) => {
    const payload = toPayload(values);
    if (selected) {
      updateMutation.mutate({ id: selected.id, payload }, { onSuccess: closeDialog });
      return;
    }
    createMutation.mutate(payload, { onSuccess: closeDialog });
  };

  const columns: DataTableColumn<NotificationSetting>[] = [
    { id: 'type', header: 'Type', cellClassName: 'font-medium', cell: (r) => r.type || '—' },
    { id: 'subject', header: 'Subject', cell: (r) => r.subject },
    {
      id: 'mail',
      header: 'Mail',
      cell: (r) => <StatusBadge isActive={r.is_mail === '1' ? 'yes' : 'no'} />,
    },
    {
      id: 'sms',
      header: 'SMS',
      cell: (r) => <StatusBadge isActive={r.is_sms === '1' ? 'yes' : 'no'} />,
    },
    {
      id: 'notif',
      header: 'Push',
      cell: (r) => <StatusBadge isActive={r.is_notification ? 'yes' : 'no'} />,
    },
  ];

  const addAction = (
    <PermissionButton
      permission="settings.manage"
      onClick={() => {
        setSelected(null);
        setDialogOpen(true);
      }}
      className="gap-1"
    >
      <Plus className="h-4 w-4" aria-hidden="true" />
      Add Setting
    </PermissionButton>
  );

  return (
    <ModuleListPack
      title="Notifications"
      description="Configure event notification templates and mail/SMS/push channel flags."
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              setPage(1);
              setQuery(search);
            }}
          >
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search type or subject…"
              className="w-56"
            />
            <Button type="submit" variant="secondary">
              Search
            </Button>
          </form>
          {addAction}
        </div>
      }
      isLoading={isLoading}
      loadingMessage="Loading notification settings..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && rows.length === 0}
      emptyTitle="No notification settings"
      emptyDescription="Add templates for admissions, fees, attendance, and other system events."
      emptyAction={addAction}
      footer={
        <>
          <EntityFormDialog
            open={dialogOpen}
            onOpenChange={(open) => {
              if (!open) closeDialog();
              else setDialogOpen(true);
            }}
            isEdit={Boolean(selected)}
            isLoading={createMutation.isPending || updateMutation.isPending}
            title={selected ? 'Edit Notification Setting' : 'Add Notification Setting'}
            description="Toggle delivery channels and edit the message template."
            submitLabel={selected ? 'Save changes' : 'Create setting'}
            onSubmit={handleSubmit(onSubmit)}
            size="lg"
          >
            <FormErrorSummary errors={errors} />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormTextField
                control={control}
                name="type"
                label="Type"
                placeholder="student_admission"
              />
              <FormTextField control={control} name="template_id" label="Template ID" />
            </div>
            <FormTextField control={control} name="subject" label="Subject" required />
            <FormTextareaField
              control={control}
              name="template"
              label="Template"
              rows={5}
              required
            />
            <FormTextField
              control={control}
              name="variables"
              label="Variables"
              hint="Comma-separated placeholders available in the template."
            />
            <div className="grid gap-3 sm:grid-cols-3">
              <FormSwitchField control={control} name="is_mail" label="Send email" />
              <FormSwitchField control={control} name="is_sms" label="Send SMS" />
              <FormSwitchField
                control={control}
                name="is_notification"
                label="In-app notification"
              />
            </div>
          </EntityFormDialog>

          <ConfirmDialog
            open={Boolean(deleteTarget)}
            onOpenChange={(open) => {
              if (!open) setDeleteTarget(null);
            }}
            title="Delete notification setting?"
            description={
              deleteTarget ? `Delete “${deleteTarget.subject}”? This cannot be undone.` : ''
            }
            confirmLabel="Delete"
            destructive
            onConfirm={() => {
              if (!deleteTarget) return;
              deleteMutation.mutate(deleteTarget.id, {
                onSuccess: () => setDeleteTarget(null),
              });
            }}
            isLoading={deleteMutation.isPending}
          />
        </>
      }
    >
      <div className="space-y-4">
        <DataTable
          data={rows}
          columns={columns}
          getRowKey={(row) => row.id}
          actions={(row) => (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelected(row);
                  setDialogOpen(true);
                }}
                aria-label={`Edit ${row.subject}`}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeleteTarget(row)}
                aria-label={`Delete ${row.subject}`}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        />
        <Pagination
          currentPage={page}
          totalPages={Math.max(1, Math.ceil(totalCount / 20))}
          onPageChange={setPage}
        />
      </div>
    </ModuleListPack>
  );
}
