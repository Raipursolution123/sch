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
import { Textarea } from '@components/ui/textarea';
import { FormField } from '@components/forms/FormField';
import type { ExamGroup } from '@app-types/examinations/exam-group';
import type { Exam } from '@app-types/examinations/exam';
import type { AcademicSession } from '@app-types/settings/session';
import {
  examFormSchema,
  type ExamFormValues,
} from '@features/examinations/exams/schemas/exam.schema';

interface ExamFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  examGroups: ExamGroup[];
  sessions: AcademicSession[];
  exam?: Exam | null;
  onSubmit: (values: ExamFormValues) => void;
  isLoading?: boolean;
}

function toFormValues(exam: Exam): ExamFormValues {
  return {
    name: exam.name,
    exam_group_id: exam.exam_group_id,
    session_id: exam.session_id,
    date_from: exam.date_from ?? '',
    date_to: exam.date_to ?? '',
    passing_percentage: exam.passing_percentage,
    is_published: exam.is_published,
    description: exam.description ?? '',
    is_active: exam.is_active === 'yes',
  };
}

export function ExamFormDialog({
  open,
  onOpenChange,
  examGroups,
  sessions,
  exam,
  onSubmit,
  isLoading,
}: ExamFormDialogProps) {
  const isEdit = Boolean(exam);

  const activeGroups = useMemo(
    () =>
      examGroups.filter((g) => g.is_active === 'yes').sort((a, b) => a.name.localeCompare(b.name)),
    [examGroups],
  );
  const groupOptions = activeGroups.map((g) => ({ value: String(g.id), label: g.name }));
  const sessionOptions = useMemo(
    () => sessions.map((s) => ({ value: String(s.id), label: s.session })),
    [sessions],
  );

  const defaultSessionId = sessions.find((s) => s.is_active === 'yes')?.id ?? sessions[0]?.id ?? 0;

  const hasOptions = groupOptions.length > 0 && sessionOptions.length > 0;

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ExamFormValues>({
    resolver: zodResolver(examFormSchema),
    defaultValues: {
      name: '',
      exam_group_id: activeGroups[0]?.id ?? 0,
      session_id: defaultSessionId,
      date_from: '',
      date_to: '',
      passing_percentage: null,
      is_published: false,
      description: '',
      is_active: true,
    },
  });

  const isActive = watch('is_active');
  const isPublished = watch('is_published');

  useEffect(() => {
    if (!open) return;
    if (isEdit && exam) {
      reset(toFormValues(exam));
      return;
    }
    reset({
      name: '',
      exam_group_id: activeGroups[0]?.id ?? 0,
      session_id: defaultSessionId,
      date_from: '',
      date_to: '',
      passing_percentage: null,
      is_published: false,
      description: '',
      is_active: true,
    });
  }, [open, isEdit, exam, activeGroups, defaultSessionId, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-lg">
        <form onSubmit={handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col">
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Edit exam' : 'Add exam'}</DialogTitle>
            <DialogDescription>
              Define an examination window, passing criteria, and publication status.
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto py-4 pr-1">
            {!hasOptions && (
              <p className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
                Add active exam groups and academic sessions before creating exams.
              </p>
            )}

            <FormField label="Name" htmlFor="name" error={errors.name?.message} required>
              <Input
                id="name"
                placeholder="Mid-Term 2025"
                {...register('name')}
                disabled={!hasOptions}
              />
            </FormField>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                label="Exam group"
                htmlFor="exam_group_id"
                error={errors.exam_group_id?.message}
                required
              >
                <Controller
                  name="exam_group_id"
                  control={control}
                  render={({ field }) => (
                    <Select
                      id="exam_group_id"
                      placeholder="Select group"
                      options={groupOptions}
                      value={field.value ? String(field.value) : ''}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      disabled={!hasOptions}
                    />
                  )}
                />
              </FormField>
              <FormField
                label="Session"
                htmlFor="session_id"
                error={errors.session_id?.message}
                required
              >
                <Controller
                  name="session_id"
                  control={control}
                  render={({ field }) => (
                    <Select
                      id="session_id"
                      placeholder="Select session"
                      options={sessionOptions}
                      value={field.value ? String(field.value) : ''}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      disabled={!hasOptions}
                    />
                  )}
                />
              </FormField>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Date from" htmlFor="date_from" error={errors.date_from?.message}>
                <Input
                  id="date_from"
                  type="date"
                  {...register('date_from')}
                  disabled={!hasOptions}
                />
              </FormField>
              <FormField label="Date to" htmlFor="date_to" error={errors.date_to?.message}>
                <Input id="date_to" type="date" {...register('date_to')} disabled={!hasOptions} />
              </FormField>
            </div>

            <FormField
              label="Passing percentage"
              htmlFor="passing_percentage"
              error={errors.passing_percentage?.message}
            >
              <Input
                id="passing_percentage"
                type="number"
                step="0.01"
                min="0"
                max="100"
                placeholder="33"
                disabled={!hasOptions}
                {...register('passing_percentage', { valueAsNumber: true })}
              />
            </FormField>

            <FormField label="Published">
              <div className="flex items-center gap-2 pt-1">
                <Switch
                  id="is_published"
                  checked={isPublished}
                  onCheckedChange={(checked) =>
                    setValue('is_published', checked, { shouldDirty: true })
                  }
                  disabled={!hasOptions}
                />
                <span className="text-sm text-muted-foreground">
                  {isPublished ? 'Published' : 'Draft'}
                </span>
              </div>
            </FormField>

            <FormField
              label="Description"
              htmlFor="description"
              error={errors.description?.message}
            >
              <Textarea
                id="description"
                rows={2}
                {...register('description')}
                disabled={!hasOptions}
              />
            </FormField>

            <FormField label="Active">
              <div className="flex items-center gap-2 pt-1">
                <Switch
                  id="is_active"
                  checked={isActive}
                  onCheckedChange={(checked) =>
                    setValue('is_active', checked, { shouldDirty: true })
                  }
                  disabled={!hasOptions}
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
              {isEdit ? 'Save changes' : 'Add exam'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
