import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormNumberField, FormSelectField } from '@components/forms/fields';
import { SettingsCard } from '@components/forms/SettingsCard';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { useUnsavedChangesWarning } from '@hooks/useUnsavedChangesWarning';
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
    control,
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

  const { navigationGuard } = useUnsavedChangesWarning(isDirty);

  useEffect(() => {
    reset({
      attendence_type: settings.attendence_type,
      low_attendance_limit: settings.low_attendance_limit,
      class_teacher: settings.class_teacher as 'enabled' | 'disabled',
    });
  }, [settings, reset]);

  return (
    <>
      {navigationGuard}
      <form onSubmit={handleSubmit(onSave)} noValidate>
        <SettingsCard
          title="Attendance Settings"
          description="Configure attendance rules and class teacher workflow."
          footer={
            <PermissionButton
              type="submit"
              permission="general_settings.edit"
              isLoading={isSaving}
              disabled={!isDirty && !isSaving}
            >
              Save changes
            </PermissionButton>
          }
        >
          <FormErrorSummary errors={errors} className="mb-2" />

          <div className="grid gap-4 sm:grid-cols-2">
            <FormNumberField
              control={control}
              name="attendence_type"
              label="Attendance type ID"
              hint="Maps to legacy attendance type configuration."
              min={0}
            />
            <FormNumberField
              control={control}
              name="low_attendance_limit"
              label="Low attendance limit (%)"
              required
              min={0}
              max={100}
              step={0.1}
            />
            <FormSelectField
              control={control}
              name="class_teacher"
              label="Class teacher module"
              options={[...CLASS_TEACHER_OPTIONS]}
              required
            />
          </div>
        </SettingsCard>
      </form>
    </>
  );
}
