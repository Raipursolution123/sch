import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormField } from '@components/forms/FormField';
import {
  FormSelectField,
  FormSwitchField,
  FormTextField,
} from '@components/forms/fields';
import type { Subject } from '@app-types/academics/subject';
import type { SchoolClass } from '@app-types/academics/class';
import { SUBJECT_TYPE_OPTIONS } from '@features/academics/subjects/constants/options';
import {
  subjectFormSchema,
  type SubjectFormValues,
} from '@features/academics/subjects/schemas/subject.schema';
import { cn } from '@utils/cn';

interface SubjectFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject?: Subject | null;
  classes: SchoolClass[];
  onSubmit: (values: SubjectFormValues) => void;
  isLoading?: boolean;
}

const defaultValues: SubjectFormValues = {
  name: '',
  code: '',
  type: 'theory',
  linked_class_ids: [],
  is_active: true,
};

const subjectTypeOptions = SUBJECT_TYPE_OPTIONS.map((option) => ({
  value: option.value,
  label: option.label,
}));

function toFormValues(subject: Subject): SubjectFormValues {
  return {
    name: subject.name,
    code: subject.code,
    type: subject.type as SubjectFormValues['type'],
    linked_class_ids: subject.linked_class_ids,
    is_active: subject.is_active === 'yes',
  };
}

export function SubjectFormDialog({
  open,
  onOpenChange,
  subject,
  classes,
  onSubmit,
  isLoading,
}: SubjectFormDialogProps) {
  const isEdit = Boolean(subject);

  const selectableClasses = useMemo(() => {
    const active = classes
      .filter((c) => c.is_active === 'yes')
      .sort((a, b) => a.sort_order - b.sort_order);
    if (subject) {
      for (const id of subject.linked_class_ids) {
        const current = classes.find((c) => c.id === id);
        if (current && !active.some((c) => c.id === current.id)) {
          active.push(current);
        }
      }
    }
    return active;
  }, [classes, subject]);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (open) {
      reset(subject ? toFormValues(subject) : defaultValues);
    }
  }, [open, subject, reset]);

  const linkedClassIds = watch('linked_class_ids');

  const toggleLinkedClass = (classId: number, checked: boolean) => {
    const next = checked
      ? [...new Set([...linkedClassIds, classId])]
      : linkedClassIds.filter((id) => id !== classId);
    setValue('linked_class_ids', next, { shouldDirty: true });
  };

  return (
    <EntityFormDialog
      open={open}
      onOpenChange={onOpenChange}
      isEdit={isEdit}
      isLoading={isLoading}
      title={isEdit ? 'Edit Subject' : 'Add Subject'}
      description={
        isEdit
          ? 'Update subject details and class applicability.'
          : 'Create a subject for timetables, exams, and attendance.'
      }
      submitLabel={isEdit ? 'Save changes' : 'Create subject'}
      onSubmit={handleSubmit(onSubmit)}
      scrollable
    >
      <FormErrorSummary errors={errors} />

      <FormTextField
        control={control}
        name="name"
        label="Subject name"
        placeholder="Mathematics"
        required
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <FormTextField control={control} name="code" label="Code" placeholder="MATH" required />
        <FormSelectField
          control={control}
          name="type"
          label="Type"
          options={subjectTypeOptions}
          required
        />
      </div>

      <FormField
        label="Linked classes"
        hint="Optional. Restrict this subject to specific classes."
      >
        {selectableClasses.length === 0 ? (
          <p className="text-sm text-muted-foreground">No active classes available.</p>
        ) : (
          <div className="max-h-36 space-y-2 overflow-y-auto rounded-md border p-3">
            {selectableClasses.map((schoolClass) => {
              const checked = linkedClassIds.includes(schoolClass.id);
              return (
                <label
                  key={schoolClass.id}
                  className={cn(
                    'flex cursor-pointer items-center gap-2 rounded px-1 py-0.5 text-sm',
                    checked && 'font-medium',
                  )}
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-input"
                    checked={checked}
                    onChange={(e) => toggleLinkedClass(schoolClass.id, e.target.checked)}
                  />
                  {schoolClass.class_name}
                </label>
              );
            })}
          </div>
        )}
      </FormField>

      <FormSwitchField
        control={control}
        name="is_active"
        label="Active"
        hint="Inactive subjects are hidden from assignment flows."
      />
    </EntityFormDialog>
  );
}
