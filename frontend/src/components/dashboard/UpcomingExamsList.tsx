import { CalendarDays, Clock, MapPin } from 'lucide-react';
import type { UpcomingExam } from '@app-types/dashboard/dashboard';
import { Badge } from '@components/ui/badge';
import { cn } from '@utils/cn';
import { formatDate } from '@utils/format';

interface UpcomingExamsListProps {
  items: UpcomingExam[];
  className?: string;
}

export function UpcomingExamsList({ items, className }: UpcomingExamsListProps) {
  return (
    <ul className={cn('space-y-3', className)}>
      {items.map((exam, index) => (
        <li
          key={exam.id}
          className="flex gap-4 rounded-lg border border-border/70 bg-muted/20 p-4 transition-colors hover:bg-muted/40"
        >
          <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary">
            <span className="text-xs font-semibold uppercase">
              {new Date(exam.date).toLocaleDateString(undefined, { month: 'short' })}
            </span>
            <span className="text-lg font-bold leading-none">{new Date(exam.date).getDate()}</span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium text-foreground">{exam.subject}</p>
              {index === 0 && <Badge variant="success">Next up</Badge>}
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">{exam.exam}</p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                {formatDate(exam.date)}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                {exam.time}
              </span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                Room {exam.room}
              </span>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
