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
import type { SchoolClass } from '@app-types/academics/class';
import {
  classFormSchema,
  type ClassFormValues,
} from '@features/academics/classes/schemas/class.schema';

interface ClassFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schoolClass?: SchoolClass | null;
  suggestedSortOrder?: number;
  onSubmit: (values: ClassFormValues) => void;
  isLoading?: boolean;
}

function toFormValues(schoolClass: SchoolClass): ClassFormValues {
  return {
    class_name: schoolClass.class_name,
    sort_order: schoolClass.sort_order,
    is_hedu_program: schoolClass.is_hedu_program,
    is_active: schoolClass.is_active === 'yes',
  };
}

export function ClassFormDialog({
  open,
  onOpenChange,
  schoolClass,
  suggestedSortOrder = 1,
  onSubmit,
  isLoading,
}: ClassFormDialogProps) {
  const isEdit = Boolean(schoolClass);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ClassFormValues>({
    resolver: zodResolver(classFormSchema),
    defaultValues: {
      class_name: '',
      sort_order: suggestedSortOrder,
      is_hedu_program: false,
      is_active: true,
    },
  });

  useEffect(() => {
    if (open) {
      reset(
        schoolClass
          ? toFormValues(schoolClass)
          : {
              class_name: '',
              sort_order: suggestedSortOrder,
              is_hedu_program: false,
              is_active: true,
            },
      );
    }
  }, [open, schoolClass, suggestedSortOrder, reset]);

  const isHedu = watch('is_hedu_program');
  const isActive = watch('is_active');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Edit Class' : 'Add Class'}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? 'Update class details. Sort order controls display sequence across the system.'
                : 'Create a new class for student enrollment and academic structure.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <FormField
              label="Class name"
              htmlFor="class_name"
              error={errors.class_name?.message}
              required
            >
              <Input
                id="class_name"
                placeholder="Class 5"
                {...register('class_name')}
                aria-invalid={Boolean(errors.class_name)}
              />
            </FormField>

            <FormField
              label="Sort order"
              htmlFor="sort_order"
              error={errors.sort_order?.message}
              hint="Lower numbers appear first in lists and dropdowns."
              required
            >
              <Input
                id="sort_order"
                type="number"
                min={0}
                {...register('sort_order', { valueAsNumber: true })}
                aria-invalid={Boolean(errors.sort_order)}
              />
            </FormField>

            <FormField
              label="Higher education program"
              hint="Mark classes that belong to senior secondary / higher-ed streams."
            >
              <div className="flex items-center gap-2 pt-1">
                <Switch
                  id="is_hedu_program"
                  checked={isHedu}
                  onCheckedChange={(checked) =>
                    setValue('is_hedu_program', checked, { shouldDirty: true })
                  }
                />
                <span className="text-sm text-muted-foreground">{isHedu ? 'Yes' : 'No'}</span>
              </div>
            </FormField>

            <FormField
              label="Active"
              hint="Inactive classes are hidden from enrollment and assignment flows."
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
              {isEdit ? 'Save changes' : 'Create class'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
