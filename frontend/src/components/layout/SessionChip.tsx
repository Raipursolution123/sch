import { CalendarDays } from 'lucide-react';
import { Badge } from '@components/ui/badge';
import { useActiveSession } from '@hooks/useSessions';

export function SessionChip() {
  const { data: activeSession, isLoading } = useActiveSession();

  if (isLoading) {
    return (
      <Badge variant="outline" className="gap-1 font-normal">
        <CalendarDays className="h-3 w-3" aria-hidden="true" />
        Loading session...
      </Badge>
    );
  }

  if (!activeSession) {
    return (
      <Badge variant="outline" className="gap-1 font-normal text-muted-foreground">
        <CalendarDays className="h-3 w-3" aria-hidden="true" />
        No active session
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className="gap-1 font-normal">
      <CalendarDays className="h-3 w-3" aria-hidden="true" />
      Session: {activeSession.session}
    </Badge>
  );
}
