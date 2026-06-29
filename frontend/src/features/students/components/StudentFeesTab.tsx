import { Link } from 'react-router-dom';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { LoadingState } from '@components/feedback/LoadingState';
import { ErrorState } from '@components/feedback/ErrorState';
import { SettingsCard } from '@components/forms/SettingsCard';
import { FeeLineStatusBadge } from '@features/students/components/FeeLineStatusBadge';
import { useStudentFees } from '@hooks/useStudentFees';
import { ROUTES } from '@constants/index';
import type { StudentDetail } from '@app-types/students/student';
import type { StudentFeeLine, StudentFeePayment } from '@app-types/students/student-fees';
import { formatAmount, formatDate } from '@utils/format';
import { formatClassSection } from '@utils/student';

interface StudentFeesTabProps {
  student: StudentDetail;
}

const lineColumns: DataTableColumn<StudentFeeLine>[] = [
  {
    id: 'feetype',
    header: 'Fee type',
    cellClassName: 'font-medium',
    cell: (row) => (
      <div>
        <span>{row.feetype_name}</span>
        <p className="text-xs font-normal text-muted-foreground">{row.feetype_code}</p>
      </div>
    ),
  },
  {
    id: 'group',
    header: 'Group',
    cellClassName: 'text-muted-foreground',
    cell: (row) => row.fee_group_name,
  },
  {
    id: 'amount',
    header: 'Amount',
    cellClassName: 'tabular-nums',
    cell: (row) => formatAmount(row.amount),
  },
  {
    id: 'paid',
    header: 'Paid',
    cellClassName: 'tabular-nums text-muted-foreground',
    cell: (row) => formatAmount(row.amount_paid),
  },
  {
    id: 'balance',
    header: 'Balance',
    cellClassName: 'tabular-nums',
    cell: (row) => formatAmount(row.balance),
  },
  {
    id: 'due_date',
    header: 'Due',
    cellClassName: 'text-muted-foreground',
    cell: (row) => formatDate(row.due_date),
  },
  {
    id: 'status',
    header: 'Status',
    cell: (row) => <FeeLineStatusBadge status={row.status} />,
  },
];

const paymentColumns: DataTableColumn<StudentFeePayment>[] = [
  {
    id: 'date',
    header: 'Date',
    cellClassName: 'text-muted-foreground',
    cell: (row) => formatDate(row.date),
  },
  {
    id: 'feetype',
    header: 'Fee type',
    cell: (row) => row.feetype_name ?? '—',
  },
  {
    id: 'amount',
    header: 'Amount',
    cellClassName: 'tabular-nums font-medium',
    cell: (row) => formatAmount(row.amount),
  },
  {
    id: 'mode',
    header: 'Mode',
    cellClassName: 'text-muted-foreground',
    cell: (row) => row.payment_mode,
  },
  {
    id: 'description',
    header: 'Note',
    cellClassName: 'text-muted-foreground max-w-xs truncate',
    cell: (row) => row.description ?? '—',
  },
];

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums text-foreground">{value}</p>
    </div>
  );
}

export function StudentFeesTab({ student }: StudentFeesTabProps) {
  const { data: fees, isLoading, isError, error, refetch } = useStudentFees(student.id);

  if (isLoading) {
    return <LoadingState message="Loading fee details..." />;
  }

  if (isError || !fees) {
    return (
      <ErrorState
        message={error instanceof Error ? error.message : 'Could not load fee details'}
        onRetry={() => void refetch()}
      />
    );
  }

  const hasLines = fees.lines.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">
            {fees.session_name} ·{' '}
            {formatClassSection(fees.class_name, fees.section_name)}
          </p>
        </div>
        <Link
          to={ROUTES.fees.assign}
          className="text-sm font-medium text-primary hover:underline"
        >
          Manage fee assignments
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard label="Total due" value={formatAmount(fees.total_due)} />
        <SummaryCard label="Total paid" value={formatAmount(fees.total_paid)} />
        <SummaryCard label="Balance" value={formatAmount(fees.total_balance)} />
      </div>

      <SettingsCard title="Fee breakdown">
        {!hasLines ? (
          <p className="text-sm text-muted-foreground">
            No fee assignments for this student&apos;s class in the current session.{' '}
            <Link to={ROUTES.fees.assign} className="font-medium text-primary hover:underline">
              Assign fees
            </Link>{' '}
            to get started.
          </p>
        ) : (
          <DataTable
            data={fees.lines}
            columns={lineColumns}
            getRowKey={(line) => line.id}
          />
        )}
      </SettingsCard>

      <SettingsCard title="Payment history">
        {fees.payments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No payments recorded yet.</p>
        ) : (
          <DataTable
            data={fees.payments}
            columns={paymentColumns}
            getRowKey={(payment) => payment.id}
          />
        )}
      </SettingsCard>
    </div>
  );
}
