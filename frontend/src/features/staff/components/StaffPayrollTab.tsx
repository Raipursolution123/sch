import type { StaffDetail } from '@app-types/staff/staff';
import { SettingsCard } from '@components/forms/SettingsCard';
import { formatAmount } from '@utils/format';

interface StaffPayrollTabProps {
  staff: StaffDetail;
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm text-foreground">{value}</dd>
    </div>
  );
}

export function StaffPayrollTab({ staff }: StaffPayrollTabProps) {
  return (
    <div className="space-y-6">
      <SettingsCard title="Salary overview">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <DetailItem label="Basic salary" value={formatAmount(staff.basic_salary)} />
          <DetailItem label="Contract type" value={staff.contract_type} />
          <DetailItem
            label="Payroll status"
            value={staff.basic_salary != null ? 'Configured' : 'Not configured'}
          />
        </dl>
      </SettingsCard>
    </div>
  );
}
