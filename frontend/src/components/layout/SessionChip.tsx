import { CalendarDays } from 'lucide-react';
import { Badge } from '@components/ui/badge';
import { useActiveSession } from '@hooks/useSessions';
import { cn } from '@utils/cn';

interface SessionChipProps {
  /** Icon + short label on xs; fuller label from sm. */
  compact?: boolean;
}

export function SessionChip({ compact = false }: SessionChipProps) {
  const { data: activeSession, isLoading } = useActiveSession();

  const label = isLoading
    ? 'Loading session'
    : activeSession
      ? `Session: ${activeSession.session}`
      : 'No active session';

  const shortLabel = isLoading ? '…' : activeSession ? activeSession.session : '—';

  return (
    <Badge
      variant={activeSession ? 'secondary' : 'outline'}
      className={cn(
        'max-w-[9rem] gap-1 font-normal sm:max-w-none',
        !activeSession && 'text-muted-foreground',
        compact && 'px-2',
      )}
      title={label}
    >
      <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span className="truncate text-xs sm:hidden">{shortLabel}</span>
      <span className="hidden truncate sm:inline">{label}</span>
    </Badge>
  );
}
