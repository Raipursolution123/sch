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
import { FormField } from '@components/forms/FormField';
import {
  guardianFormSchema,
  type GuardianFormValues,
} from '@features/students/schemas/guardian.schema';

interface GuardianFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValues: GuardianFormValues;
  onSubmit: (values: GuardianFormValues) => void;
  isLoading?: boolean;
}

const emptyValues: GuardianFormValues = {
  father_name: '',
  mother_name: '',
  guardian_name: '',
  guardian_phone: '',
};

export function GuardianFormDialog({
  open,
  onOpenChange,
  defaultValues,
  onSubmit,
  isLoading,
}: GuardianFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GuardianFormValues>({
    resolver: zodResolver(guardianFormSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (!open) return;
    reset(defaultValues);
  }, [open, defaultValues, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Edit guardian details</DialogTitle>
            <DialogDescription>
              Update parent and guardian contact information for this student.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <FormField label="Father's name" htmlFor="father_name" error={errors.father_name?.message}>
              <Input id="father_name" {...register('father_name')} />
            </FormField>
            <FormField label="Mother's name" htmlFor="mother_name" error={errors.mother_name?.message}>
              <Input id="mother_name" {...register('mother_name')} />
            </FormField>
            <FormField
              label="Guardian name"
              htmlFor="guardian_name"
              error={errors.guardian_name?.message}
            >
              <Input id="guardian_name" {...register('guardian_name')} />
            </FormField>
            <FormField
              label="Guardian phone"
              htmlFor="guardian_phone"
              error={errors.guardian_phone?.message}
            >
              <Input id="guardian_phone" type="tel" autoComplete="tel" {...register('guardian_phone')} />
            </FormField>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading}>
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
