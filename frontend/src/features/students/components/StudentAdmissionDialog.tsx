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

function SectionHeading({ children }: { children: string }) {
  return <h3 className="border-b pb-2 text-sm font-semibold text-foreground">{children}</h3>;
}

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
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
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

  const isActive = watch('is_active');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col">
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Edit student' : 'Admit student'}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? 'Update student details. Required fields are marked with an asterisk.'
                : 'Register a new student. Required fields are marked with an asterisk.'}
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto py-4 pr-1">
            {!hasClassSectionOptions && (
              <p className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
                Add at least one active class and section before admitting a student.
              </p>
            )}

            <section className="space-y-4">
              <SectionHeading>Admission</SectionHeading>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  label="Admission number"
                  htmlFor="admission_no"
                  error={errors.admission_no?.message}
                  required
                >
                  <Input id="admission_no" readOnly={isEdit} {...register('admission_no')} />
                </FormField>
                <FormField
                  label="Admission date"
                  htmlFor="admission_date"
                  error={errors.admission_date?.message}
                  required
                >
                  <Input id="admission_date" type="date" {...register('admission_date')} />
                </FormField>
              </div>
            </section>

            <section className="space-y-4">
              <SectionHeading>Personal details</SectionHeading>
              <div className="grid gap-4 sm:grid-cols-3">
                <FormField
                  label="First name"
                  htmlFor="firstname"
                  error={errors.firstname?.message}
                  required
                >
                  <Input id="firstname" {...register('firstname')} />
                </FormField>
                <FormField
                  label="Middle name"
                  htmlFor="middlename"
                  error={errors.middlename?.message}
                >
                  <Input id="middlename" {...register('middlename')} />
                </FormField>
                <FormField
                  label="Last name"
                  htmlFor="lastname"
                  error={errors.lastname?.message}
                  required
                >
                  <Input id="lastname" {...register('lastname')} />
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
                        options={GENDER_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    )}
                  />
                </FormField>
                <FormField label="Date of birth" htmlFor="dob" error={errors.dob?.message} required>
                  <Input id="dob" type="date" {...register('dob')} />
                </FormField>
                <FormField label="Mobile" htmlFor="mobileno" error={errors.mobileno?.message}>
                  <Input id="mobileno" inputMode="numeric" {...register('mobileno')} />
                </FormField>
              </div>
              <FormField label="Email" htmlFor="email" error={errors.email?.message}>
                <Input id="email" type="email" {...register('email')} />
              </FormField>
            </section>

            <section className="space-y-4">
              <SectionHeading>Academic assignment</SectionHeading>
              <div className="grid gap-4 sm:grid-cols-3">
                <FormField
                  label="Class"
                  htmlFor="class_id"
                  error={errors.class_id?.message}
                  required
                >
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
                        placeholder="Select section"
                        options={sectionOptions}
                        value={field.value ? String(field.value) : ''}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        disabled={!hasClassSectionOptions}
                      />
                    )}
                  />
                </FormField>
                <FormField label="Roll number" htmlFor="roll_no" error={errors.roll_no?.message}>
                  <Input id="roll_no" inputMode="numeric" {...register('roll_no')} />
                </FormField>
              </div>
            </section>

            <section className="space-y-4">
              <SectionHeading>Parents Details</SectionHeading>
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

              <SectionHeading>Guardian</SectionHeading>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  label="Guardian's name"
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
                  <Input id="guardian_phone" inputMode="numeric" {...register('guardian_phone')} />
                </FormField>
              </div>
            </section>

            <section className="space-y-4">
              <SectionHeading>Additional</SectionHeading>
              <div className="grid gap-4 sm:grid-cols-3">
                <FormField
                  label="Blood group"
                  htmlFor="blood_group"
                  error={errors.blood_group?.message}
                >
                  <Controller
                    name="blood_group"
                    control={control}
                    render={({ field }) => (
                      <Select
                        id="blood_group"
                        placeholder="Select"
                        options={[
                          { value: '', label: 'Not specified' },
                          ...BLOOD_GROUP_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
                        ]}
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    )}
                  />
                </FormField>
                <FormField
                  label="Category"
                  htmlFor="category_id"
                  error={errors.category_id?.message}
                >
                  <Controller
                    name="category_id"
                    control={control}
                    render={({ field }) => (
                      <Select
                        id="category_id"
                        options={CATEGORY_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    )}
                  />
                </FormField>
                <FormField label="RTE" htmlFor="rte" error={errors.rte?.message} required>
                  <Controller
                    name="rte"
                    control={control}
                    render={({ field }) => (
                      <Select
                        id="rte"
                        options={RTE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    )}
                  />
                </FormField>
              </div>
              <FormField label="Religion" htmlFor="religion" error={errors.religion?.message}>
                <Input id="religion" {...register('religion')} />
              </FormField>
              <FormField
                label="Current address"
                htmlFor="current_address"
                error={errors.current_address?.message}
              >
                <Textarea id="current_address" rows={2} {...register('current_address')} />
              </FormField>
              <FormField label="Active enrollment">
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
            </section>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading} disabled={!hasClassSectionOptions}>
              {isEdit ? 'Save changes' : 'Admit student'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
