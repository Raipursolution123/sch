import type { StaffDetail } from '@app-types/staff/staff';
import { StatusBadge } from '@components/feedback/StatusBadge';
import { SettingsCard } from '@components/forms/SettingsCard';
import { formatDate } from '@utils/format';

interface StaffEmploymentTabProps {
  staff: StaffDetail;
}

function DetailItem({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm text-foreground">{value?.trim() ? value : '—'}</dd>
    </div>
  );
}

export function StaffEmploymentTab({ staff }: StaffEmploymentTabProps) {
  return (
    <div className="space-y-6">
      <SettingsCard title="Role & department">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <DetailItem label="Employee ID" value={staff.employee_id} />
          <DetailItem label="Department" value={staff.department_name} />
          <DetailItem label="Designation" value={staff.designation_name} />
          <DetailItem label="Contract type" value={staff.contract_type} />
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Status
            </dt>
            <dd className="mt-1">
              <StatusBadge isActive={staff.is_active} />
            </dd>
          </div>
        </dl>
      </SettingsCard>

      <SettingsCard title="Tenure">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <DetailItem label="Date of joining" value={formatDate(staff.date_of_joining)} />
          <DetailItem label="Date of leaving" value={formatDate(staff.date_of_leaving)} />
          <DetailItem label="Qualification" value={staff.qualification} />
          <DetailItem label="Experience" value={staff.work_exp} />
        </dl>
      </SettingsCard>

      {staff.note?.trim() && (
        <SettingsCard title="Notes">
          <p className="text-sm text-muted-foreground">{staff.note}</p>
        </SettingsCard>
      )}
    </div>
  );
}
