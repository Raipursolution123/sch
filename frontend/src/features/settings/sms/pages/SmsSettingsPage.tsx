import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Pencil, Plus, Trash2, Zap } from 'lucide-react';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormSwitchField, FormTextField } from '@components/forms/fields';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { StatusBadge } from '@components/feedback/StatusBadge';
import { Button, Pagination } from '@components/ui';
import {
  useActivateSmsConfig,
  useCreateSmsConfig,
  useDeleteSmsConfig,
  useSmsConfigs,
  useUpdateSmsConfig,
} from '@hooks/useSystemConfig';
import type { SmsConfig } from '@app-types/settings/system-config';
import { ModuleListPack } from '@workflow-packs';

const schema = z.object({
  type: z.string().trim().min(1, 'Provider type is required').max(50),
  name: z.string().trim().min(1, 'Name is required').max(100),
  api_id: z.string().trim().max(100),
  authkey: z.string().trim().max(100),
  senderid: z.string().trim().max(100),
  contact: z.string().trim(),
  username: z.string().trim().max(150),
  url: z.string().trim().max(150),
  password: z.string().trim().max(150),
  is_active: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

const defaults: FormValues = {
  type: '',
  name: '',
  api_id: '',
  authkey: '',
  senderid: '',
  contact: '',
  username: '',
  url: '',
  password: '',
  is_active: false,
};

function toForm(row: SmsConfig): FormValues {
  return {
    type: row.type,
    name: row.name,
    api_id: row.api_id,
    authkey: '',
    senderid: row.senderid,
    contact: row.contact,
    username: row.username,
    url: row.url,
    password: '',
    is_active: row.is_active === 'enabled',
  };
}

export function SmsSettingsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error, refetch } = useSmsConfigs(page);
  const rows = data?.results ?? [];
  const totalCount = data?.count ?? 0;
  const createMutation = useCreateSmsConfig();
  const updateMutation = useUpdateSmsConfig();
  const activateMutation = useActivateSmsConfig();
  const deleteMutation = useDeleteSmsConfig();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<SmsConfig | null>(null);
  const [activateTarget, setActivateTarget] = useState<SmsConfig | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SmsConfig | null>(null);

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
      is_active: values.is_active ? 'enabled' : 'disabled',
      authkey: values.authkey || undefined,
      password: values.password || undefined,
    };
    if (selected) {
      updateMutation.mutate({ id: selected.id, payload }, { onSuccess: closeDialog });
      return;
    }
    createMutation.mutate(payload, { onSuccess: closeDialog });
  };

  const columns: DataTableColumn<SmsConfig>[] = [
    { id: 'name', header: 'Name', cellClassName: 'font-medium', cell: (r) => r.name },
    { id: 'type', header: 'Provider', cell: (r) => r.type },
    { id: 'sender', header: 'Sender ID', cell: (r) => r.senderid || '—' },
    {
      id: 'status',
      header: 'Status',
      cell: (r) => <StatusBadge isActive={r.is_active === 'enabled' ? 'yes' : 'no'} />,
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
      Add SMS Provider
    </PermissionButton>
  );

  return (
    <ModuleListPack
      title="SMS Config"
      description="Configure SMS gateway providers. Only one provider can be active."
      actions={addAction}
      isLoading={isLoading}
      loadingMessage="Loading SMS configs..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && rows.length === 0}
      emptyTitle="No SMS providers"
      emptyDescription="Add an SMS gateway to enable outbound SMS from Communicate."
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
            title={selected ? 'Edit SMS Config' : 'Add SMS Config'}
            description="Leave secret fields blank when editing to keep existing values."
            submitLabel={selected ? 'Save changes' : 'Create config'}
            onSubmit={handleSubmit(onSubmit)}
            size="lg"
          >
            <FormErrorSummary errors={errors} />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormTextField control={control} name="name" label="Name" required />
              <FormTextField control={control} name="type" label="Provider type" required />
              <FormTextField control={control} name="api_id" label="API ID" />
              <FormTextField control={control} name="senderid" label="Sender ID" />
              <FormTextField
                control={control}
                name="authkey"
                label="Auth key"
                hint={selected ? 'Leave blank to keep current key' : undefined}
              />
              <FormTextField
                control={control}
                name="password"
                label="Password"
                type="password"
                hint={selected ? 'Leave blank to keep current password' : undefined}
              />
              <FormTextField control={control} name="username" label="Username" />
              <FormTextField control={control} name="url" label="API URL" />
            </div>
            <FormTextField control={control} name="contact" label="Contact / notes" />
            <FormSwitchField
              control={control}
              name="is_active"
              label="Set as active provider"
              hint="Activating this will disable other SMS providers."
            />
          </EntityFormDialog>

          <ConfirmDialog
            open={Boolean(activateTarget)}
            onOpenChange={(open) => {
              if (!open) setActivateTarget(null);
            }}
            title="Activate SMS provider?"
            description={
              activateTarget ? `Set ${activateTarget.name} as the active SMS gateway?` : ''
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
            title="Delete SMS config?"
            description={deleteTarget ? `Permanently delete ${deleteTarget.name}?` : ''}
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
            const isActive = row.is_active === 'enabled';
            return (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelected(row);
                    setDialogOpen(true);
                  }}
                  aria-label={`Edit ${row.name}`}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isActive}
                  onClick={() => setActivateTarget(row)}
                  aria-label={`Activate ${row.name}`}
                >
                  <Zap className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isActive}
                  onClick={() => setDeleteTarget(row)}
                  aria-label={`Delete ${row.name}`}
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
