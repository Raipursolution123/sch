import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormSelectField } from '@components/forms/fields';
import type { ClassTeacherAssignment } from '@app-types/academics/class-teacher';
import type { StaffListItem } from '@app-types/staff/staff';
import {
  classTeacherFormSchema,
  type ClassTeacherFormValues,
} from '@features/academics/class-teacher/schemas/class-teacher.schema';

interface ClassTeacherFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  row: ClassTeacherAssignment | null;
  staff: StaffListItem[];
  onSubmit: (values: ClassTeacherFormValues) => void;
  isLoading?: boolean;
}

export function ClassTeacherFormDialog({
  open,
  onOpenChange,
  row,
  staff,
  onSubmit,
  isLoading,
}: ClassTeacherFormDialogProps) {
  const isEdit = Boolean(row?.id);

  const staffOptions = useMemo(
    () =>
      staff
        .filter((s) => s.is_active === 'yes')
        .map((s) => ({
          value: String(s.id),
          label: `${s.full_name || `${s.name} ${s.surname}`} (${s.employee_id})`,
        })),
    [staff],
  );

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClassTeacherFormValues>({
    resolver: zodResolver(classTeacherFormSchema),
    defaultValues: { staff_id: 0 },
  });

  useEffect(() => {
    if (!open || !row) return;
    reset({
      staff_id: row.staff_id ?? (staffOptions[0] ? Number(staffOptions[0].value) : 0),
    });
  }, [open, row, reset, staffOptions]);

  const title = isEdit ? 'Change class teacher' : 'Assign class teacher';
  const classLabel = row ? `${row.class_name ?? 'Class'} ${row.section_name ?? ''}`.trim() : '';

  return (
    <EntityFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={classLabel ? `Class section: ${classLabel}` : undefined}
      onSubmit={handleSubmit(onSubmit)}
      isLoading={isLoading}
      submitLabel={isEdit ? 'Save' : 'Assign'}
    >
      <FormErrorSummary errors={errors} />
      <FormSelectField
        control={control}
        name="staff_id"
        label="Teacher"
        options={staffOptions}
        placeholder="Select teacher"
        required
      />
    </EntityFormDialog>
  );
}
