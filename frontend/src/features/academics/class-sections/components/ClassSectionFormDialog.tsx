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
import { Select } from '@components/ui/select';
import { Switch } from '@components/ui/switch';
import { FormField } from '@components/forms/FormField';
import type { ClassSection } from '@app-types/academics/class-section';
import type { SchoolClass } from '@app-types/academics/class';
import type { Section } from '@app-types/academics/section';
import {
  classSectionFormSchema,
  type ClassSectionFormValues,
} from '@features/academics/class-sections/schemas/class-section.schema';

interface ClassSectionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classSection?: ClassSection | null;
  classes: SchoolClass[];
  sections: Section[];
  onSubmit: (values: ClassSectionFormValues) => void;
  isLoading?: boolean;
}

function toFormValues(classSection: ClassSection): ClassSectionFormValues {
  return {
    class_id: classSection.class_id,
    section_id: classSection.section_id,
    is_active: classSection.is_active === 'yes',
  };
}

function toSelectOptions<T extends { id: number }>(
  items: T[],
  getLabel: (item: T) => string,
): { value: string; label: string }[] {
  return items.map((item) => ({
    value: String(item.id),
    label: getLabel(item),
  }));
}

export function ClassSectionFormDialog({
  open,
  onOpenChange,
  classSection,
  classes,
  sections,
  onSubmit,
  isLoading,
}: ClassSectionFormDialogProps) {
  const isEdit = Boolean(classSection);

  const activeClasses = useMemo(() => {
    const active = classes
      .filter((c) => c.is_active === 'yes')
      .sort((a, b) => a.sort_order - b.sort_order);
    if (classSection) {
      const current = classes.find((c) => c.id === classSection.class_id);
      if (current && !active.some((c) => c.id === current.id)) {
        return [...active, current];
      }
    }
    return active;
  }, [classes, classSection]);

  const activeSections = useMemo(() => {
    const active = [...sections]
      .filter((s) => s.is_active === 'yes')
      .sort((a, b) => a.section_name.localeCompare(b.section_name));
    if (classSection) {
      const current = sections.find((s) => s.id === classSection.section_id);
      if (current && !active.some((s) => s.id === current.id)) {
        return [...active, current];
      }
    }
    return active;
  }, [sections, classSection]);

  const classOptions = useMemo(
    () => toSelectOptions(activeClasses, (c) => c.class_name),
    [activeClasses],
  );
  const sectionOptions = useMemo(
    () => toSelectOptions(activeSections, (s) => s.section_name),
    [activeSections],
  );

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ClassSectionFormValues>({
    resolver: zodResolver(classSectionFormSchema),
    defaultValues: {
      class_id: 0,
      section_id: 0,
      is_active: true,
    },
  });

  useEffect(() => {
    if (open) {
      reset(
        classSection
          ? toFormValues(classSection)
          : {
              class_id: activeClasses[0]?.id ?? 0,
              section_id: activeSections[0]?.id ?? 0,
              is_active: true,
            },
      );
    }
  }, [open, classSection, activeClasses, activeSections, reset]);

  const isActive = watch('is_active');
  const hasOptions = classOptions.length > 0 && sectionOptions.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Edit Class Section' : 'Add Class Section'}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? 'Update the class–section link used for enrollment and timetables.'
                : 'Link an active class with an active section to create a teachable group.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {!hasOptions && (
              <p className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
                Add at least one active class and one active section before creating a class section.
              </p>
            )}

            <FormField label="Class" htmlFor="class_id" error={errors.class_id?.message} required>
              <Controller
                name="class_id"
                control={control}
                render={({ field }) => (
                  <Select
                    id="class_id"
                    placeholder="Select class"
                    options={classOptions}
                    value={field.value ? String(field.value) : ''}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    disabled={!hasOptions}
                    aria-invalid={Boolean(errors.class_id)}
                  />
                )}
              />
            </FormField>

            <FormField label="Section" htmlFor="section_id" error={errors.section_id?.message} required>
              <Controller
                name="section_id"
                control={control}
                render={({ field }) => (
                  <Select
                    id="section_id"
                    placeholder="Select section"
                    options={sectionOptions}
                    value={field.value ? String(field.value) : ''}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    disabled={!hasOptions}
                    aria-invalid={Boolean(errors.section_id)}
                  />
                )}
              />
            </FormField>

            <FormField label="Active" hint="Inactive links are hidden from student assignment flows.">
              <div className="flex items-center gap-2 pt-1">
                <Switch
                  id="is_active"
                  checked={isActive}
                  onCheckedChange={(checked) => setValue('is_active', checked, { shouldDirty: true })}
                />
                <span className="text-sm text-muted-foreground">{isActive ? 'Yes' : 'No'}</span>
              </div>
            </FormField>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading} disabled={!hasOptions}>
              {isEdit ? 'Save changes' : 'Create link'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
