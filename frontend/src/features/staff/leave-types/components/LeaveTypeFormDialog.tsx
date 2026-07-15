import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormSwitchField, FormTextField } from '@components/forms/fields';
import type { LeaveType } from '@app-types/staff/leave-type';
import {
  leaveTypeFormSchema,
  type LeaveTypeFormValues,
} from '@features/staff/leave-types/schemas/leave-type.schema';

interface LeaveTypeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leaveType?: LeaveType | null;
  onSubmit: (values: LeaveTypeFormValues) => void;
  isLoading?: boolean;
}

const defaultValues: LeaveTypeFormValues = {
  name: '',
  is_active: true,
};

export function LeaveTypeFormDialog({
  open,
  onOpenChange,
  leaveType,
  onSubmit,
  isLoading,
}: LeaveTypeFormDialogProps) {
  const isEdit = Boolean(leaveType);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LeaveTypeFormValues>({
    resolver: zodResolver(leaveTypeFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!open) return;
    if (isEdit && leaveType) {
      reset({
        name: leaveType.name,
        is_active: leaveType.is_active === 'yes',
      });
      return;
    }
    reset(defaultValues);
  }, [open, isEdit, leaveType, reset]);

  return (
    <EntityFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? 'Edit leave type' : 'Add leave type'}
      description="Define leave categories such as Casual, Sick, or Privilege leave."
      onSubmit={handleSubmit(onSubmit)}
      isLoading={isLoading}
      submitLabel={isEdit ? 'Save' : 'Create'}
    >
      <FormErrorSummary errors={errors} />
      <FormTextField control={control} name="name" label="Name" />
      <FormSwitchField control={control} name="is_active" label="Active" />
    </EntityFormDialog>
  );
}
