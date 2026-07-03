import { Link } from 'react-router-dom';
import { SettingsCard } from '@components/forms/SettingsCard';
import { LoadingState } from '@components/feedback/LoadingState';
import type { StudentDetail } from '@app-types/students/student';
import { ROUTES } from '@constants/index';
import { useSessions } from '@hooks/useSessions';
import { formatClassSection } from '@utils/student';
import { formatDate } from '@utils/format';

interface StudentAcademicTabProps {
  student: StudentDetail;
}

function DetailItem({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm text-foreground">{value?.trim() ? value : '—'}</dd>
    </div>
  );
}

export function StudentAcademicTab({ student }: StudentAcademicTabProps) {
  const { data: sessions, isLoading } = useSessions();
  const activeSession = sessions?.find((s) => s.is_active === 'yes');

  if (isLoading) {
    return <LoadingState message="Loading academic details..." />;
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Current enrollment for{' '}
        <span className="font-medium text-foreground">{activeSession?.session ?? '—'}</span>. Class
        history and promotions will appear here when the academics module is extended.
      </p>

      <SettingsCard title="Current enrollment">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <DetailItem label="Academic session" value={activeSession?.session} />
          <DetailItem
            label="Class & section"
            value={formatClassSection(student.class_name, student.section_name)}
          />
          <DetailItem label="Roll number" value={student.roll_no?.toString() ?? null} />
          <DetailItem label="Admission number" value={student.admission_no} />
          <DetailItem label="Admission date" value={formatDate(student.admission_date)} />
          <DetailItem label="Enrolled since" value={formatDate(student.created_at)} />
        </dl>
      </SettingsCard>

      <SettingsCard title="Quick links">
        <ul className="space-y-2 text-sm">
          <li>
            <Link
              to={ROUTES.academics.classes}
              className="font-medium text-primary hover:underline"
            >
              Manage classes
            </Link>
          </li>
          <li>
            <Link
              to={ROUTES.academics.sections}
              className="font-medium text-primary hover:underline"
            >
              Manage sections
            </Link>
          </li>
          <li>
            <Link
              to={ROUTES.attendance.report}
              className="font-medium text-primary hover:underline"
            >
              View attendance report
            </Link>
          </li>
        </ul>
      </SettingsCard>
    </div>
  );
}
