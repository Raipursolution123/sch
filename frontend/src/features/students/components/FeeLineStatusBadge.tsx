import { Badge } from '@components/ui/badge';
import type { StudentFeeLineStatus } from '@app-types/students/student-fees';

const STATUS_CONFIG: Record<
  StudentFeeLineStatus,
  { label: string; variant: 'success' | 'secondary' | 'outline' | 'destructive' }
> = {
  paid: { label: 'Paid', variant: 'success' },
  partial: { label: 'Partial', variant: 'outline' },
  pending: { label: 'Pending', variant: 'secondary' },
  overdue: { label: 'Overdue', variant: 'destructive' },
};

export function FeeLineStatusBadge({ status }: { status: StudentFeeLineStatus }) {
  const config = STATUS_CONFIG[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
