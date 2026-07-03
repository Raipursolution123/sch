import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
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
import { Switch } from '@components/ui/switch';
import { FormField } from '@components/forms/FormField';
import type { Section } from '@app-types/academics/section';
import {
  sectionFormSchema,
  type SectionFormValues,
} from '@features/academics/sections/schemas/section.schema';

interface SectionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  section?: Section | null;
  onSubmit: (values: SectionFormValues) => void;
  isLoading?: boolean;
}

const defaultValues: SectionFormValues = {
  section_name: '',
  is_active: true,
};

function toFormValues(section: Section): SectionFormValues {
  return {
    section_name: section.section_name,
    is_active: section.is_active === 'yes',
  };
}

export function SectionFormDialog({
  open,
  onOpenChange,
  section,
  onSubmit,
  isLoading,
}: SectionFormDialogProps) {
  const isEdit = Boolean(section);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SectionFormValues>({
    resolver: zodResolver(sectionFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (open) {
      reset(section ? toFormValues(section) : defaultValues);
    }
  }, [open, section, reset]);

  const isActive = watch('is_active');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Edit Section' : 'Add Section'}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? 'Update the section label used when grouping students within a class.'
                : 'Create a section such as A, B, or C for class divisions.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <FormField
              label="Section name"
              htmlFor="section_name"
              error={errors.section_name?.message}
              hint="Typically a single letter or short label (e.g. A, B, Science)."
              required
            >
              <Input
                id="section_name"
                placeholder="A"
                {...register('section_name')}
                aria-invalid={Boolean(errors.section_name)}
              />
            </FormField>

            <FormField
              label="Active"
              hint="Inactive sections are hidden from class-section assignment."
            >
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
              {isEdit ? 'Save changes' : 'Create section'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
