import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SettingsCard } from '@components/forms/SettingsCard';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormNumberField, FormTextField } from '@components/forms/fields';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { useFileTypes, useUpdateFileTypes } from '@hooks/useAdvancedSettings';
import { ModuleSettingsPack } from '@workflow-packs';

const schema = z.object({
  file_extension: z.string().trim().min(1, 'At least one extension is required'),
  file_mime: z.string().trim().min(1, 'At least one MIME type is required'),
  file_size: z.number({ error: 'File size is required' }).int().min(0),
  image_extension: z.string().trim().min(1, 'At least one extension is required'),
  image_mime: z.string().trim().min(1, 'At least one MIME type is required'),
  image_size: z.number({ error: 'Image size is required' }).int().min(0),
});

type FormValues = z.infer<typeof schema>;

export function FileTypesPage() {
  const { data: settings, isLoading, isError, error, refetch } = useFileTypes();
  const updateMutation = useUpdateFileTypes();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      file_extension: '',
      file_mime: '',
      file_size: 0,
      image_extension: '',
      image_mime: '',
      image_size: 0,
    },
  });

  useEffect(() => {
    if (settings) reset(settings);
  }, [settings, reset]);

  return (
    <ModuleSettingsPack
      title="File Types"
      description="Control allowed extensions, MIME types, and maximum upload size for documents and images."
      isLoading={isLoading}
      loadingMessage="Loading file type settings..."
      isError={isError || !settings}
      error={error}
      onRetry={() => void refetch()}
    >
      <form
        className="space-y-4"
        onSubmit={handleSubmit((values) => updateMutation.mutate(values))}
        noValidate
      >
        <FormErrorSummary errors={errors} />
        <SettingsCard
          title="Document uploads"
          description="Allowed types for certificates, receipts, and other documents."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <FormTextField
              control={control}
              name="file_extension"
              label="Allowed extensions"
              placeholder="pdf,doc,docx,xls,xlsx"
              hint="Comma-separated, without the leading dot."
              required
            />
            <FormTextField
              control={control}
              name="file_mime"
              label="Allowed MIME types"
              placeholder="application/pdf,application/msword"
              hint="Comma-separated MIME types."
              required
            />
            <FormNumberField
              control={control}
              name="file_size"
              label="Maximum file size (KB)"
              min={0}
              required
            />
          </div>
        </SettingsCard>

        <SettingsCard
          title="Image uploads"
          description="Allowed types for photos, logos, and other images."
          footer={
            <PermissionButton
              type="submit"
              permission="settings.manage"
              className="min-h-11"
              isLoading={updateMutation.isPending}
              disabled={!isDirty && !updateMutation.isPending}
            >
              Save changes
            </PermissionButton>
          }
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <FormTextField
              control={control}
              name="image_extension"
              label="Allowed extensions"
              placeholder="jpg,jpeg,png,gif"
              hint="Comma-separated, without the leading dot."
              required
            />
            <FormTextField
              control={control}
              name="image_mime"
              label="Allowed MIME types"
              placeholder="image/jpeg,image/png,image/gif"
              hint="Comma-separated MIME types."
              required
            />
            <FormNumberField
              control={control}
              name="image_size"
              label="Maximum image size (KB)"
              min={0}
              required
            />
          </div>
        </SettingsCard>
      </form>
    </ModuleSettingsPack>
  );
}
