import { cn } from '@utils/cn';
import { formatAmount } from '@utils/format';

interface FeeProgressItem {
  label: string;
  amount: number;
  tone: 'success' | 'warning' | 'destructive';
}

interface FeeProgressListProps {
  items: FeeProgressItem[];
  total: number;
  collectionRate: number;
  className?: string;
}

/** Fee collection rate + segmented hairline bar. */
export function FeeProgressList({ items, total, collectionRate, className }: FeeProgressListProps) {
  if (total <= 0) {
    return <FeeProgressEmpty className={className} />;
  }

  return (
    <div className={cn(className)}>
      <div className="hm-fee-rate">
        <span className="hm-label">Collection rate</span>
        <span className="hm-fee-rate__value hm-tnum">{collectionRate.toFixed(1)}%</span>
      </div>

      <div
        className="hm-fee-bar"
        role="progressbar"
        aria-valuenow={collectionRate}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Fee collection rate"
      >
        {items.map((item) => {
          const width = total > 0 ? (item.amount / total) * 100 : 0;
          return (
            <div
              key={item.label}
              className={cn('hm-fee-bar__seg', `is-${item.tone}`)}
              style={{ width: `${width}%` }}
            />
          );
        })}
      </div>

      <ul className="hm-fee-rows">
        {items.map((item) => (
          <li key={item.label}>
            <span>
              <span className={cn('hm-dot', `is-${item.tone}`)} aria-hidden="true" />
              <span className="hm-fee-label">{item.label}</span>
            </span>
            <span className="hm-amount">{formatAmount(item.amount)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function FeeProgressEmpty({ className }: { className?: string }) {
  return (
    <p className={cn('hm-empty', className)}>
      Fee collection summary is not available until the school-wide fees API is connected.
    </p>
  );
}
