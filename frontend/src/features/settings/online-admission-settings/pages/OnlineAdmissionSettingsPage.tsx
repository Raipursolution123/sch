import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus } from 'lucide-react';
import { PageHeader } from '@components/layout/PageHeader';
import { ErrorState } from '@components/feedback/ErrorState';
import { LoadingState } from '@components/feedback/LoadingState';
import { SettingsCard } from '@components/forms/SettingsCard';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormSwitchField, FormTextField, FormTextareaField } from '@components/forms/fields';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { Switch } from '@components/ui/switch';
import { usePermissions } from '@hooks/usePermissions';
import {
  useCreateOnlineAdmissionField,
  useOnlineAdmissionFields,
  useOnlineAdmissionSettings,
  useUpdateOnlineAdmissionField,
  useUpdateOnlineAdmissionSettings,
} from '@hooks/useAdvancedSettings';
import type { OnlineAdmissionField } from '@app-types/settings/advanced-settings';
import { getApiErrorMessage } from '@utils/error-message';
import { formatDate } from '@utils/format';

const settingsSchema = z.object({
  online_admission: z.boolean(),
  online_admission_payment: z.boolean(),
  online_admission_amount: z.string().trim(),
  online_admission_instruction: z.string().trim(),
  online_admission_conditions: z.string().trim(),
  online_admission_application_form: z.string().trim(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

const fieldSchema = z.object({
  name: z.string().trim().min(1, 'Field name is required').max(100),
});

type FieldFormValues = z.infer<typeof fieldSchema>;

export function OnlineAdmissionSettingsPage() {
  const { data: settings, isLoading, isError, error, refetch } = useOnlineAdmissionSettings();
  const updateSettingsMutation = useUpdateOnlineAdmissionSettings();

  const [fieldsPage, setFieldsPage] = useState(1);
  const { data: fieldsData, isLoading: fieldsLoading } = useOnlineAdmissionFields(fieldsPage);
  const fields = fieldsData?.results ?? [];
  const fieldsCount = fieldsData?.count ?? 0;
  const createFieldMutation = useCreateOnlineAdmissionField();
  const updateFieldMutation = useUpdateOnlineAdmissionField();
  const [addFieldOpen, setAddFieldOpen] = useState(false);
  const { can } = usePermissions();
  const canManage = can('settings.manage');

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      online_admission: false,
      online_admission_payment: false,
      online_admission_amount: '',
      online_admission_instruction: '',
      online_admission_conditions: '',
      online_admission_application_form: '',
    },
  });

  useEffect(() => {
    if (settings) {
      reset({
        online_admission: settings.online_admission,
        online_admission_payment: settings.online_admission_payment === '1',
        online_admission_amount: settings.online_admission_amount,
        online_admission_instruction: settings.online_admission_instruction,
        online_admission_conditions: settings.online_admission_conditions,
        online_admission_application_form: settings.online_admission_application_form,
      });
    }
  }, [settings, reset]);

  const {
    control: fieldControl,
    handleSubmit: handleFieldSubmit,
    reset: resetFieldForm,
    formState: { errors: fieldErrors },
  } = useForm<FieldFormValues>({ resolver: zodResolver(fieldSchema), defaultValues: { name: '' } });

  const onSaveSettings = (values: SettingsFormValues) => {
    updateSettingsMutation.mutate({
      online_admission: values.online_admission,
      online_admission_payment: values.online_admission_payment ? '1' : '0',
      online_admission_amount: values.online_admission_amount,
      online_admission_instruction: values.online_admission_instruction,
      online_admission_conditions: values.online_admission_conditions,
      online_admission_application_form: values.online_admission_application_form,
    });
  };

  const onAddField = (values: FieldFormValues) => {
    createFieldMutation.mutate(
      { name: values.name, status: true },
      {
        onSuccess: () => {
          setAddFieldOpen(false);
          resetFieldForm({ name: '' });
        },
      },
    );
  };

  const fieldColumns: DataTableColumn<OnlineAdmissionField>[] = [
    { id: 'name', header: 'Field Name', cellClassName: 'font-medium', cell: (r) => r.name },
    {
      id: 'status',
      header: 'Status',
      cell: (r) => (
        <div className="flex items-center gap-2">
          <Switch
            checked={r.status}
            disabled={!canManage}
            aria-label={`Toggle ${r.name}`}
            onCheckedChange={(checked) =>
              updateFieldMutation.mutate({ id: r.id, payload: { status: checked } })
            }
          />
          <span className="text-sm text-muted-foreground">{r.status ? 'Enabled' : 'Disabled'}</span>
        </div>
      ),
    },
    {
      id: 'created',
      header: 'Created',
      cellClassName: 'text-muted-foreground',
      cell: (r) => formatDate(r.created_at),
    },
  ];

  if (isLoading) {
    return <LoadingState message="Loading online admission settings..." />;
  }

  if (isError || !settings) {
    return (
      <ErrorState
        message={getApiErrorMessage(error, 'Could not load online admission settings')}
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Online Admission Settings"
        description="Configure the public online admission form, application fee, and visible form fields."
      />

      <form onSubmit={handleSubmit(onSaveSettings)} noValidate>
        <SettingsCard
          title="Admission Form"
          description="Enable public applications and configure the fee and instructions shown to applicants."
          footer={
            <PermissionButton
              type="submit"
              permission="settings.manage"
              isLoading={updateSettingsMutation.isPending}
              disabled={!isDirty && !updateSettingsMutation.isPending}
            >
              Save changes
            </PermissionButton>
          }
        >
          <FormErrorSummary errors={errors} />
          <div className="grid gap-3 sm:grid-cols-2">
            <FormSwitchField
              control={control}
              name="online_admission"
              label="Enable online admission"
            />
            <FormSwitchField
              control={control}
              name="online_admission_payment"
              label="Require application fee payment"
            />
          </div>
          <FormTextField
            control={control}
            name="online_admission_amount"
            label="Application fee amount"
            placeholder="500"
            optional
          />
          <FormTextareaField
            control={control}
            name="online_admission_instruction"
            label="Instructions"
            rows={3}
            hint="Shown to applicants above the online admission form."
          />
          <FormTextareaField
            control={control}
            name="online_admission_conditions"
            label="Terms & conditions"
            rows={3}
          />
          <FormTextareaField
            control={control}
            name="online_admission_application_form"
            label="Application form note"
            rows={2}
            hint="Optional note or link shown alongside the downloadable application form."
          />
        </SettingsCard>
      </form>

      <SettingsCard
        title="Application Fields"
        description="Control which fields appear on the public online admission form."
        action={
          <PermissionButton
            permission="settings.manage"
            size="sm"
            className="gap-1"
            onClick={() => setAddFieldOpen(true)}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Field
          </PermissionButton>
        }
      >
        <DataTable
          data={fields}
          columns={fieldColumns}
          getRowKey={(row) => row.id}
          isLoading={fieldsLoading}
          pagination={{
            page: fieldsPage,
            totalCount: fieldsCount,
            pageSize: 20,
            onPageChange: setFieldsPage,
          }}
          emptyMessage="No application fields configured yet."
        />
      </SettingsCard>

      <EntityFormDialog
        open={addFieldOpen}
        onOpenChange={(open) => {
          setAddFieldOpen(open);
          if (!open) resetFieldForm({ name: '' });
        }}
        title="Add Application Field"
        description="Add a new field to the public online admission form."
        submitLabel="Add field"
        isLoading={createFieldMutation.isPending}
        onSubmit={handleFieldSubmit(onAddField)}
      >
        <FormErrorSummary errors={fieldErrors} />
        <FormTextField control={fieldControl} name="name" label="Field name" required />
      </EntityFormDialog>
    </div>
  );
}
