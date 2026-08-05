import { Link } from 'react-router-dom';
import type { AttentionItem } from '@app-types/dashboard/dashboard';
import { cn } from '@utils/cn';

interface AttentionBandProps {
  item: AttentionItem;
  className?: string;
}

/** One graphite attention band — Cobalt signature dark beat. */
export function AttentionBand({ item, className }: AttentionBandProps) {
  return (
    <section
      className={cn('hm-graphite-band hm-reveal', className)}
      aria-labelledby="graphite-band-heading"
    >
      <div className="hm-graphite-band__inner">
        <div className="min-w-0">
          <p className="hm-label">Action required</p>
          <h2 id="graphite-band-heading" className="hm-graphite-band__title">
            {item.title}
          </h2>
          {item.description ? <p className="hm-graphite-band__desc">{item.description}</p> : null}
        </div>
        {item.href ? (
          <Link to={item.href} className="hm-btn hm-btn--primary shrink-0">
            Open
          </Link>
        ) : null}
      </div>
    </section>
  );
}
