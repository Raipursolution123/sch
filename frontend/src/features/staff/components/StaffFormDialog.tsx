import { useEffect, useMemo } from 'react';
import { Controller, useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormField } from '@components/forms/FormField';
import {
  FormDateField,
  FormSelectField,
  FormSwitchField,
  FormTextField,
  FormTextareaField,
} from '@components/forms/fields';
import { Input } from '@components/ui/input';
import { Select } from '@components/ui/select';
import type { StaffDepartment, StaffDesignation, StaffDetail } from '@app-types/staff/staff';
import {
  CONTRACT_TYPE_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  STAFF_GENDER_OPTIONS,
} from '@features/staff/constants/options';
import { staffFormSchema, type StaffFormValues } from '@features/staff/schemas/staff-form.schema';
import { staffToFormValues } from '@features/staff/utils/staff-payload';

export type StaffFormSection = 'all' | 'employment' | 'personal' | 'professional' | 'payroll';

interface StaffFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departments: StaffDepartment[];
  designations: StaffDesignation[];
  suggestedEmployeeId?: string;
  staff?: StaffDetail | null;
  onSubmit: (values: StaffFormValues) => void;
  isLoading?: boolean;
  section?: StaffFormSection;
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
  date_of_leaving: '',
  father_name: '',
  mother_name: '',
  local_address: '',
  permanent_address: '',
  marital_status: 'Single',
  contract_type: 'Permanent',
  basic_salary: null,
  is_active: true,
};

const genderOptions = STAFF_GENDER_OPTIONS.map((option) => ({
  value: option.value,
  label: option.label,
}));

const maritalStatusOptions = MARITAL_STATUS_OPTIONS.map((option) => ({
  value: option.value,
  label: option.label,
}));

const contractTypeOptions = CONTRACT_TYPE_OPTIONS.map((option) => ({
  value: option.value,
  label: option.label,
}));

export function StaffFormDialog({
  open,
  onOpenChange,
  departments,
  designations,
  suggestedEmployeeId = '',
  staff = null,
  onSubmit,
  isLoading,
  section = 'all',
}: StaffFormDialogProps) {
  const isEdit = staff != null;

  const departmentOptions = useMemo(() => toSelectOptions(departments), [departments]);
  const designationOptions = useMemo(() => toSelectOptions(designations), [designations]);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<StaffFormValues>({
    resolver: zodResolver(staffFormSchema) as Resolver<StaffFormValues>,
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
      department_id: undefined,
      designation_id: undefined,
    });
  }, [open, isEdit, staff, reset]);

  useEffect(() => {
    if (open && !isEdit && suggestedEmployeeId) {
      const currentId = getValues('employee_id');
      if (!currentId || currentId === '') {
        setValue('employee_id', suggestedEmployeeId, { shouldValidate: true, shouldDirty: true });
      }
    }
  }, [open, isEdit, suggestedEmployeeId, getValues, setValue]);

  const title = isEdit
    ? section === 'all'
      ? 'Edit staff member'
      : `Edit ${section} details`
    : 'Add staff member';

  const description = isEdit
    ? 'Update staff details. Required fields are marked with an asterisk.'
    : 'Register a new staff member. Required fields are marked with an asterisk.';

  return (
    <EntityFormDialog
      open={open}
      onOpenChange={onOpenChange}
      isEdit={isEdit}
      isLoading={isLoading}
      title={title}
      description={description}
      submitLabel={isEdit ? 'Save changes' : 'Add staff member'}
      onSubmit={handleSubmit(onSubmit)}
      size="lg"
      scrollable
    >
      <FormErrorSummary errors={errors} />

      {(section === 'all' || section === 'employment') && (
        <section className="space-y-4">
          <SectionHeading>Employment</SectionHeading>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormTextField control={control} name="employee_id" label="Employee ID" required />
            <FormDateField control={control} name="date_of_joining" label="Date of joining" optional />
            <FormDateField control={control} name="date_of_leaving" label="Date of leaving" optional />
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
                  />
                )}
              />
            </FormField>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormSelectField
              control={control}
              name="contract_type"
              label="Contract type"
              options={contractTypeOptions}
              required
            />
            <FormSwitchField control={control} name="is_active" label="Active" />
          </div>
        </section>
      )}

      {(section === 'all' || section === 'personal') && (
        <section className="space-y-4">
          <SectionHeading>Personal details</SectionHeading>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormTextField control={control} name="name" label="First name" required />
            <FormTextField control={control} name="surname" label="Last name" required />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <FormSelectField
              control={control}
              name="gender"
              label="Gender"
              options={genderOptions}
              required
            />
            <FormDateField control={control} name="dob" label="Date of birth" required />
            <FormSelectField
              control={control}
              name="marital_status"
              label="Marital status"
              options={maritalStatusOptions}
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FormTextField control={control} name="email" label="Email" type="email" required />
            <FormTextField control={control} name="contact_no" label="Contact number" required />
            <FormTextField
              control={control}
              name="emergency_contact_no"
              label="Emergency contact"
              required
            />
          </div>
        </section>
      )}

      {(section === 'all' || section === 'professional' || section === 'employment') && (
        <section className="space-y-4">
          <SectionHeading>Professional</SectionHeading>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormTextField control={control} name="qualification" label="Qualification" required />
            <FormTextField control={control} name="work_exp" label="Work experience" required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormTextField control={control} name="father_name" label="Father's name" optional />
            <FormTextField control={control} name="mother_name" label="Mother's name" optional />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormTextareaField
              control={control}
              name="local_address"
              label="Local address"
              rows={2}
              required
            />
            <FormTextareaField
              control={control}
              name="permanent_address"
              label="Permanent address"
              rows={2}
              required
            />
          </div>
        </section>
      )}

      {(section === 'all' || section === 'payroll') && (
        <section className="space-y-4">
          <SectionHeading>Payroll</SectionHeading>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Basic salary"
              htmlFor="basic_salary"
              error={errors.basic_salary?.message}
              optional
            >
              <Controller
                name="basic_salary"
                control={control}
                render={({ field }) => (
                  <Input
                    id="basic_salary"
                    type="number"
                    placeholder="e.g. 25000"
                    value={field.value ?? ''}
                    onChange={(event) => {
                      const next = event.target.value;
                      field.onChange(next === '' ? null : Number(next));
                    }}
                  />
                )}
              />
            </FormField>
            <FormSelectField
              control={control}
              name="contract_type"
              label="Contract type"
              options={contractTypeOptions}
              required
            />
          </div>
        </section>
      )}
    </EntityFormDialog>
  );
}
