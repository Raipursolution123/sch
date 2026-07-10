import { Pencil, Plus, Trash2 } from 'lucide-react';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { TIMETABLE_DAYS, type TimetableDay, type TimetablePeriod } from '@app-types/academics/timetable';
import { cn } from '@utils/cn';

interface TimetableGridProps {
  periods: TimetablePeriod[];
  onAdd: (day: TimetableDay) => void;
  onEdit: (period: TimetablePeriod) => void;
  onDelete: (period: TimetablePeriod) => void;
}

function formatTimeRange(period: TimetablePeriod): string {
  if (period.time_from && period.time_to) {
    return `${period.time_from} – ${period.time_to}`;
  }
  if (period.start_time && period.end_time) {
    return `${period.start_time.slice(0, 5)} – ${period.end_time.slice(0, 5)}`;
  }
  return '—';
}

function periodsForDay(periods: TimetablePeriod[], day: TimetableDay): TimetablePeriod[] {
  return periods
    .filter((p) => p.day === day)
    .sort((a, b) => (a.start_time ?? '').localeCompare(b.start_time ?? ''));
}

export function TimetableGrid({ periods, onAdd, onEdit, onDelete }: TimetableGridProps) {
  return (
    <div className="grid gap-3 lg:grid-cols-7 md:grid-cols-2">
      {TIMETABLE_DAYS.map((day) => {
        const dayPeriods = periodsForDay(periods, day);
        return (
          <div key={day} className="flex min-h-[12rem] flex-col rounded-lg border bg-card">
            <div className="flex items-center justify-between border-b px-3 py-2">
              <h3 className="text-sm font-semibold">{day}</h3>
              <PermissionButton
                permission="timetable.create"
                variant="ghost"
                size="sm"
                className="h-7 px-2"
                onClick={() => onAdd(day)}
                aria-label={`Add period on ${day}`}
              >
                <Plus className="h-4 w-4" />
              </PermissionButton>
            </div>
            <div className="flex flex-1 flex-col gap-2 p-2">
              {dayPeriods.length === 0 ? (
                <p className="text-xs text-muted-foreground">No periods</p>
              ) : (
                dayPeriods.map((period) => (
                  <div
                    key={period.id}
                    className={cn(
                      'rounded-md border bg-muted/30 p-2 text-xs shadow-sm',
                      'hover:bg-muted/50',
                    )}
                  >
                    <div className="font-medium">{period.subject_name ?? 'Subject'}</div>
                    <div className="text-muted-foreground">{formatTimeRange(period)}</div>
                    <div className="truncate text-muted-foreground">
                      {period.staff_name ?? 'Teacher'}
                    </div>
                    {period.room_no ? (
                      <div className="text-muted-foreground">Room {period.room_no}</div>
                    ) : null}
                    <div className="mt-2 flex gap-1">
                      <PermissionButton
                        permission="timetable.edit"
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2"
                        onClick={() => onEdit(period)}
                        aria-label="Edit period"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </PermissionButton>
                      <PermissionButton
                        permission="timetable.delete"
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-destructive hover:text-destructive"
                        onClick={() => onDelete(period)}
                        aria-label="Delete period"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </PermissionButton>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
