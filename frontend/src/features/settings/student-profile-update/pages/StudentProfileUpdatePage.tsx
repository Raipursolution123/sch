import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PageHeader } from '@components/layout/PageHeader';
import { ErrorState } from '@components/feedback/ErrorState';
import { LoadingState } from '@components/feedback/LoadingState';
import { SettingsCard } from '@components/forms/SettingsCard';
import { Switch } from '@components/ui/switch';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { useGeneralSettings, useUpdateGeneralSettings } from '@hooks/useGeneralSettings';
import { studentProfileUpdateService } from '@services/api/student-profile-update.service';
import { getApiErrorMessage } from '@utils/session';

const formatFieldName = (name: string): string => {
  const customMap: Record<string, string> = {
    roll_no: 'Roll Number',
    student_photo: 'Student Photo',
    mobile_no: 'Mobile Number',
    student_email: 'Student Email',
    guardian_name: 'Guardian Name',
    guardian_relation: 'Guardian Relation',
    guardian_phone: 'Guardian Phone',
    guardian_email: 'Guardian Email',
    guardian_pic: 'Guardian Photo',
    guardian_occupation: 'Guardian Occupation',
    guardian_address: 'Guardian Address',
    current_address: 'Current Address',
    permanent_address: 'Permanent Address',
    bank_account_no: 'Bank Account Number',
    ifsc_code: 'IFSC Code',
    bank_name: 'Bank Name',
    national_identification_no: 'National Identification Number',
    local_identification_no: 'Local Identification Number',
    previous_school_details: 'Previous School Details',
    student_note: 'Student Note',
    upload_documents: 'Upload Documents',
  };
  return customMap[name] || name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

export function StudentProfileUpdatePage() {
  const queryClient = useQueryClient();
  
  // General setting toggle
  const { data: settings, isLoading: isSettingsLoading, isError: isSettingsError, error: settingsError, refetch: refetchSettings } = useGeneralSettings();
  const updateGeneralMutation = useUpdateGeneralSettings();
  
  // Individual fields list
  const { data: dbFields, isLoading: isFieldsLoading, isError: isFieldsError, error: fieldsError, refetch: refetchFields } = useQuery({
    queryKey: ['settings', 'student-profile-update-fields'],
    queryFn: studentProfileUpdateService.getFields,
  });

  const updateFieldsMutation = useMutation({
    mutationFn: studentProfileUpdateService.updateFieldsBatch,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['settings', 'student-profile-update-fields'] });
    },
  });

  const [studentProfileEdit, setStudentProfileEdit] = useState(false);
  const [fieldsState, setFieldsState] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (settings) {
      setStudentProfileEdit(settings.student_profile_edit === 1);
    }
  }, [settings]);

  useEffect(() => {
    if (dbFields) {
      const initial: Record<number, boolean> = {};
      dbFields.forEach((f) => {
        initial[f.id] = f.status === 1;
      });
      setFieldsState(initial);
    }
  }, [dbFields]);

  const handleToggleField = (id: number, checked: boolean) => {
    setFieldsState((prev) => ({ ...prev, [id]: checked }));
  };

  const isSettingsDirty = settings ? (settings.student_profile_edit === 1) !== studentProfileEdit : false;
  
  const isFieldsDirty = dbFields ? dbFields.some((f) => {
    const currentState = fieldsState[f.id] ?? false;
    const originalState = f.status === 1;
    return currentState !== originalState;
  }) : false;

  const isDirty = isSettingsDirty || isFieldsDirty;

  const isLoading = isSettingsLoading || isFieldsLoading;
  const isError = isSettingsError || isFieldsError;
  const error = settingsError || fieldsError;

  if (isLoading) {
    return <LoadingState message="Loading student profile settings..." />;
  }

  if (isError) {
    return (
      <ErrorState
        message={error ? String(error) : 'Could not load student profile settings'}
        onRetry={() => {
          void refetchSettings();
          void refetchFields();
        }}
      />
    );
  }

  const handleSave = async () => {
    try {
      if (isSettingsDirty) {
        await updateGeneralMutation.mutateAsync({
          student_profile_edit: studentProfileEdit ? 1 : 0,
        });
      }
      if (isFieldsDirty && dbFields) {
        const payload = dbFields.map((f) => ({
          id: f.id,
          status: fieldsState[f.id] ? 1 : 0,
        }));
        await updateFieldsMutation.mutateAsync(payload);
      }
      toast.success('Student profile update configurations saved successfully.');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to save settings'));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Profile Update"
        description="Configure whether students are allowed to edit their profile fields from the student portal."
        actions={
          <PermissionButton
            permission="settings.manage"
            isLoading={updateGeneralMutation.isPending || updateFieldsMutation.isPending}
            disabled={!isDirty}
            onClick={handleSave}
          >
            Save changes
          </PermissionButton>
        }
      />

      <SettingsCard
        title="Portal Editing Permissions"
        description="Allow or restrict students/parents from modifying their profile information."
      >
        <div className="space-y-6">
          <label
            htmlFor="allow-profile-edit"
            className="flex items-center justify-between gap-6 rounded-md border p-4 hover:bg-muted/50 cursor-pointer"
          >
            <div className="space-y-0.5">
              <span className="text-sm font-medium text-foreground">Allow Student Profile Edit</span>
              <p className="text-xs text-muted-foreground">
                When enabled, students and parents can edit their personal/contact details from the portal dashboard.
              </p>
            </div>
            <Switch
              id="allow-profile-edit"
              checked={studentProfileEdit}
              onCheckedChange={setStudentProfileEdit}
            />
          </label>

          {studentProfileEdit && dbFields && dbFields.length > 0 && (
            <div className="pt-4 border-t space-y-4">
              <h4 className="text-sm font-semibold text-foreground">Select Profile Fields Editable by Student</h4>
              <p className="text-xs text-muted-foreground">
                Only the checked fields below will be open for modification in the student portal dashboard.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                {dbFields.map((field) => (
                  <div
                    key={field.id}
                    className="flex items-center justify-between p-3 rounded-md border bg-card hover:bg-muted/30"
                  >
                    <span className="text-sm text-foreground">{formatFieldName(field.name)}</span>
                    <Switch
                      checked={fieldsState[field.id] ?? false}
                      onCheckedChange={(checked) => handleToggleField(field.id, checked)}
                      aria-label={`Toggle editable state for ${field.name}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </SettingsCard>
    </div>
  );
}
