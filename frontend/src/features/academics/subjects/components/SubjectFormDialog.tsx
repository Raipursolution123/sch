import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
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
import { Select } from '@components/ui/select';
import { Switch } from '@components/ui/switch';
import { FormField } from '@components/forms/FormField';
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
    register,
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
  const isActive = watch('is_active');

  const toggleLinkedClass = (classId: number, checked: boolean) => {
    const next = checked
      ? [...new Set([...linkedClassIds, classId])]
      : linkedClassIds.filter((id) => id !== classId);
    setValue('linked_class_ids', next, { shouldDirty: true });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Edit Subject' : 'Add Subject'}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? 'Update subject details and class applicability.'
                : 'Create a subject for timetables, exams, and attendance.'}
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[60vh] space-y-4 overflow-y-auto py-4 pr-1">
            <FormField label="Subject name" htmlFor="name" error={errors.name?.message} required>
              <Input
                id="name"
                placeholder="Mathematics"
                {...register('name')}
                aria-invalid={Boolean(errors.name)}
              />
            </FormField>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Code" htmlFor="code" error={errors.code?.message} required>
                <Input
                  id="code"
                  placeholder="MATH"
                  {...register('code')}
                  aria-invalid={Boolean(errors.code)}
                />
              </FormField>

              <FormField label="Type" htmlFor="type" error={errors.type?.message} required>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <Select
                      id="type"
                      options={SUBJECT_TYPE_OPTIONS.map((o) => ({
                        value: o.value,
                        label: o.label,
                      }))}
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      aria-invalid={Boolean(errors.type)}
                    />
                  )}
                />
              </FormField>
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

            <FormField label="Active" hint="Inactive subjects are hidden from assignment flows.">
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
              {isEdit ? 'Save changes' : 'Create subject'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
