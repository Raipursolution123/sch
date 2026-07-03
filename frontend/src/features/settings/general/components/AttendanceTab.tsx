import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Select } from '@components/ui/select';
import { FormField } from '@components/forms/FormField';
import { SettingsCard } from '@components/forms/SettingsCard';
import { CLASS_TEACHER_OPTIONS } from '@features/settings/general/constants/options';
import {
  attendanceSettingsSchema,
  type AttendanceSettingsFormValues,
} from '@features/settings/general/schemas/general-settings.schema';
import type { AttendanceSettingsPayload, GeneralSettings } from '@app-types/settings/general';

interface AttendanceTabProps {
  settings: GeneralSettings;
  onSave: (payload: AttendanceSettingsPayload) => void;
  isSaving: boolean;
}

export function AttendanceTab({ settings, onSave, isSaving }: AttendanceTabProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<AttendanceSettingsFormValues>({
    resolver: zodResolver(attendanceSettingsSchema),
    defaultValues: {
      attendence_type: settings.attendence_type,
      low_attendance_limit: settings.low_attendance_limit,
      class_teacher: settings.class_teacher as 'enabled' | 'disabled',
    },
  });

  useEffect(() => {
    reset({
      attendence_type: settings.attendence_type,
      low_attendance_limit: settings.low_attendance_limit,
      class_teacher: settings.class_teacher as 'enabled' | 'disabled',
    });
  }, [settings, reset]);

  return (
    <form onSubmit={handleSubmit(onSave)} noValidate>
      <SettingsCard
        title="Attendance Settings"
        description="Configure attendance rules and class teacher workflow."
        footer={
          <Button type="submit" isLoading={isSaving} disabled={!isDirty && !isSaving}>
            Save changes
          </Button>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="Attendance type ID"
            htmlFor="attendence_type"
            error={errors.attendence_type?.message}
            hint="Maps to legacy attendance type configuration."
          >
            <Input
              id="attendence_type"
              type="number"
              min={0}
              {...register('attendence_type', { valueAsNumber: true })}
            />
          </FormField>
          <FormField
            label="Low attendance limit (%)"
            htmlFor="low_attendance_limit"
            error={errors.low_attendance_limit?.message}
            required
          >
            <Input
              id="low_attendance_limit"
              type="number"
              min={0}
              max={100}
              step={0.1}
              {...register('low_attendance_limit', { valueAsNumber: true })}
            />
          </FormField>
          <FormField label="Class teacher module" error={errors.class_teacher?.message} required>
            <Select
              options={[...CLASS_TEACHER_OPTIONS]}
              error={errors.class_teacher?.message}
              {...register('class_teacher')}
            />
          </FormField>
        </div>
      </SettingsCard>
    </form>
  );
}
