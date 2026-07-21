import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormTextField, FormSelectField } from '@components/forms/fields';
import {
  disableStudentSchema,
  type DisableStudentFormValues,
} from '@features/students/schemas/disable-student.schema';
import { useDisableReasons } from '@hooks/useStudents';

interface DisableStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentName: string;
  onSubmit: (values: DisableStudentFormValues) => void;
  isLoading?: boolean;
}

export function DisableStudentDialog({
  open,
  onOpenChange,
  studentName,
  onSubmit,
  isLoading,
}: DisableStudentDialogProps) {
  const { data: reasons = [], isLoading: reasonsLoading } = useDisableReasons(open);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DisableStudentFormValues>({
    resolver: zodResolver(disableStudentSchema),
    defaultValues: { disable_reason_id: 0, dis_note: '' },
  });

  useEffect(() => {
    if (!open) return;
    reset({
      disable_reason_id: reasons[0]?.id ?? 0,
      dis_note: '',
    });
  }, [open, reasonsLoading, reset]);

  const reasonOptions = reasons.map((reason) => ({
    value: String(reason.id),
    label: reason.reason,
  }));

  return (
    <EntityFormDialog
      open={open}
      onOpenChange={onOpenChange}
      isEdit
      isLoading={isLoading || reasonsLoading}
      title="Disable student"
      description={`Disable ${studentName}? The student will be removed from the active list but their records are kept.`}
      submitLabel="Disable student"
      submitDisabled={reasonOptions.length === 0}
      onSubmit={handleSubmit(onSubmit)}
      size="sm"
    >
      <FormErrorSummary errors={errors} />

      {reasonOptions.length === 0 && !reasonsLoading ? (
        <p className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
          Add disable reasons under Settings before disabling a student.
        </p>
      ) : (
        <>
          <FormSelectField
            control={control}
            name="disable_reason_id"
            label="Reason"
            placeholder="Select reason"
            options={reasonOptions}
            required
          />
          <FormTextField
            control={control}
            name="dis_note"
            label="Note"
            optional
            placeholder="Optional details"
          />
        </>
      )}
    </EntityFormDialog>
  );
}
