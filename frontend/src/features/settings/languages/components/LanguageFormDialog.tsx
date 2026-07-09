import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormSwitchField, FormTextField } from '@components/forms/fields';
import type { Language } from '@app-types/settings/language';
import {
  languageFormSchema,
  type LanguageFormValues,
} from '@features/settings/languages/schemas/language.schema';

interface LanguageFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  language?: Language | null;
  onSubmit: (values: LanguageFormValues) => void;
  isLoading?: boolean;
}

const defaultValues: LanguageFormValues = {
  language: '',
  short_code: '',
  country_code: '',
  is_rtl: false,
  is_active: false,
};

function toFormValues(language: Language): LanguageFormValues {
  return {
    language: language.language,
    short_code: language.short_code,
    country_code: language.country_code,
    is_rtl: language.is_rtl,
    is_active: language.is_active === 'yes',
  };
}

export function LanguageFormDialog({
  open,
  onOpenChange,
  language,
  onSubmit,
  isLoading,
}: LanguageFormDialogProps) {
  const isEdit = Boolean(language);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LanguageFormValues>({
    resolver: zodResolver(languageFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (open) {
      reset(language ? toFormValues(language) : defaultValues);
    }
  }, [open, language, reset]);

  return (
    <EntityFormDialog
      open={open}
      onOpenChange={onOpenChange}
      isEdit={isEdit}
      isLoading={isLoading}
      title={isEdit ? 'Edit Language' : 'Add Language'}
      description={
        isEdit
          ? 'Update locale details. Short and country codes identify the language pack.'
          : 'Add a language for UI translation and regional formatting.'
      }
      submitLabel={isEdit ? 'Save changes' : 'Create language'}
      onSubmit={handleSubmit(onSubmit)}
      size="sm"
    >
      <FormErrorSummary errors={errors} />
      <FormTextField
        control={control}
        name="language"
        label="Language name"
        placeholder="English"
        required
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormTextField
          control={control}
          name="short_code"
          label="Short code"
          placeholder="en"
          required
        />
        <FormTextField
          control={control}
          name="country_code"
          label="Country code"
          placeholder="us"
          required
        />
      </div>
      <FormSwitchField
        control={control}
        name="is_rtl"
        label="Right-to-left (RTL)"
        hint="Enable for languages such as Arabic or Hebrew."
      />
      <FormSwitchField
        control={control}
        name="is_active"
        label="Active"
        hint="Active languages are available across the application."
      />
    </EntityFormDialog>
  );
}
