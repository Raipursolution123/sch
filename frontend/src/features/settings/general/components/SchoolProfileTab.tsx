import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormSection } from '@components/forms/FormSection';
import { FormTextField, FormTextareaField } from '@components/forms/fields';
import { SettingsCard } from '@components/forms/SettingsCard';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { useUnsavedChangesWarning } from '@hooks/useUnsavedChangesWarning';
import {
  schoolProfileSchema,
  type SchoolProfileFormValues,
} from '@features/settings/general/schemas/general-settings.schema';
import type { GeneralSettings, SchoolProfilePayload } from '@app-types/settings/general';

interface SchoolProfileTabProps {
  settings: GeneralSettings;
  onSave: (payload: SchoolProfilePayload) => void;
  isSaving: boolean;
}

export function SchoolProfileTab({ settings, onSave, isSaving }: SchoolProfileTabProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<SchoolProfileFormValues>({
    resolver: zodResolver(schoolProfileSchema),
    defaultValues: {
      name: settings.name,
      email: settings.email,
      phone: settings.phone,
      address: settings.address,
      dise_code: settings.dise_code,
    },
  });

  const { navigationGuard } = useUnsavedChangesWarning(isDirty);

  useEffect(() => {
    reset({
      name: settings.name,
      email: settings.email,
      phone: settings.phone,
      address: settings.address,
      dise_code: settings.dise_code,
    });
  }, [settings, reset]);

  return (
    <>
      {navigationGuard}
      <form onSubmit={handleSubmit(onSave)} noValidate>
        <SettingsCard
          title="School Profile"
          description="Basic school identity and contact information shown across the ERP."
          footer={
            <PermissionButton
              type="submit"
              permission="general_settings.edit"
              isLoading={isSaving}
              disabled={!isDirty && !isSaving}
            >
              Save changes
            </PermissionButton>
          }
        >
          <FormErrorSummary errors={errors} className="mb-2" />

          <FormSection title="Identity" description="Official school name and registration codes.">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormTextField control={control} name="name" label="School name" required />
              <FormTextField
                control={control}
                name="dise_code"
                label="DISE code"
                placeholder="UDISE+ code"
                optional
              />
            </div>
          </FormSection>

          <FormSection title="Contact" description="Primary contact details for communications.">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormTextField
                control={control}
                name="email"
                label="Email"
                type="email"
                autoComplete="email"
                required
              />
              <FormTextField
                control={control}
                name="phone"
                label="Phone"
                type="tel"
                autoComplete="tel"
                optional
              />
            </div>
            <FormTextareaField control={control} name="address" label="Address" rows={3} optional />
          </FormSection>
        </SettingsCard>
      </form>
    </>
  );
}
