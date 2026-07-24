import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Pencil, Plus, Trash2, Zap } from 'lucide-react';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormSelectField, FormSwitchField, FormTextField } from '@components/forms/fields';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { StatusBadge } from '@components/feedback/StatusBadge';
import { Button, Pagination } from '@components/ui';
import {
  useActivateEmailConfig,
  useCreateEmailConfig,
  useDeleteEmailConfig,
  useEmailConfigs,
  useUpdateEmailConfig,
} from '@hooks/useSystemConfig';
import type { EmailConfig } from '@app-types/settings/system-config';
import { ModuleListPack } from '@workflow-packs';

const schema = z.object({
  email_type: z.string().trim().min(1, 'Email type is required').max(100),
  smtp_server: z.string().trim().max(100),
  smtp_port: z.string().trim().max(100),
  smtp_username: z.string().trim().max(100),
  smtp_password: z.string().trim().max(100),
  ssl_tls: z.string().trim().max(100),
  smtp_auth: z.string().trim().max(10),
  api_key: z.string().trim().max(255),
  api_secret: z.string().trim().max(255),
  region: z.string().trim().max(255),
  is_active: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

const defaults: FormValues = {
  email_type: 'smtp',
  smtp_server: '',
  smtp_port: '587',
  smtp_username: '',
  smtp_password: '',
  ssl_tls: 'tls',
  smtp_auth: 'true',
  api_key: '',
  api_secret: '',
  region: '',
  is_active: false,
};

function toForm(row: EmailConfig): FormValues {
  return {
    email_type: row.email_type || 'smtp',
    smtp_server: row.smtp_server,
    smtp_port: row.smtp_port,
    smtp_username: row.smtp_username,
    smtp_password: '',
    ssl_tls: row.ssl_tls,
    smtp_auth: row.smtp_auth || 'true',
    api_key: '',
    api_secret: '',
    region: row.region,
    is_active: row.is_active === 'yes',
  };
}

export function EmailSettingsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error, refetch } = useEmailConfigs(page);
  const rows = data?.results ?? [];
  const totalCount = data?.count ?? 0;
  const createMutation = useCreateEmailConfig();
  const updateMutation = useUpdateEmailConfig();
  const activateMutation = useActivateEmailConfig();
  const deleteMutation = useDeleteEmailConfig();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<EmailConfig | null>(null);
  const [activateTarget, setActivateTarget] = useState<EmailConfig | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EmailConfig | null>(null);

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
    const payload = {
      ...values,
      is_active: values.is_active ? 'yes' : 'no',
      smtp_password: values.smtp_password || undefined,
      api_key: values.api_key || undefined,
      api_secret: values.api_secret || undefined,
    };
    if (selected) {
      updateMutation.mutate({ id: selected.id, payload }, { onSuccess: closeDialog });
      return;
    }
    createMutation.mutate(payload, { onSuccess: closeDialog });
  };

  const columns: DataTableColumn<EmailConfig>[] = [
    {
      id: 'type',
      header: 'Type',
      cellClassName: 'font-medium',
      cell: (r) => r.email_type || '—',
    },
    { id: 'server', header: 'SMTP server', cell: (r) => r.smtp_server || '—' },
    { id: 'port', header: 'Port', cell: (r) => r.smtp_port || '—' },
    { id: 'user', header: 'Username', cell: (r) => r.smtp_username || '—' },
    {
      id: 'status',
      header: 'Status',
      cell: (r) => <StatusBadge isActive={r.is_active === 'yes' ? 'yes' : 'no'} />,
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
      Add Email Config
    </PermissionButton>
  );

  return (
    <ModuleListPack
      title="Email Config"
      description="Configure SMTP or API mailers. Only one config can be active."
      actions={addAction}
      isLoading={isLoading}
      loadingMessage="Loading email configs..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && rows.length === 0}
      emptyTitle="No email configs"
      emptyDescription="Add an SMTP or API mailer to enable outbound email from Communicate."
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
            title={selected ? 'Edit Email Config' : 'Add Email Config'}
            description="Leave password/API secrets blank when editing to keep existing values."
            submitLabel={selected ? 'Save changes' : 'Create config'}
            onSubmit={handleSubmit(onSubmit)}
            size="lg"
          >
            <FormErrorSummary errors={errors} />
            <FormSelectField
              control={control}
              name="email_type"
              label="Email type"
              options={[
                { value: 'smtp', label: 'SMTP' },
                { value: 'ses', label: 'Amazon SES' },
                { value: 'sendgrid', label: 'SendGrid' },
                { value: 'mailgun', label: 'Mailgun' },
              ]}
              required
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormTextField control={control} name="smtp_server" label="SMTP server" />
              <FormTextField control={control} name="smtp_port" label="SMTP port" />
              <FormTextField control={control} name="smtp_username" label="SMTP username" />
              <FormTextField
                control={control}
                name="smtp_password"
                label="SMTP password"
                type="password"
                hint={selected ? 'Leave blank to keep current password' : undefined}
              />
              <FormSelectField
                control={control}
                name="ssl_tls"
                label="Encryption"
                options={[
                  { value: 'tls', label: 'TLS' },
                  { value: 'ssl', label: 'SSL' },
                  { value: 'none', label: 'None' },
                ]}
              />
              <FormSelectField
                control={control}
                name="smtp_auth"
                label="SMTP auth"
                options={[
                  { value: 'true', label: 'Enabled' },
                  { value: 'false', label: 'Disabled' },
                ]}
              />
              <FormTextField
                control={control}
                name="api_key"
                label="API key"
                hint={selected ? 'Leave blank to keep current key' : undefined}
              />
              <FormTextField
                control={control}
                name="api_secret"
                label="API secret"
                type="password"
                hint={selected ? 'Leave blank to keep current secret' : undefined}
              />
              <FormTextField control={control} name="region" label="Region" />
            </div>
            <FormSwitchField
              control={control}
              name="is_active"
              label="Set as active mailer"
              hint="Activating this will disable other email configs."
            />
          </EntityFormDialog>

          <ConfirmDialog
            open={Boolean(activateTarget)}
            onOpenChange={(open) => {
              if (!open) setActivateTarget(null);
            }}
            title="Activate email config?"
            description={
              activateTarget
                ? `Set ${activateTarget.email_type || 'this'} config as the active mailer?`
                : ''
            }
            confirmLabel="Activate"
            onConfirm={() => {
              if (!activateTarget) return;
              activateMutation.mutate(activateTarget.id, {
                onSuccess: () => setActivateTarget(null),
              });
            }}
            isLoading={activateMutation.isPending}
          />

          <ConfirmDialog
            open={Boolean(deleteTarget)}
            onOpenChange={(open) => {
              if (!open) setDeleteTarget(null);
            }}
            title="Delete email config?"
            description={
              deleteTarget ? `Permanently delete ${deleteTarget.email_type || 'this'} config?` : ''
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
          actions={(row) => {
            const isActive = row.is_active === 'yes';
            return (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelected(row);
                    setDialogOpen(true);
                  }}
                  aria-label={`Edit ${row.email_type}`}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isActive}
                  onClick={() => setActivateTarget(row)}
                  aria-label={`Activate ${row.email_type}`}
                >
                  <Zap className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isActive}
                  onClick={() => setDeleteTarget(row)}
                  aria-label={`Delete ${row.email_type}`}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            );
          }}
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
