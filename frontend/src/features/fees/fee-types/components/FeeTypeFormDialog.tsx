import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormField } from '@components/forms/FormField';
import { FormSwitchField, FormTextField, FormTextareaField } from '@components/forms/fields';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Select } from '@components/ui/select';
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
    handleSubmit,
    reset,
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
        },
      },
    );
  };

  return (
    <EntityFormDialog
      open={open}
      onOpenChange={onOpenChange}
      isEdit={isEdit}
      isLoading={isLoading}
      title={isEdit ? 'Edit fee type' : 'Add fee type'}
      description="Define a reusable fee type with a unique code and category."
      submitLabel={isEdit ? 'Save changes' : 'Add fee type'}
      onSubmit={handleSubmit(onSubmit)}
    >
      <FormErrorSummary errors={errors} />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormTextField control={control} name="code" label="Code" placeholder="TUITION" required />
        <FormTextField control={control} name="name" label="Name" placeholder="Tuition Fee" required />
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
                      placeholder={
                        categoryOptions.length === 0 ? 'No categories available' : 'Select category'
                      }
                      options={categoryOptions}
                      value={field.value ? String(field.value) : ''}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      disabled={categoryOptions.length === 0}
                    />
                  )}
                />
              </div>
              <Button type="button" variant="outline" onClick={() => setIsCreatingCategory(true)}>
                New
              </Button>
            </>
          )}
        </div>
      </FormField>
      <FormTextareaField control={control} name="description" label="Description" rows={2} optional />
      <FormSwitchField control={control} name="is_active" label="Active" />
    </EntityFormDialog>
  );
}
