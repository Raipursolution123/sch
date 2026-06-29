import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Textarea } from '@components/ui/textarea';
import { FormField } from '@components/forms/FormField';
import { SettingsCard } from '@components/forms/SettingsCard';
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
    register,
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
    <form onSubmit={handleSubmit(onSave)} noValidate>
      <SettingsCard
        title="School Profile"
        description="Basic school identity and contact information shown across the ERP."
        footer={
          <Button type="submit" isLoading={isSaving} disabled={!isDirty && !isSaving}>
            Save changes
          </Button>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="School name" htmlFor="name" error={errors.name?.message} required>
            <Input id="name" {...register('name')} aria-required="true" />
          </FormField>
          <FormField label="DISE code" htmlFor="dise_code" error={errors.dise_code?.message}>
            <Input id="dise_code" {...register('dise_code')} placeholder="UDISE+ code" />
          </FormField>
          <FormField label="Email" htmlFor="email" error={errors.email?.message} required>
            <Input id="email" type="email" autoComplete="email" {...register('email')} />
          </FormField>
          <FormField label="Phone" htmlFor="phone" error={errors.phone?.message}>
            <Input id="phone" type="tel" autoComplete="tel" {...register('phone')} />
          </FormField>
        </div>
        <FormField label="Address" htmlFor="address" error={errors.address?.message}>
          <Textarea id="address" rows={3} {...register('address')} />
        </FormField>
      </SettingsCard>
    </form>
  );
}
