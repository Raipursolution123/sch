import { useEffect } from 'react';
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
import { Textarea } from '@components/ui/textarea';
import { FormField } from '@components/forms/FormField';
import type { ExamGroup } from '@app-types/examinations/exam-group';
import { EXAM_TYPE_OPTIONS } from '@features/examinations/constants/options';
import {
  examGroupFormSchema,
  type ExamGroupFormValues,
} from '@features/examinations/exam-groups/schemas/exam-group.schema';

interface ExamGroupFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  examGroup?: ExamGroup | null;
  onSubmit: (values: ExamGroupFormValues) => void;
  isLoading?: boolean;
}

const defaultValues: ExamGroupFormValues = {
  name: '',
  exam_type: EXAM_TYPE_OPTIONS[0].value,
  description: '',
  is_active: true,
};

function toFormValues(examGroup: ExamGroup): ExamGroupFormValues {
  return {
    name: examGroup.name,
    exam_type: examGroup.exam_type,
    description: examGroup.description ?? '',
    is_active: examGroup.is_active === 'yes',
  };
}

export function ExamGroupFormDialog({
  open,
  onOpenChange,
  examGroup,
  onSubmit,
  isLoading,
}: ExamGroupFormDialogProps) {
  const isEdit = Boolean(examGroup);

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ExamGroupFormValues>({
    resolver: zodResolver(examGroupFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!open) return;
    if (isEdit && examGroup) {
      reset(toFormValues(examGroup));
      return;
    }
    reset(defaultValues);
  }, [open, isEdit, examGroup, reset]);

  const isActive = watch('is_active');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Edit exam group' : 'Add exam group'}</DialogTitle>
            <DialogDescription>
              Organize exams by type such as term, unit test, or annual assessments.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <FormField label="Name" htmlFor="name" error={errors.name?.message} required>
              <Input id="name" placeholder="Mid-Term Exams" {...register('name')} />
            </FormField>
            <FormField
              label="Exam type"
              htmlFor="exam_type"
              error={errors.exam_type?.message}
              required
            >
              <Controller
                name="exam_type"
                control={control}
                render={({ field }) => (
                  <Select
                    id="exam_type"
                    options={EXAM_TYPE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                )}
              />
            </FormField>
            <FormField
              label="Description"
              htmlFor="description"
              error={errors.description?.message}
            >
              <Textarea id="description" rows={2} {...register('description')} />
            </FormField>
            <FormField label="Active">
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
              {isEdit ? 'Save changes' : 'Add exam group'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
