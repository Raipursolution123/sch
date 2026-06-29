import { Badge } from '@components/ui/badge';
import type { AttendanceStatusKey } from '@app-types/attendance/attendance';

const STATUS_VARIANT: Record<
  AttendanceStatusKey,
  'success' | 'destructive' | 'secondary' | 'outline' | 'muted'
> = {
  present: 'success',
  absent: 'destructive',
  late: 'outline',
  half_day: 'secondary',
  holiday: 'muted',
};

export function AttendanceStatusBadge({
  label,
  statusKey,
}: {
  label: string;
  statusKey: AttendanceStatusKey;
}) {
  return <Badge variant={STATUS_VARIANT[statusKey]}>{label}</Badge>;
}
