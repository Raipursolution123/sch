import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Controller, useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@components/ui/button';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormField } from '@components/forms/FormField';
import { FormSection } from '@components/forms/FormSection';
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
import { cn } from '@utils/cn';

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

const STAFF_STEPS = [
  { id: 'identity', label: 'Identity' },
  { id: 'role', label: 'Role' },
  { id: 'details', label: 'Details' },
  { id: 'payroll', label: 'Payroll' },
] as const;

const STEP_FIELDS: (keyof StaffFormValues)[][] = [
  [
    'name',
    'surname',
    'gender',
    'dob',
    'marital_status',
    'email',
    'contact_no',
    'emergency_contact_no',
  ],
  ['employee_id', 'department_id', 'designation_id', 'contract_type'],
  ['qualification', 'work_exp', 'local_address', 'permanent_address'],
  [],
];

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
  const isWizard = section === 'all';
  const [step, setStep] = useState(0);

  const departmentOptions = useMemo(() => toSelectOptions(departments), [departments]);
  const designationOptions = useMemo(() => toSelectOptions(designations), [designations]);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    trigger,
    formState: { errors },
  } = useForm<StaffFormValues>({
    resolver: zodResolver(staffFormSchema) as Resolver<StaffFormValues>,
    defaultValues,
  });

  useEffect(() => {
    if (!open) {
      setStep(0);
      return;
    }

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

  const isLastStep = step === STAFF_STEPS.length - 1;

  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    if (!isWizard) {
      await handleSubmit(onSubmit)(event);
      return;
    }

    event.preventDefault();
    if (!isLastStep) {
      const fields = STEP_FIELDS[step];
      const ok = fields.length === 0 ? true : await trigger(fields);
      if (ok) setStep((current) => Math.min(current + 1, STAFF_STEPS.length - 1));
      return;
    }
    await handleSubmit(onSubmit)(event);
  };

  const title = isEdit
    ? section === 'all'
      ? 'Edit staff member'
      : `Edit ${section} details`
    : 'Add staff member';

  const description = isWizard
    ? isEdit
      ? 'Update staff details across the steps below.'
      : 'Walk through identity, role, details, then payroll.'
    : isEdit
      ? 'Update staff details. Required fields are marked with an asterisk.'
      : 'Register a new staff member. Required fields are marked with an asterisk.';

  const submitLabel = isWizard
    ? isLastStep
      ? isEdit
        ? 'Save changes'
        : 'Add staff member'
      : 'Continue'
    : isEdit
      ? 'Save changes'
      : 'Add staff member';

  return (
    <EntityFormDialog
      open={open}
      onOpenChange={onOpenChange}
      isEdit={isEdit}
      isLoading={isLoading}
      title={title}
      description={description}
      submitLabel={submitLabel}
      onSubmit={handleFormSubmit}
      size="lg"
      scrollable
      leadingActions={
        isWizard && step > 0 ? (
          <Button type="button" variant="ghost" onClick={() => setStep((s) => s - 1)}>
            Back
          </Button>
        ) : undefined
      }
    >
      {isWizard && (
        <nav aria-label="Staff registration steps" className="mb-2">
          <ol className="flex flex-wrap gap-2">
            {STAFF_STEPS.map((item, index) => {
              const active = index === step;
              const done = index < step;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    className={cn(
                      'rounded-sm border px-2.5 py-1 font-mono text-[0.65rem] font-medium uppercase tracking-label transition-colors',
                      active && 'border-primary bg-primary-pale text-ink',
                      done && !active && 'border-border bg-card text-muted-foreground',
                      !active && !done && 'border-border text-muted-foreground',
                    )}
                    onClick={() => {
                      if (index <= step) setStep(index);
                    }}
                    aria-current={active ? 'step' : undefined}
                  >
                    {index + 1}. {item.label}
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>
      )}

      <FormErrorSummary errors={errors} />

      {isWizard && step === 0 && (
        <FormSection title="Identity">
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
        </FormSection>
      )}

      {isWizard && step === 1 && (
        <FormSection title="Role">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormTextField control={control} name="employee_id" label="Employee ID" required />
            <FormDateField
              control={control}
              name="date_of_joining"
              label="Date of joining"
              optional
            />
            <FormDateField
              control={control}
              name="date_of_leaving"
              label="Date of leaving"
              optional
            />
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
        </FormSection>
      )}

      {isWizard && step === 2 && (
        <FormSection title="Details">
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
        </FormSection>
      )}

      {isWizard && step === 3 && (
        <FormSection title="Payroll">
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
          </div>
        </FormSection>
      )}

      {!isWizard && section === 'employment' && (
        <section className="space-y-4">
          <SectionHeading>Employment</SectionHeading>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormTextField control={control} name="employee_id" label="Employee ID" required />
            <FormDateField
              control={control}
              name="date_of_joining"
              label="Date of joining"
              optional
            />
            <FormDateField
              control={control}
              name="date_of_leaving"
              label="Date of leaving"
              optional
            />
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

      {!isWizard && section === 'personal' && (
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
          <div className="grid gap-4 sm:grid-cols-2">
            <FormTextField control={control} name="email" label="Email" type="email" required />
            <FormTextField
              control={control}
              name="password"
              label={isEdit ? 'New password (leave blank to keep)' : 'Password (for login)'}
              type="password"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
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

      {!isWizard && (section === 'professional' || section === 'employment') && (
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

      {!isWizard && section === 'payroll' && (
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
