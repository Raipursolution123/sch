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
import {
  firstSectionIdForClass,
  sectionOptionsForClass,
} from '@features/students/utils/class-section-options';
import { studentToFormValues } from '@features/students/utils/student-payload';
import { useClassSections } from '@hooks/useClassSections';
import { todayIsoDate } from '@utils/student';

interface StudentAdmissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classes: SchoolClass[];
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
  suggestedAdmissionNo = '',
  student = null,
  onSubmit,
  isLoading,
}: StudentAdmissionDialogProps) {
  const isEdit = student != null;
  const { data: classSectionsData, isLoading: mappingsLoading } = useClassSections(1, {
    enabled: open,
  });

  const activeMappings = useMemo(
    () => (classSectionsData?.results ?? []).filter((m) => m.is_active === 'yes'),
    [classSectionsData],
  );

  const admissibleClassIds = useMemo(
    () => new Set(activeMappings.map((m) => m.class_id)),
    [activeMappings],
  );

  const activeClasses = useMemo(() => {
    const filtered = classes
      .filter((c) => c.is_active === 'yes' && admissibleClassIds.has(c.id))
      .sort((a, b) => a.sort_order - b.sort_order);

    if (
      isEdit &&
      student?.class_id &&
      student.class_name &&
      !filtered.some((c) => c.id === student.class_id)
    ) {
      return [
        ...filtered,
        {
          id: student.class_id,
          class_name: student.class_name,
          is_active: 'yes' as const,
          sort_order: 0,
          created_at: '',
          updated_at: null,
        },
      ];
    }

    return filtered;
  }, [classes, admissibleClassIds, isEdit, student]);

  const classOptions = useMemo(
    () => toSelectOptions(activeClasses, (c) => c.class_name),
    [activeClasses],
  );

  const hasClassSectionOptions = classOptions.length > 0 && activeMappings.length > 0;

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
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

  const selectedClassId = watch('class_id');
  const selectedSectionId = watch('section_id');

  const sectionOptions = useMemo(() => {
    if (!selectedClassId) return [];
    return sectionOptionsForClass(
      activeMappings,
      selectedClassId,
      isEdit && student
        ? { section_id: student.section_id ?? 0, section_name: student.section_name }
        : undefined,
    );
  }, [activeMappings, selectedClassId, isEdit, student]);

  useEffect(() => {
    if (!open || !selectedClassId || sectionOptions.length === 0) return;

    const validSectionIds = new Set(sectionOptions.map((o) => Number(o.value)));
    if (!validSectionIds.has(selectedSectionId)) {
      setValue('section_id', Number(sectionOptions[0].value));
    }
  }, [open, selectedClassId, selectedSectionId, sectionOptions, setValue]);

  useEffect(() => {
    if (!open) return;

    if (isEdit && student) {
      reset(studentToFormValues(student));
      return;
    }

    const defaultClassId = activeClasses[0]?.id ?? 0;
    const defaultSectionId = defaultClassId
      ? (firstSectionIdForClass(activeMappings, defaultClassId) ?? 0)
      : 0;

    reset({
      admission_no: suggestedAdmissionNo,
      admission_date: todayIsoDate(),
      firstname: '',
      middlename: '',
      lastname: '',
      gender: 'Male',
      dob: '',
      class_id: defaultClassId,
      section_id: defaultSectionId,
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
  }, [open, isEdit, student, suggestedAdmissionNo, activeClasses, activeMappings, reset]);

  const sectionSelectDisabled =
    !hasClassSectionOptions || !selectedClassId || sectionOptions.length === 0;

  return (
    <EntityFormDialog
      open={open}
      onOpenChange={onOpenChange}
      isEdit={isEdit}
      isLoading={isLoading || mappingsLoading}
      title={isEdit ? 'Edit student' : 'Admit student'}
      description={
        isEdit
          ? 'Update student details. Required fields are marked with an asterisk.'
          : 'Register a new student. Required fields are marked with an asterisk.'
      }
      submitLabel={isEdit ? 'Save changes' : 'Admit student'}
      submitDisabled={!hasClassSectionOptions || sectionSelectDisabled}
      onSubmit={handleSubmit(onSubmit)}
      size="lg"
      scrollable
    >
      <FormErrorSummary errors={errors} />

      {!hasClassSectionOptions && !mappingsLoading && (
        <p className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
          Assign at least one active class section under Academics → Class Sections before admitting
          a student.
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
                  onChange={(e) => {
                    const newClassId = Number(e.target.value);
                    field.onChange(newClassId);
                    const nextSectionId = firstSectionIdForClass(activeMappings, newClassId);
                    setValue('section_id', nextSectionId ?? 0);
                  }}
                  disabled={!hasClassSectionOptions}
                />
              )}
            />
          </FormField>
          <FormField
            label="Section"
            htmlFor="section_id"
            error={errors.section_id?.message}
            required
          >
            <Controller
              name="section_id"
              control={control}
              render={({ field }) => (
                <Select
                  id="section_id"
                  placeholder={selectedClassId ? 'Select section' : 'Select a class first'}
                  options={sectionOptions}
                  value={field.value ? String(field.value) : ''}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  disabled={sectionSelectDisabled}
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
