import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormField } from '@components/forms/FormField';
import { FormDateField, FormTextareaField } from '@components/forms/fields';
import { Select } from '@components/ui/select';
import {
  staffLeaveRequestFormSchema,
  type StaffLeaveRequestFormValues,
} from '@features/staff/leave-requests/schemas/leave-request.schema';
import type { LeaveType } from '@app-types/staff/leave-type';
import type { StaffListItem } from '@app-types/staff/staff';

interface StaffLeaveRequestFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff: StaffListItem[];
  leaveTypes: LeaveType[];
  onSubmit: (values: StaffLeaveRequestFormValues) => void;
  isLoading?: boolean;
}

const defaultValues: StaffLeaveRequestFormValues = {
  staff_id: 0,
  leave_type_id: 0,
  leave_from: '',
  leave_to: '',
  employee_remark: '',
};

export function StaffLeaveRequestFormDialog({
  open,
  onOpenChange,
  staff,
  leaveTypes,
  onSubmit,
  isLoading,
}: StaffLeaveRequestFormDialogProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StaffLeaveRequestFormValues>({
    resolver: zodResolver(staffLeaveRequestFormSchema),
    defaultValues,
  });

  const staffOptions = useMemo(
    () =>
      staff
        .filter((s) => s.is_active === 'yes')
        .map((s) => ({
          value: String(s.id),
          label: `${s.full_name} (${s.employee_id})`,
        })),
    [staff],
  );

  const leaveTypeOptions = useMemo(
    () =>
      leaveTypes
        .filter((t) => t.is_active === 'yes')
        .map((t) => ({ value: String(t.id), label: t.name })),
    [leaveTypes],
  );

  useEffect(() => {
    if (!open) return;
    reset({
      ...defaultValues,
      staff_id: staffOptions[0] ? Number(staffOptions[0].value) : 0,
      leave_type_id: leaveTypeOptions[0] ? Number(leaveTypeOptions[0].value) : 0,
    });
  }, [open, reset, staffOptions, leaveTypeOptions]);

  return (
    <EntityFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add leave request"
      description="Create a staff leave request for review."
      onSubmit={handleSubmit(onSubmit)}
      isLoading={isLoading}
      submitLabel="Create"
    >
      <FormErrorSummary errors={errors} />
      <Controller
        control={control}
        name="staff_id"
        render={({ field, fieldState }) => (
          <FormField label="Staff" htmlFor="leave_staff" error={fieldState.error?.message} required>
            <Select
              id="leave_staff"
              options={staffOptions}
              value={field.value ? String(field.value) : ''}
              onChange={(e) => field.onChange(Number(e.target.value))}
              placeholder="Select staff"
            />
          </FormField>
        )}
      />
      <Controller
        control={control}
        name="leave_type_id"
        render={({ field, fieldState }) => (
          <FormField
            label="Leave type"
            htmlFor="leave_type"
            error={fieldState.error?.message}
            required
          >
            <Select
              id="leave_type"
              options={leaveTypeOptions}
              value={field.value ? String(field.value) : ''}
              onChange={(e) => field.onChange(Number(e.target.value))}
              placeholder="Select leave type"
            />
          </FormField>
        )}
      />
      <FormDateField control={control} name="leave_from" label="Leave from" />
      <FormDateField control={control} name="leave_to" label="Leave to" />
      <FormTextareaField control={control} name="employee_remark" label="Remark" optional />
    </EntityFormDialog>
  );
}
