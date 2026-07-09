import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { Select } from '@components/ui/select';
import type { SchoolClass } from '@app-types/academics/class';
import type { Section } from '@app-types/academics/section';
import type { StudentDetail } from '@app-types/students/student';
import {
  BLOOD_GROUP_OPTIONS,
  CATEGORY_OPTIONS,
  GENDER_OPTIONS,
  RTE_OPTIONS,
} from '@features/students/constants/options';
import {
  studentAdmissionSchema,
  type StudentAdmissionFormValues,
} from '@features/students/schemas/student-admission.schema';
import { todayIsoDate } from '@utils/student';
import { studentToFormValues } from '@features/students/utils/student-payload';

interface StudentAdmissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classes: SchoolClass[];
  sections: Section[];
  suggestedAdmissionNo?: string;
  student?: StudentDetail | null;
  onSubmit: (values: StudentAdmissionFormValues) => void;
  isLoading?: boolean;
}

function toSelectOptions<T extends { id: number }>(
  items: T[],
  getLabel: (item: T) => string,
): { value: string; label: string }[] {
  return items.map((item) => ({
    value: String(item.id),
    label: getLabel(item),
  }));
}

const genderOptions = GENDER_OPTIONS.map((option) => ({
  value: option.value,
  label: option.label,
}));

const bloodGroupOptions = [
  { value: '', label: 'Not specified' },
  ...BLOOD_GROUP_OPTIONS.map((option) => ({ value: option.value, label: option.label })),
];

const categoryOptions = CATEGORY_OPTIONS.map((option) => ({
  value: option.value,
  label: option.label,
}));

const rteOptions = RTE_OPTIONS.map((option) => ({
  value: option.value,
  label: option.label,
}));

export function StudentAdmissionDialog({
  open,
  onOpenChange,
  classes,
  sections,
  suggestedAdmissionNo = '',
  student = null,
  onSubmit,
  isLoading,
}: StudentAdmissionDialogProps) {
  const isEdit = student != null;
  const activeClasses = useMemo(
    () => classes.filter((c) => c.is_active === 'yes').sort((a, b) => a.sort_order - b.sort_order),
    [classes],
  );
  const activeSections = useMemo(
    () =>
      [...sections]
        .filter((s) => s.is_active === 'yes')
        .sort((a, b) => a.section_name.localeCompare(b.section_name)),
    [sections],
  );

  const classOptions = useMemo(
    () => toSelectOptions(activeClasses, (c) => c.class_name),
    [activeClasses],
  );
  const sectionOptions = useMemo(
    () => toSelectOptions(activeSections, (s) => s.section_name),
    [activeSections],
  );

  const hasClassSectionOptions = classOptions.length > 0 && sectionOptions.length > 0;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StudentAdmissionFormValues>({
    resolver: zodResolver(studentAdmissionSchema),
    defaultValues: {
      admission_no: '',
      admission_date: todayIsoDate(),
      firstname: '',
      middlename: '',
      lastname: '',
      gender: 'Male',
      dob: '',
      class_id: 0,
      section_id: 0,
      roll_no: '',
      mobileno: '',
      email: '',
      father_name: '',
      mother_name: '',
      guardian_name: '',
      guardian_phone: '',
      current_address: '',
      blood_group: '',
      religion: '',
      category_id: 'General',
      rte: 'No',
      is_active: true,
    },
  });

  useEffect(() => {
    if (!open) return;

    if (isEdit && student) {
      reset(studentToFormValues(student));
      return;
    }

    reset({
      admission_no: suggestedAdmissionNo,
      admission_date: todayIsoDate(),
      firstname: '',
      middlename: '',
      lastname: '',
      gender: 'Male',
      dob: '',
      class_id: activeClasses[0]?.id ?? 0,
      section_id: activeSections[0]?.id ?? 0,
      roll_no: '',
      mobileno: '',
      email: '',
      father_name: '',
      mother_name: '',
      guardian_name: '',
      guardian_phone: '',
      current_address: '',
      blood_group: '',
      religion: '',
      category_id: 'General',
      rte: 'No',
      is_active: true,
    });
  }, [open, isEdit, student, suggestedAdmissionNo, activeClasses, activeSections, reset]);

  return (
    <EntityFormDialog
      open={open}
      onOpenChange={onOpenChange}
      isEdit={isEdit}
      isLoading={isLoading}
      title={isEdit ? 'Edit student' : 'Admit student'}
      description={
        isEdit
          ? 'Update student details. Required fields are marked with an asterisk.'
          : 'Register a new student. Required fields are marked with an asterisk.'
      }
      submitLabel={isEdit ? 'Save changes' : 'Admit student'}
      submitDisabled={!hasClassSectionOptions}
      onSubmit={handleSubmit(onSubmit)}
      size="lg"
      scrollable
    >
      <FormErrorSummary errors={errors} />

      {!hasClassSectionOptions && (
        <p className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
          Add at least one active class and section before admitting a student.
        </p>
      )}

      <FormSection title="Admission">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormTextField
            control={control}
            name="admission_no"
            label="Admission number"
            required
            disabled={isEdit}
          />
          <FormDateField control={control} name="admission_date" label="Admission date" required />
        </div>
      </FormSection>

      <FormSection title="Personal details">
        <div className="grid gap-4 sm:grid-cols-3">
          <FormTextField control={control} name="firstname" label="First name" required />
          <FormTextField control={control} name="middlename" label="Middle name" optional />
          <FormTextField control={control} name="lastname" label="Last name" required />
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
          <FormTextField control={control} name="mobileno" label="Mobile" optional />
        </div>
        <FormTextField control={control} name="email" label="Email" type="email" optional />
      </FormSection>

      <FormSection title="Academic assignment">
        <div className="grid gap-4 sm:grid-cols-3">
          <FormField label="Class" htmlFor="class_id" error={errors.class_id?.message} required>
            <Controller
              name="class_id"
              control={control}
              render={({ field }) => (
                <Select
                  id="class_id"
                  placeholder="Select class"
                  options={classOptions}
                  value={field.value ? String(field.value) : ''}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  disabled={!hasClassSectionOptions}
                />
              )}
            />
          </FormField>
          <FormField label="Section" htmlFor="section_id" error={errors.section_id?.message} required>
            <Controller
              name="section_id"
              control={control}
              render={({ field }) => (
                <Select
                  id="section_id"
                  placeholder="Select section"
                  options={sectionOptions}
                  value={field.value ? String(field.value) : ''}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  disabled={!hasClassSectionOptions}
                />
              )}
            />
          </FormField>
          <FormTextField control={control} name="roll_no" label="Roll number" optional />
        </div>
      </FormSection>

      <FormSection title="Parents Details">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormTextField control={control} name="father_name" label="Father's name" optional />
          <FormTextField control={control} name="mother_name" label="Mother's name" optional />
        </div>
      </FormSection>

      <FormSection title="Guardian">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormTextField control={control} name="guardian_name" label="Guardian's name" optional />
          <FormTextField control={control} name="guardian_phone" label="Guardian phone" optional />
        </div>
      </FormSection>

      <FormSection title="Additional">
        <div className="grid gap-4 sm:grid-cols-3">
          <FormSelectField
            control={control}
            name="blood_group"
            label="Blood group"
            options={bloodGroupOptions}
            optional
          />
          <FormSelectField
            control={control}
            name="category_id"
            label="Category"
            options={categoryOptions}
            optional
          />
          <FormSelectField control={control} name="rte" label="RTE" options={rteOptions} required />
        </div>
        <FormTextField control={control} name="religion" label="Religion" optional />
        <FormTextareaField
          control={control}
          name="current_address"
          label="Current address"
          rows={2}
          optional
        />
        <FormSwitchField control={control} name="is_active" label="Active enrollment" />
      </FormSection>
    </EntityFormDialog>
  );
}
