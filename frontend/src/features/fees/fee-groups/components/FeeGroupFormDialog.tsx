import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormSwitchField, FormTextField, FormTextareaField } from '@components/forms/fields';
import type { FeeGroup } from '@app-types/fees/fee-group';
import {
  feeGroupFormSchema,
  type FeeGroupFormValues,
} from '@features/fees/fee-groups/schemas/fee-group.schema';

interface FeeGroupFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feeGroup?: FeeGroup | null;
  onSubmit: (values: FeeGroupFormValues) => void;
  isLoading?: boolean;
}

const defaultValues: FeeGroupFormValues = {
  name: '',
  description: '',
  is_active: true,
};

function toFormValues(feeGroup: FeeGroup): FeeGroupFormValues {
  return {
    name: feeGroup.name,
    description: feeGroup.description ?? '',
    is_active: feeGroup.is_active === 'yes',
  };
}

export function FeeGroupFormDialog({
  open,
  onOpenChange,
  feeGroup,
  onSubmit,
  isLoading,
}: FeeGroupFormDialogProps) {
  const isEdit = Boolean(feeGroup);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FeeGroupFormValues>({
    resolver: zodResolver(feeGroupFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!open) return;
    reset(feeGroup ? toFormValues(feeGroup) : defaultValues);
  }, [open, feeGroup, reset]);

  return (
    <EntityFormDialog
      open={open}
      onOpenChange={onOpenChange}
      isEdit={isEdit}
      isLoading={isLoading}
      title={isEdit ? 'Edit fee group' : 'Add fee group'}
      description="Group related fee types into packages for class assignments."
      submitLabel={isEdit ? 'Save changes' : 'Add fee group'}
      onSubmit={handleSubmit(onSubmit)}
    >
      <FormErrorSummary errors={errors} />
      <FormTextField
        control={control}
        name="name"
        label="Name"
        placeholder="Standard Package"
        required
      />
      <FormTextareaField
        control={control}
        name="description"
        label="Description"
        rows={2}
        optional
      />
      <FormSwitchField control={control} name="is_active" label="Active" />
    </EntityFormDialog>
  );
}
