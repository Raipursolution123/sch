import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Switch } from '@components/ui/switch';
import { FormField } from '@components/forms/FormField';
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
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
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

  const isRtl = watch('is_rtl');
  const isActive = watch('is_active');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Edit Language' : 'Add Language'}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? 'Update locale details. Short and country codes identify the language pack.'
                : 'Add a language for UI translation and regional formatting.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <FormField
              label="Language name"
              htmlFor="language"
              error={errors.language?.message}
              required
            >
              <Input
                id="language"
                placeholder="English"
                {...register('language')}
                aria-invalid={Boolean(errors.language)}
              />
            </FormField>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                label="Short code"
                htmlFor="short_code"
                error={errors.short_code?.message}
                required
              >
                <Input
                  id="short_code"
                  placeholder="en"
                  {...register('short_code')}
                  aria-invalid={Boolean(errors.short_code)}
                />
              </FormField>
              <FormField
                label="Country code"
                htmlFor="country_code"
                error={errors.country_code?.message}
                required
              >
                <Input
                  id="country_code"
                  placeholder="us"
                  {...register('country_code')}
                  aria-invalid={Boolean(errors.country_code)}
                />
              </FormField>
            </div>

            <FormField
              label="Right-to-left (RTL)"
              hint="Enable for languages such as Arabic or Hebrew."
            >
              <div className="flex items-center gap-2 pt-1">
                <Switch
                  id="is_rtl"
                  checked={isRtl}
                  onCheckedChange={(checked) => setValue('is_rtl', checked, { shouldDirty: true })}
                />
                <span className="text-sm text-muted-foreground">{isRtl ? 'Yes' : 'No'}</span>
              </div>
            </FormField>

            <FormField label="Active" hint="Active languages are available across the application.">
              <div className="flex items-center gap-2 pt-1">
                <Switch
                  id="is_active"
                  checked={isActive}
                  onCheckedChange={(checked) =>
                    setValue('is_active', checked, { shouldDirty: true })
                  }
                />
                <span className="text-sm text-muted-foreground">{isActive ? 'Yes' : 'No'}</span>
              </div>
            </FormField>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading}>
              {isEdit ? 'Save changes' : 'Create language'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
