import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageHeader } from '@components/layout/PageHeader';
import { ErrorState } from '@components/feedback/ErrorState';
import { LoadingState } from '@components/feedback/LoadingState';
import { SettingsCard } from '@components/forms/SettingsCard';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormNumberField, FormTextField } from '@components/forms/fields';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { useFileTypes, useUpdateFileTypes } from '@hooks/useAdvancedSettings';
import { getApiErrorMessage } from '@utils/error-message';

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

  if (isLoading) {
    return <LoadingState message="Loading file type settings..." />;
  }

  if (isError || !settings) {
    return (
      <ErrorState
        message={getApiErrorMessage(error, 'Could not load file type settings')}
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="File Types"
        description="Control the allowed file extensions, MIME types, and maximum upload size for documents and images."
      />

      <form onSubmit={handleSubmit((values) => updateMutation.mutate(values))} noValidate>
        <FormErrorSummary errors={errors} className="mb-4" />
        <div className="space-y-6">
          <SettingsCard
            title="Document Uploads"
            description="Allowed file types for general document uploads (certificates, receipts, etc.)."
          >
            <FormTextField
              control={control}
              name="file_extension"
              label="Allowed extensions"
              placeholder="pdf,doc,docx,xls,xlsx"
              hint="Comma-separated list of allowed file extensions, without the leading dot."
              required
            />
            <FormTextField
              control={control}
              name="file_mime"
              label="Allowed MIME types"
              placeholder="application/pdf,application/msword"
              hint="Comma-separated list of allowed MIME types."
              required
            />
            <FormNumberField
              control={control}
              name="file_size"
              label="Maximum file size (KB)"
              min={0}
              required
            />
          </SettingsCard>

          <SettingsCard
            title="Image Uploads"
            description="Allowed file types for image uploads (photos, logos, etc.)."
            footer={
              <PermissionButton
                type="submit"
                permission="settings.manage"
                isLoading={updateMutation.isPending}
                disabled={!isDirty && !updateMutation.isPending}
              >
                Save changes
              </PermissionButton>
            }
          >
            <FormTextField
              control={control}
              name="image_extension"
              label="Allowed extensions"
              placeholder="jpg,jpeg,png,gif"
              hint="Comma-separated list of allowed image extensions, without the leading dot."
              required
            />
            <FormTextField
              control={control}
              name="image_mime"
              label="Allowed MIME types"
              placeholder="image/jpeg,image/png,image/gif"
              hint="Comma-separated list of allowed MIME types."
              required
            />
            <FormNumberField
              control={control}
              name="image_size"
              label="Maximum image size (KB)"
              min={0}
              required
            />
          </SettingsCard>
        </div>
      </form>
    </div>
  );
}
