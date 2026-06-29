import { Badge } from '@components/ui/badge';
import type { ActiveFlag } from '@app-types/settings/session';

interface StatusBadgeProps {
  isActive: ActiveFlag;
}

export function StatusBadge({ isActive }: StatusBadgeProps) {
  const active = isActive === 'yes';
  return (
    <Badge variant={active ? 'success' : 'muted'}>{active ? 'Active' : 'Inactive'}</Badge>
  );
}
