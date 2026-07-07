import { useEffect, useState } from 'react';
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
import type { FeeCategory, FeeType } from '@app-types/fees/fee-type';
import {
  feeTypeFormSchema,
  type FeeTypeFormValues,
} from '@features/fees/fee-types/schemas/fee-type.schema';
import { useCreateFeeCategory } from '@hooks/useFeeTypes';

interface FeeTypeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: FeeCategory[];
  feeType?: FeeType | null;
  onSubmit: (values: FeeTypeFormValues) => void;
  isLoading?: boolean;
}

const defaultValues: FeeTypeFormValues = {
  code: '',
  name: '',
  feecategory_id: 0,
  description: '',
  is_active: true,
};

function toFormValues(feeType: FeeType): FeeTypeFormValues {
  return {
    code: feeType.code,
    name: feeType.name,
    feecategory_id: feeType.feecategory_id ?? 0,
    description: feeType.description ?? '',
    is_active: feeType.is_active === 'yes',
  };
}

export function FeeTypeFormDialog({
  open,
  onOpenChange,
  categories,
  feeType,
  onSubmit,
  isLoading,
}: FeeTypeFormDialogProps) {
  const isEdit = Boolean(feeType);
  const categoryOptions = categories.map((c) => ({ value: String(c.id), label: c.name }));

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FeeTypeFormValues>({
    resolver: zodResolver(feeTypeFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!open) return;
    if (isEdit && feeType) {
      reset(toFormValues(feeType));
      return;
    }
    reset({
      ...defaultValues,
      feecategory_id: categories[0]?.id ?? 0,
    });
    setIsCreatingCategory(false);
    setNewCategoryName('');
  }, [open, isEdit, feeType, categories, reset]);

  const isActive = watch('is_active');
  const createCategoryMutation = useCreateFeeCategory();
  
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleCreateCategory = () => {
    const name = newCategoryName.trim();
    if (!name) return;
    
    createCategoryMutation.mutate(
      { name, is_active: 'yes' },
      {
        onSuccess: (newCat) => {
          setIsCreatingCategory(false);
          setNewCategoryName('');
          setValue('feecategory_id', newCat.id, { shouldValidate: true, shouldDirty: true });
        }
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Edit fee type' : 'Add fee type'}</DialogTitle>
            <DialogDescription>
              Define a reusable fee type with a unique code and category.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Code" htmlFor="code" error={errors.code?.message} required>
                <Input id="code" placeholder="TUITION" {...register('code')} />
              </FormField>
              <FormField label="Name" htmlFor="name" error={errors.name?.message} required>
                <Input id="name" placeholder="Tuition Fee" {...register('name')} />
              </FormField>
            </div>
            <FormField
              label="Category"
              htmlFor="feecategory_id"
              error={errors.feecategory_id?.message}
              required
            >
              <div className="flex items-center gap-2">
                {isCreatingCategory ? (
                  <>
                    <Input
                      placeholder="Category name..."
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="flex-1"
                      autoFocus
                    />
                    <Button 
                      type="button" 
                      onClick={handleCreateCategory} 
                      disabled={!newCategoryName.trim() || createCategoryMutation.isPending}
                    >
                      Save
                    </Button>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      onClick={() => {
                        setIsCreatingCategory(false);
                        setNewCategoryName('');
                      }}
                      disabled={createCategoryMutation.isPending}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="flex-1">
                      <Controller
                        name="feecategory_id"
                        control={control}
                        render={({ field }) => (
                          <Select
                            id="feecategory_id"
                            placeholder={categoryOptions.length === 0 ? 'No categories available' : 'Select category'}
                            options={categoryOptions}
                            value={field.value ? String(field.value) : ''}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            disabled={categoryOptions.length === 0}
                          />
                        )}
                      />
                    </div>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsCreatingCategory(true)}
                    >
                      New
                    </Button>
                  </>
                )}
              </div>
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
              {isEdit ? 'Save changes' : 'Add fee type'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
