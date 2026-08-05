import type { AttendanceStatusKey, AttendanceType } from '@app-types/attendance/attendance';
import { cn } from '@utils/cn';

const STATUS_SELECTED: Record<AttendanceStatusKey, string> = {
  present: 'border-success bg-success-pale text-success-deep',
  absent: 'border-destructive bg-destructive/15 text-destructive',
  late: 'border-warning bg-warning/20 text-warning-foreground',
  half_day: 'border-border bg-secondary text-secondary-foreground',
  holiday: 'border-border bg-muted text-muted-foreground',
};

interface AttendanceStatusChipsProps {
  types: AttendanceType[];
  value: number;
  onChange: (attendenceTypeId: number) => void;
  ariaLabel: string;
}

/** Tablet-friendly status toggles — min 44px touch targets. */
export function AttendanceStatusChips({
  types,
  value,
  onChange,
  ariaLabel,
}: AttendanceStatusChipsProps) {
  const active = types.filter((t) => t.is_active === 'yes');

  return (
    <div role="group" aria-label={ariaLabel} className="flex flex-wrap gap-1.5">
      {active.map((type) => {
        const selected = type.id === value;
        return (
          <button
            key={type.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(type.id)}
            className={cn(
              'inline-flex min-h-11 min-w-11 items-center justify-center rounded-sm border px-3 text-sm font-medium transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              selected
                ? STATUS_SELECTED[type.key]
                : 'border-border bg-card text-muted-foreground hover:bg-muted/60 hover:text-foreground',
            )}
          >
            {type.label}
          </button>
        );
      })}
    </div>
  );
}
