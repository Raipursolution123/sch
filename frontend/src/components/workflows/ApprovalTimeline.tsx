import type { WorkflowEvent } from '@app-types/workflow';
import { formatDate } from '@utils/format';
import { cn } from '@utils/cn';

interface ApprovalTimelineProps {
  events: WorkflowEvent[];
  className?: string;
}

export function ApprovalTimeline({ events, className }: ApprovalTimelineProps) {
  if (events.length === 0) {
    return <p className="text-sm text-muted-foreground">No approval activity yet.</p>;
  }

  return (
    <ol className={cn('space-y-4', className)}>
      {events.map((event, index) => (
        <li key={event.id} className="relative pl-6">
          {index < events.length - 1 && (
            <span
              className="absolute left-[7px] top-5 h-[calc(100%+0.5rem)] w-px bg-border"
              aria-hidden="true"
            />
          )}
          <span
            className="absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-primary bg-card"
            aria-hidden="true"
          />
          <div>
            <p className="text-sm font-medium text-foreground capitalize">
              {event.status.replace('_', ' ')}
              <span className="font-normal text-muted-foreground">
                {' '}
                · {event.actorName}
                {event.actorRole ? ` (${event.actorRole})` : ''}
              </span>
            </p>
            <p className="text-xs text-muted-foreground">{formatDate(event.timestamp)}</p>
            {event.note && <p className="mt-1 text-sm text-muted-foreground">{event.note}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}
