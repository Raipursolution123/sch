import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormFileField, FormTextField } from '@components/forms/fields';

type UploadFormValues = {
  documentName?: string;
  file: File | null;
};

interface StaffDocumentUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentType: string;
  documentLabel: string;
  onSubmit: (file: File, name?: string) => void;
  isLoading?: boolean;
}

export function StaffDocumentUploadDialog({
  open,
  onOpenChange,
  documentType,
  documentLabel,
  onSubmit,
  isLoading,
}: StaffDocumentUploadDialogProps) {
  const needsDocumentName = documentType === 'other_document_file';

  const uploadSchema = useMemo(
    () =>
      z
        .object({
          documentName: z.string().optional(),
          file: z
            .custom<File | null>((value) => value === null || value instanceof File)
            .refine((value) => value instanceof File, 'Select a file'),
        })
        .superRefine((data, ctx) => {
          if (needsDocumentName && !data.documentName?.trim()) {
            ctx.addIssue({
              code: 'custom',
              message: 'Enter document name',
              path: ['documentName'],
            });
          }
        }),
    [needsDocumentName],
  );

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UploadFormValues>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      documentName: '',
      file: null,
    },
  });

  useEffect(() => {
    if (!open) return;
    reset({ documentName: '', file: null });
  }, [open, reset]);

  const handleFormSubmit = (values: UploadFormValues) => {
    if (!(values.file instanceof File)) return;
    if (needsDocumentName && !values.documentName?.trim()) return;

    onSubmit(
      values.file,
      needsDocumentName ? values.documentName?.trim() : undefined,
    );
  };

  return (
    <EntityFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Upload ${documentLabel}`}
      description="Attach a document to this staff member's profile."
      submitLabel="Upload"
      isLoading={isLoading}
      onSubmit={handleSubmit(handleFormSubmit)}
    >
      <FormErrorSummary errors={errors} />

      {needsDocumentName && (
        <FormTextField
          control={control}
          name="documentName"
          label="Document name"
          placeholder="e.g. Identity Proof"
          required
        />
      )}

      <FormFileField
        control={control}
        name="file"
        label="Select file"
        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
        hint="Maximum file size: 5MB. Supported formats: PDF, JPG, PNG, DOCX."
        required
      />
    </EntityFormDialog>
  );
}
