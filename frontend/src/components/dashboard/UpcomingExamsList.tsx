import type { UpcomingExam } from '@app-types/dashboard/dashboard';
import { cn } from '@utils/cn';
import { formatDate } from '@utils/format';

interface UpcomingExamsListProps {
  items: UpcomingExam[];
  className?: string;
}

export function UpcomingExamsList({ items, className }: UpcomingExamsListProps) {
  if (items.length === 0) {
    return <UpcomingExamsEmpty className={className} />;
  }

  return (
    <ul className={cn('hm-exam-list', className)}>
      {items.map((exam, index) => {
        const date = new Date(exam.date);
        return (
          <li key={exam.id} className="hm-exam-row">
            <div className="hm-exam-date">
              {date.toLocaleDateString(undefined, { month: 'short' })}
              <strong className="hm-tnum">{date.getDate()}</strong>
            </div>
            <div className="min-w-0">
              <p className="hm-exam-title">
                {exam.subject}
                {index === 0 ? <span className="hm-chip">Next</span> : null}
              </p>
              <p className="hm-exam-meta">
                {exam.exam}
                <span aria-hidden="true"> · </span>
                {formatDate(exam.date)}
                <span aria-hidden="true"> · </span>
                {exam.time}
                <span aria-hidden="true"> · </span>
                Room {exam.room}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function UpcomingExamsEmpty({ className }: { className?: string }) {
  return (
    <div className={cn('hm-empty hm-empty--rich', className)} role="status">
      <p className="hm-empty__title">No exams on the horizon</p>
      <p className="hm-empty__desc">Schedule papers to see the next dates here.</p>
    </div>
  );
}
