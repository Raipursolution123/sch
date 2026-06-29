import type { StaffDetail } from '@app-types/staff/staff';
import { StatusBadge } from '@components/feedback/StatusBadge';
import { SettingsCard } from '@components/forms/SettingsCard';
import { formatDepartmentDesignation, getStaffInitials } from '@utils/staff';
import { formatGender } from '@utils/student';
import { formatDate } from '@utils/format';

interface StaffOverviewTabProps {
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

export function StaffOverviewTab({ staff }: StaffOverviewTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-lg border bg-card p-6 sm:flex-row sm:items-center">
        <div
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary"
          aria-hidden="true"
        >
          {getStaffInitials(staff)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-semibold text-foreground">{staff.full_name}</h2>
            <StatusBadge isActive={staff.is_active} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {staff.employee_id} ·{' '}
            {formatDepartmentDesignation(staff.department_name, staff.designation_name)}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SettingsCard title="Personal details">
          <dl className="grid gap-4 sm:grid-cols-2">
            <DetailItem label="Date of birth" value={formatDate(staff.dob)} />
            <DetailItem label="Gender" value={formatGender(staff.gender)} />
            <DetailItem label="Marital status" value={staff.marital_status} />
            <DetailItem label="Email" value={staff.email} />
            <DetailItem label="Contact" value={staff.contact_no} />
            <DetailItem label="Emergency contact" value={staff.emergency_contact_no} />
          </dl>
        </SettingsCard>

        <SettingsCard title="Employment">
          <dl className="grid gap-4 sm:grid-cols-2">
            <DetailItem label="Department" value={staff.department_name} />
            <DetailItem label="Designation" value={staff.designation_name} />
            <DetailItem label="Contract type" value={staff.contract_type} />
            <DetailItem label="Joined on" value={formatDate(staff.date_of_joining)} />
            <DetailItem label="Qualification" value={staff.qualification} />
            <DetailItem label="Experience" value={staff.work_exp} />
          </dl>
        </SettingsCard>

        <SettingsCard title="Family" className="lg:col-span-2">
          <dl className="grid gap-4 sm:grid-cols-2">
            <DetailItem label="Father" value={staff.father_name} />
            <DetailItem label="Mother" value={staff.mother_name} />
          </dl>
        </SettingsCard>

        <SettingsCard title="Address" className="lg:col-span-2">
          <dl className="grid gap-4 sm:grid-cols-2">
            <DetailItem label="Local address" value={staff.local_address} />
            <DetailItem label="Permanent address" value={staff.permanent_address} />
          </dl>
        </SettingsCard>
      </div>
    </div>
  );
}
