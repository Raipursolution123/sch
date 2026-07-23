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
  useActivatePaymentMethod,
  useCreatePaymentMethod,
  useDeletePaymentMethod,
  usePaymentMethods,
  useUpdatePaymentMethod,
} from '@hooks/useSystemConfig';
import type { PaymentMethod } from '@app-types/settings/system-config';
import { ModuleListPack } from '@workflow-packs';

const schema = z.object({
  payment_type: z.string().trim().min(1, 'Payment type is required').max(200),
  api_username: z.string().trim().max(200),
  api_secret_key: z.string().trim().max(200),
  salt: z.string().trim().max(200),
  api_publishable_key: z.string().trim().max(200),
  api_password: z.string().trim().max(200),
  api_signature: z.string().trim().max(200),
  api_email: z.string().trim().max(200),
  paypal_demo: z.string().trim().max(100),
  account_no: z.string().trim().max(200),
  gateway_mode: z.enum(['0', '1']),
  paytm_website: z.string().trim().max(255),
  paytm_industrytype: z.string().trim().max(255),
  is_active: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

const defaults: FormValues = {
  payment_type: '',
  api_username: '',
  api_secret_key: '',
  salt: '',
  api_publishable_key: '',
  api_password: '',
  api_signature: '',
  api_email: '',
  paypal_demo: '',
  account_no: '',
  gateway_mode: '0',
  paytm_website: '',
  paytm_industrytype: '',
  is_active: false,
};

function toForm(row: PaymentMethod): FormValues {
  return {
    payment_type: row.payment_type,
    api_username: row.api_username,
    api_secret_key: '',
    salt: '',
    api_publishable_key: row.api_publishable_key,
    api_password: '',
    api_signature: '',
    api_email: row.api_email,
    paypal_demo: row.paypal_demo,
    account_no: row.account_no,
    gateway_mode: row.gateway_mode === 1 ? '1' : '0',
    paytm_website: row.paytm_website,
    paytm_industrytype: row.paytm_industrytype,
    is_active: row.is_active === 'yes',
  };
}

export function PaymentMethodsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error, refetch } = usePaymentMethods(page);
  const rows = data?.results ?? [];
  const totalCount = data?.count ?? 0;
  const createMutation = useCreatePaymentMethod();
  const updateMutation = useUpdatePaymentMethod();
  const activateMutation = useActivatePaymentMethod();
  const deleteMutation = useDeletePaymentMethod();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<PaymentMethod | null>(null);
  const [activateTarget, setActivateTarget] = useState<PaymentMethod | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PaymentMethod | null>(null);

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
      payment_type: values.payment_type,
      api_username: values.api_username,
      api_publishable_key: values.api_publishable_key,
      api_email: values.api_email,
      paypal_demo: values.paypal_demo,
      account_no: values.account_no,
      gateway_mode: Number(values.gateway_mode),
      paytm_website: values.paytm_website,
      paytm_industrytype: values.paytm_industrytype,
      is_active: values.is_active ? 'yes' : 'no',
      api_secret_key: values.api_secret_key || undefined,
      salt: values.salt || undefined,
      api_password: values.api_password || undefined,
      api_signature: values.api_signature || undefined,
    };
    if (selected) {
      updateMutation.mutate({ id: selected.id, payload }, { onSuccess: closeDialog });
      return;
    }
    createMutation.mutate(payload, { onSuccess: closeDialog });
  };

  const columns: DataTableColumn<PaymentMethod>[] = [
    {
      id: 'type',
      header: 'Gateway',
      cellClassName: 'font-medium',
      cell: (r) => r.payment_type,
    },
    { id: 'account', header: 'Account', cell: (r) => r.account_no || '—' },
    {
      id: 'mode',
      header: 'Mode',
      cell: (r) => (r.gateway_mode === 1 ? 'Live' : 'Test'),
    },
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
      Add Payment Method
    </PermissionButton>
  );

  return (
    <ModuleListPack
      title="Payment Methods"
      description="Manage online payment gateways. Secrets are masked; leave blank when editing to keep values."
      actions={addAction}
      isLoading={isLoading}
      loadingMessage="Loading payment methods..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && rows.length === 0}
      emptyTitle="No payment methods"
      emptyDescription="Add Razorpay, PayU, Paytm, or other gateway credentials."
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
            title={selected ? 'Edit Payment Method' : 'Add Payment Method'}
            description="Configure gateway credentials. Only one method can be active."
            submitLabel={selected ? 'Save changes' : 'Create method'}
            onSubmit={handleSubmit(onSubmit)}
            size="lg"
          >
            <FormErrorSummary errors={errors} />
            <FormTextField control={control} name="payment_type" label="Gateway type" required />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormTextField control={control} name="api_username" label="API username" />
              <FormTextField control={control} name="api_email" label="API email" />
              <FormTextField
                control={control}
                name="api_secret_key"
                label="API secret key"
                type="password"
                hint={selected ? 'Leave blank to keep current secret' : undefined}
              />
              <FormTextField
                control={control}
                name="salt"
                label="Salt"
                type="password"
                hint={selected ? 'Leave blank to keep current salt' : undefined}
              />
              <FormTextField control={control} name="api_publishable_key" label="Publishable key" />
              <FormTextField
                control={control}
                name="api_password"
                label="API password"
                type="password"
                hint={selected ? 'Leave blank to keep current password' : undefined}
              />
              <FormTextField
                control={control}
                name="api_signature"
                label="API signature"
                type="password"
                hint={selected ? 'Leave blank to keep current signature' : undefined}
              />
              <FormTextField control={control} name="account_no" label="Account number" />
              <FormTextField control={control} name="paypal_demo" label="PayPal demo flag" />
              <FormSelectField
                control={control}
                name="gateway_mode"
                label="Gateway mode"
                options={[
                  { value: '0', label: 'Test' },
                  { value: '1', label: 'Live' },
                ]}
              />
              <FormTextField control={control} name="paytm_website" label="Paytm website" />
              <FormTextField
                control={control}
                name="paytm_industrytype"
                label="Paytm industry type"
              />
            </div>
            <FormSwitchField
              control={control}
              name="is_active"
              label="Set as active gateway"
              hint="Activating this will disable other payment methods."
            />
          </EntityFormDialog>

          <ConfirmDialog
            open={Boolean(activateTarget)}
            onOpenChange={(open) => {
              if (!open) setActivateTarget(null);
            }}
            title="Activate payment method?"
            description={
              activateTarget ? `Set ${activateTarget.payment_type} as the active gateway?` : ''
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
            title="Delete payment method?"
            description={deleteTarget ? `Permanently delete ${deleteTarget.payment_type}?` : ''}
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
                  aria-label={`Edit ${row.payment_type}`}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isActive}
                  onClick={() => setActivateTarget(row)}
                  aria-label={`Activate ${row.payment_type}`}
                >
                  <Zap className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isActive}
                  onClick={() => setDeleteTarget(row)}
                  aria-label={`Delete ${row.payment_type}`}
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
