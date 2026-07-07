import type { StudentDetail } from '@app-types/students/student';
import { StatusBadge } from '@components/feedback/StatusBadge';
import { SettingsCard } from '@components/forms/SettingsCard';
import { formatClassSection, formatGender, getStudentInitials } from '@utils/student';
import { formatDate } from '@utils/format';

import { Button } from '@components/ui/button';
import { Pencil } from 'lucide-react';

interface StudentOverviewTabProps {
  student: StudentDetail;
  onEditClick: () => void;
}

function DetailItem({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm text-foreground">{value?.trim() ? value : '—'}</dd>
    </div>
  );
}

export function StudentOverviewTab({ student, onEditClick }: StudentOverviewTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-lg border bg-card p-6 sm:flex-row sm:items-center">
        <div
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary"
          aria-hidden="true"
        >
          {getStudentInitials(student)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-semibold text-foreground">{student.full_name}</h2>
            <StatusBadge isActive={student.is_active} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {student.admission_no} · {formatClassSection(student.class_name, student.section_name)}
          </p>
        </div>
        <div className="flex shrink-0 sm:ml-auto">
          <Button variant="outline" size="sm" onClick={onEditClick}>
            <Pencil className="mr-2 h-4 w-4" aria-hidden="true" />
            Edit details
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SettingsCard title="Personal details">
          <dl className="grid gap-4 sm:grid-cols-2">
            <DetailItem label="Date of birth" value={formatDate(student.dob)} />
            <DetailItem label="Gender" value={formatGender(student.gender)} />
            <DetailItem label="Blood group" value={student.blood_group} />
            <DetailItem label="Religion" value={student.religion} />
            <DetailItem label="Category" value={student.category_id} />
            <DetailItem label="RTE" value={student.rte} />
            <DetailItem label="Mobile" value={student.mobileno} />
            <DetailItem label="Email" value={student.email} />
          </dl>
        </SettingsCard>

        <SettingsCard title="Academic details">
          <dl className="grid gap-4 sm:grid-cols-2">
            <DetailItem label="Admission date" value={formatDate(student.admission_date)} />
            <DetailItem label="Roll number" value={student.roll_no?.toString() ?? null} />
            <DetailItem
              label="Class & section"
              value={formatClassSection(student.class_name, student.section_name)}
            />
            <DetailItem label="Enrolled since" value={formatDate(student.created_at)} />
          </dl>
        </SettingsCard>

        <SettingsCard title="Guardian" className="lg:col-span-2">
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <DetailItem label="Father" value={student.father_name} />
            <DetailItem label="Mother" value={student.mother_name} />
            <DetailItem label="Guardian" value={student.guardian_name} />
            <DetailItem label="Guardian phone" value={student.guardian_phone} />
          </dl>
        </SettingsCard>

        <SettingsCard title="Address" className="lg:col-span-2">
          <dl className="grid gap-4 sm:grid-cols-2">
            <DetailItem label="Current address" value={student.current_address} />
            <DetailItem label="Permanent address" value={student.permanent_address} />
          </dl>
        </SettingsCard>
      </div>
    </div>
  );
}
