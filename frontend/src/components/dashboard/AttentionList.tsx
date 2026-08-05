import { Link } from 'react-router-dom';
import type { AttentionItem } from '@app-types/dashboard/dashboard';
import { cn } from '@utils/cn';

interface AttentionListProps {
  items: AttentionItem[];
  className?: string;
}

const severityLabel = {
  danger: 'Urgent',
  warning: 'Watch',
  info: 'Note',
} as const;

function AttentionRow({ item }: { item: AttentionItem }) {
  const content = (
    <>
      <span className={cn('hm-severity', `is-${item.severity}`)}>
        {severityLabel[item.severity]}
      </span>
      <div className="min-w-0 flex-1">
        <p className="hm-attention-title">{item.title}</p>
        {item.description ? <p className="hm-attention-desc">{item.description}</p> : null}
      </div>
    </>
  );

  if (item.href) {
    return (
      <Link to={item.href} className="hm-attention-row">
        {content}
      </Link>
    );
  }

  return <div className="hm-attention-row">{content}</div>;
}

export function AttentionList({ items, className }: AttentionListProps) {
  if (items.length === 0) {
    return (
      <div className={cn('hm-empty hm-empty--panel', className)} role="status">
        <p className="hm-empty__title">All clear</p>
        <p className="hm-empty__desc">No overdue fees, inactive staff, or exam gaps right now.</p>
      </div>
    );
  }

  return (
    <ul className={cn('hm-attention-list', className)}>
      {items.map((item) => (
        <li key={item.id}>
          <AttentionRow item={item} />
        </li>
      ))}
    </ul>
  );
}
