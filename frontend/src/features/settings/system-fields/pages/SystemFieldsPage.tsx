import { useEffect, useState } from 'react';
import { SettingsCard } from '@components/forms/SettingsCard';
import { Switch } from '@components/ui/switch';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { useSystemFields, useUpdateSystemFields } from '@hooks/useAdvancedSettings';
import { ModuleSettingsPack } from '@workflow-packs';

function formatFieldLabel(key: string): string {
  const stripped = key.replace(/^is_/, '').replace(/^staff_/, '');
  return stripped
    .split('_')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function recordsEqual(a: Record<string, boolean>, b: Record<string, boolean>): boolean {
  const keys = Object.keys(a);
  if (keys.length !== Object.keys(b).length) return false;
  return keys.every((key) => a[key] === b[key]);
}

interface FieldGroupProps {
  title: string;
  description: string;
  fields: Record<string, boolean>;
  onToggle: (key: string, value: boolean) => void;
}

function FieldGroup({ title, description, fields, onToggle }: FieldGroupProps) {
  return (
    <SettingsCard title={title} description={description}>
      <div className="grid gap-x-4 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
        {Object.keys(fields)
          .sort()
          .map((key) => (
            <label
              key={key}
              htmlFor={`field-${key}`}
              className="flex items-center justify-between gap-3 rounded-sm border border-border px-3 py-2"
            >
              <span className="text-sm text-foreground">{formatFieldLabel(key)}</span>
              <Switch
                id={`field-${key}`}
                checked={fields[key]}
                onCheckedChange={(checked) => onToggle(key, checked)}
              />
            </label>
          ))}
      </div>
    </SettingsCard>
  );
}

export function SystemFieldsPage() {
  const { data, isLoading, isError, error, refetch } = useSystemFields();
  const updateMutation = useUpdateSystemFields();
  const [student, setStudent] = useState<Record<string, boolean>>({});
  const [staff, setStaff] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState('student');

  useEffect(() => {
    if (data) {
      setStudent(data.student);
      setStaff(data.staff);
    }
  }, [data]);

  const isDirty = data
    ? !recordsEqual(student, data.student) || !recordsEqual(staff, data.staff)
    : false;

  return (
    <ModuleSettingsPack
      title="System Fields"
      description="Choose which built-in student and staff profile fields are shown across the school ERP."
      headerActions={
        <PermissionButton
          permission="settings.manage"
          className="min-h-11"
          isLoading={updateMutation.isPending}
          disabled={!isDirty && !updateMutation.isPending}
          onClick={() => updateMutation.mutate({ student, staff })}
        >
          Save changes
        </PermissionButton>
      }
      isLoading={isLoading}
      loadingMessage="Loading system fields..."
      isError={isError || !data}
      error={error}
      onRetry={() => void refetch()}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      tabs={[
        {
          id: 'student',
          label: 'Student fields',
          content: (
            <FieldGroup
              title="Student Fields"
              description="Fields shown on student admission and profile forms."
              fields={student}
              onToggle={(key, value) => setStudent((prev) => ({ ...prev, [key]: value }))}
            />
          ),
        },
        {
          id: 'staff',
          label: 'Staff fields',
          content: (
            <FieldGroup
              title="Staff Fields"
              description="Fields shown on staff onboarding and profile forms."
              fields={staff}
              onToggle={(key, value) => setStaff((prev) => ({ ...prev, [key]: value }))}
            />
          ),
        },
      ]}
    />
  );
}
