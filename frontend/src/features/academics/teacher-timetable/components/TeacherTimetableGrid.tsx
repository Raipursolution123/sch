import {
  TIMETABLE_DAYS,
  type TimetableDay,
  type TimetablePeriod,
} from '@app-types/academics/timetable';
import { cn } from '@utils/cn';

interface TeacherTimetableGridProps {
  periods: TimetablePeriod[];
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

function classSectionLabel(period: TimetablePeriod): string {
  const className = period.class_name ?? 'Class';
  const sectionName = period.section_name ?? '';
  return sectionName ? `${className} ${sectionName}` : className;
}

function periodsForDay(periods: TimetablePeriod[], day: TimetableDay): TimetablePeriod[] {
  return periods
    .filter((p) => p.day === day)
    .sort((a, b) => (a.start_time ?? '').localeCompare(b.start_time ?? ''));
}

export function TeacherTimetableGrid({ periods }: TeacherTimetableGridProps) {
  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-7">
      {TIMETABLE_DAYS.map((day) => {
        const dayPeriods = periodsForDay(periods, day);
        return (
          <div key={day} className="flex min-h-[12rem] flex-col rounded-lg border bg-card">
            <div className="border-b px-3 py-2">
              <h3 className="text-sm font-semibold">{day}</h3>
            </div>
            <div className="flex flex-1 flex-col gap-2 p-2">
              {dayPeriods.length === 0 ? (
                <p className="text-xs text-muted-foreground">No periods</p>
              ) : (
                dayPeriods.map((period) => (
                  <div
                    key={period.id}
                    className={cn('rounded-md border bg-muted/30 p-2 text-xs shadow-sm')}
                  >
                    <div className="font-medium">{period.subject_name ?? 'Subject'}</div>
                    <div className="text-muted-foreground">{formatTimeRange(period)}</div>
                    <div className="truncate text-muted-foreground">
                      {classSectionLabel(period)}
                    </div>
                    {period.room_no ? (
                      <div className="text-muted-foreground">Room {period.room_no}</div>
                    ) : null}
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
