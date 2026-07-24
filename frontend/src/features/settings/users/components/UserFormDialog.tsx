import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormSelectField, FormSwitchField } from '@components/forms/fields';
import { useUserRoleOptions } from '@hooks/useRoles';
import type { StaffUserAccount } from '@app-types/settings/roles';

const userFormSchema = z.object({
  role_id: z.string().min(1, 'Role is required'),
  is_active: z.boolean(),
});

export type UserFormValues = z.infer<typeof userFormSchema>;

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: StaffUserAccount | null;
  onSubmit: (values: UserFormValues) => void;
  isLoading?: boolean;
}

export function UserFormDialog({
  open,
  onOpenChange,
  user,
  onSubmit,
  isLoading,
}: UserFormDialogProps) {
  const { data: roles = [] } = useUserRoleOptions(open);
  const roleOptions = roles.map((r) => ({
    value: String(r.id),
    label: r.is_superadmin ? `${r.name} (Superadmin)` : r.name,
  }));

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      role_id: '',
      is_active: true,
    },
  });

  useEffect(() => {
    if (open && user) {
      reset({
        role_id: user.role_id ? String(user.role_id) : '',
        is_active: user.is_active,
      });
    }
  }, [open, user, reset]);

  return (
    <EntityFormDialog
      open={open}
      onOpenChange={onOpenChange}
      isEdit
      isLoading={isLoading}
      title={user ? `Edit ${user.username}` : 'Edit user'}
      description="Assign a staff role and enable or disable login access."
      submitLabel="Save changes"
      onSubmit={handleSubmit(onSubmit)}
      size="sm"
    >
      <FormErrorSummary errors={errors} />
      <FormSelectField
        control={control}
        name="role_id"
        label="Role"
        options={roleOptions}
        placeholder="Select role"
      />
      <FormSwitchField control={control} name="is_active" label="Account active" />
    </EntityFormDialog>
  );
}
