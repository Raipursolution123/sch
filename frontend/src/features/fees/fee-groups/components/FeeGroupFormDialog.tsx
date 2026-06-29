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
import { Textarea } from '@components/ui/textarea';
import { FormField } from '@components/forms/FormField';
import type { FeeGroup } from '@app-types/fees/fee-group';
import {
  feeGroupFormSchema,
  type FeeGroupFormValues,
} from '@features/fees/fee-groups/schemas/fee-group.schema';

interface FeeGroupFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feeGroup?: FeeGroup | null;
  onSubmit: (values: FeeGroupFormValues) => void;
  isLoading?: boolean;
}

const defaultValues: FeeGroupFormValues = {
  name: '',
  description: '',
  is_active: true,
};

function toFormValues(feeGroup: FeeGroup): FeeGroupFormValues {
  return {
    name: feeGroup.name,
    description: feeGroup.description ?? '',
    is_active: feeGroup.is_active === 'yes',
  };
}

export function FeeGroupFormDialog({
  open,
  onOpenChange,
  feeGroup,
  onSubmit,
  isLoading,
}: FeeGroupFormDialogProps) {
  const isEdit = Boolean(feeGroup);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FeeGroupFormValues>({
    resolver: zodResolver(feeGroupFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!open) return;
    if (isEdit && feeGroup) {
      reset(toFormValues(feeGroup));
      return;
    }
    reset(defaultValues);
  }, [open, isEdit, feeGroup, reset]);

  const isActive = watch('is_active');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Edit fee group' : 'Add fee group'}</DialogTitle>
            <DialogDescription>
              Group related fee types into packages for class assignments.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <FormField label="Name" htmlFor="name" error={errors.name?.message} required>
              <Input id="name" placeholder="Standard Package" {...register('name')} />
            </FormField>
            <FormField label="Description" htmlFor="description" error={errors.description?.message}>
              <Textarea id="description" rows={2} {...register('description')} />
            </FormField>
            <FormField label="Active">
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
            <Button type="submit" isLoading={isLoading}>
              {isEdit ? 'Save changes' : 'Add fee group'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
