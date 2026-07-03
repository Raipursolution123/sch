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
import type { StaffDepartment, StaffDesignation, StaffDetail } from '@app-types/staff/staff';
import {
  CONTRACT_TYPE_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  STAFF_GENDER_OPTIONS,
} from '@features/staff/constants/options';
import { staffFormSchema, type StaffFormValues } from '@features/staff/schemas/staff-form.schema';
import { staffToFormValues } from '@features/staff/utils/staff-payload';

interface StaffFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departments: StaffDepartment[];
  designations: StaffDesignation[];
  suggestedEmployeeId?: string;
  staff?: StaffDetail | null;
  onSubmit: (values: StaffFormValues) => void;
  isLoading?: boolean;
}

function toSelectOptions<T extends { id: number; name: string }>(
  items: T[],
): { value: string; label: string }[] {
  return items.map((item) => ({ value: String(item.id), label: item.name }));
}

function SectionHeading({ children }: { children: string }) {
  return <h3 className="border-b pb-2 text-sm font-semibold text-foreground">{children}</h3>;
}

const defaultValues: StaffFormValues = {
  employee_id: '',
  name: '',
  surname: '',
  gender: 'Male',
  dob: '',
  email: '',
  contact_no: '',
  emergency_contact_no: '',
  department_id: 0,
  designation_id: 0,
  qualification: '',
  work_exp: '',
  date_of_joining: '',
  father_name: '',
  mother_name: '',
  local_address: '',
  marital_status: 'Single',
  contract_type: 'Permanent',
  is_active: true,
};

export function StaffFormDialog({
  open,
  onOpenChange,
  departments,
  designations,
  suggestedEmployeeId = '',
  staff = null,
  onSubmit,
  isLoading,
}: StaffFormDialogProps) {
  const isEdit = staff != null;

  const departmentOptions = useMemo(() => toSelectOptions(departments), [departments]);
  const designationOptions = useMemo(() => toSelectOptions(designations), [designations]);
  const hasLookupOptions = departmentOptions.length > 0 && designationOptions.length > 0;

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<StaffFormValues>({
    resolver: zodResolver(staffFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!open) return;

    if (isEdit && staff) {
      reset(staffToFormValues(staff));
      return;
    }

    reset({
      ...defaultValues,
      employee_id: suggestedEmployeeId,
      department_id: departments[0]?.id ?? 0,
      designation_id: designations[0]?.id ?? 0,
    });
  }, [open, isEdit, staff, suggestedEmployeeId, departments, designations, reset]);

  const isActive = watch('is_active');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col">
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Edit staff member' : 'Add staff member'}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? 'Update staff details. Required fields are marked with an asterisk.'
                : 'Register a new staff member. Required fields are marked with an asterisk.'}
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto py-4 pr-1">
            {!hasLookupOptions && (
              <p className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
                Department and designation options are not available yet.
              </p>
            )}

            <section className="space-y-4">
              <SectionHeading>Employment</SectionHeading>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  label="Employee ID"
                  htmlFor="employee_id"
                  error={errors.employee_id?.message}
                  required
                >
                  <Input id="employee_id" readOnly={isEdit} {...register('employee_id')} />
                </FormField>
                <FormField
                  label="Date of joining"
                  htmlFor="date_of_joining"
                  error={errors.date_of_joining?.message}
                >
                  <Input id="date_of_joining" type="date" {...register('date_of_joining')} />
                </FormField>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  label="Department"
                  htmlFor="department_id"
                  error={errors.department_id?.message}
                  required
                >
                  <Controller
                    name="department_id"
                    control={control}
                    render={({ field }) => (
                      <Select
                        id="department_id"
                        placeholder="Select department"
                        options={departmentOptions}
                        value={field.value ? String(field.value) : ''}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        disabled={!hasLookupOptions}
                      />
                    )}
                  />
                </FormField>
                <FormField
                  label="Designation"
                  htmlFor="designation_id"
                  error={errors.designation_id?.message}
                  required
                >
                  <Controller
                    name="designation_id"
                    control={control}
                    render={({ field }) => (
                      <Select
                        id="designation_id"
                        placeholder="Select designation"
                        options={designationOptions}
                        value={field.value ? String(field.value) : ''}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        disabled={!hasLookupOptions}
                      />
                    )}
                  />
                </FormField>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  label="Contract type"
                  htmlFor="contract_type"
                  error={errors.contract_type?.message}
                  required
                >
                  <Controller
                    name="contract_type"
                    control={control}
                    render={({ field }) => (
                      <Select
                        id="contract_type"
                        options={CONTRACT_TYPE_OPTIONS.map((o) => ({
                          value: o.value,
                          label: o.label,
                        }))}
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    )}
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
                    />
                    <span className="text-sm text-muted-foreground">{isActive ? 'Yes' : 'No'}</span>
                  </div>
                </FormField>
              </div>
            </section>

            <section className="space-y-4">
              <SectionHeading>Personal details</SectionHeading>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="First name" htmlFor="name" error={errors.name?.message} required>
                  <Input id="name" {...register('name')} />
                </FormField>
                <FormField
                  label="Last name"
                  htmlFor="surname"
                  error={errors.surname?.message}
                  required
                >
                  <Input id="surname" {...register('surname')} />
                </FormField>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <FormField label="Gender" htmlFor="gender" error={errors.gender?.message} required>
                  <Controller
                    name="gender"
                    control={control}
                    render={({ field }) => (
                      <Select
                        id="gender"
                        options={STAFF_GENDER_OPTIONS.map((o) => ({
                          value: o.value,
                          label: o.label,
                        }))}
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    )}
                  />
                </FormField>
                <FormField label="Date of birth" htmlFor="dob" error={errors.dob?.message} required>
                  <Input id="dob" type="date" {...register('dob')} />
                </FormField>
                <FormField
                  label="Marital status"
                  htmlFor="marital_status"
                  error={errors.marital_status?.message}
                  required
                >
                  <Controller
                    name="marital_status"
                    control={control}
                    render={({ field }) => (
                      <Select
                        id="marital_status"
                        options={MARITAL_STATUS_OPTIONS.map((o) => ({
                          value: o.value,
                          label: o.label,
                        }))}
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    )}
                  />
                </FormField>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <FormField label="Email" htmlFor="email" error={errors.email?.message} required>
                  <Input id="email" type="email" {...register('email')} />
                </FormField>
                <FormField
                  label="Contact number"
                  htmlFor="contact_no"
                  error={errors.contact_no?.message}
                  required
                >
                  <Input id="contact_no" inputMode="numeric" {...register('contact_no')} />
                </FormField>
                <FormField
                  label="Emergency contact"
                  htmlFor="emergency_contact_no"
                  error={errors.emergency_contact_no?.message}
                  required
                >
                  <Input
                    id="emergency_contact_no"
                    inputMode="numeric"
                    {...register('emergency_contact_no')}
                  />
                </FormField>
              </div>
            </section>

            <section className="space-y-4">
              <SectionHeading>Professional</SectionHeading>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  label="Qualification"
                  htmlFor="qualification"
                  error={errors.qualification?.message}
                  required
                >
                  <Input id="qualification" {...register('qualification')} />
                </FormField>
                <FormField
                  label="Work experience"
                  htmlFor="work_exp"
                  error={errors.work_exp?.message}
                  required
                >
                  <Input id="work_exp" {...register('work_exp')} />
                </FormField>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  label="Father's name"
                  htmlFor="father_name"
                  error={errors.father_name?.message}
                >
                  <Input id="father_name" {...register('father_name')} />
                </FormField>
                <FormField
                  label="Mother's name"
                  htmlFor="mother_name"
                  error={errors.mother_name?.message}
                >
                  <Input id="mother_name" {...register('mother_name')} />
                </FormField>
              </div>
              <FormField
                label="Local address"
                htmlFor="local_address"
                error={errors.local_address?.message}
                required
              >
                <Textarea id="local_address" rows={2} {...register('local_address')} />
              </FormField>
            </section>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading} disabled={!hasLookupOptions}>
              {isEdit ? 'Save changes' : 'Add staff member'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
