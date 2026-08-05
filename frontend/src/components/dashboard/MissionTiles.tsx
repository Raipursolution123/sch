import { Link } from 'react-router-dom';
import { cn } from '@utils/cn';

export interface MissionTileItem {
  id: string;
  eyebrow: string;
  title: string;
  value: string;
  hint: string;
  /** Optional warn-colored fragment appended after hint (e.g. "12 overdue"). */
  hintWarn?: string;
  href: string;
  badge?: string;
  badgeTone?: 'live' | 'muted';
}

interface MissionTilesProps {
  items: MissionTileItem[];
  className?: string;
}

/** Fiori-style mission tiles — unequal operational goals with live counts. */
export function MissionTiles({ items, className }: MissionTilesProps) {
  if (items.length === 0) return null;

  return (
    <section className={cn('hm-missions hm-reveal', className)} aria-labelledby="missions-heading">
      <div className="hm-missions__head mb-4 flex items-baseline justify-between gap-4">
        <h2 id="missions-heading" className="hm-section__title">
          Your work
        </h2>
        <span className="hm-label">
          {items.length} open mission{items.length === 1 ? '' : 's'}
        </span>
      </div>
      <ul className="hm-missions__grid m-0 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-3">
        {items.map((item) => (
          <li key={item.id} className="min-w-0">
            <Link to={item.href} className="hm-mission-tile">
              <div className="hm-mission-tile__top">
                <p className="hm-label">{item.eyebrow}</p>
                {item.badge ? (
                  <span
                    className={cn('hm-mission-tile__badge', item.badgeTone === 'live' && 'is-live')}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </div>
              <p className="hm-mission-tile__title">{item.title}</p>
              <p className="hm-mission-tile__value hm-tnum">{item.value}</p>
              <p className="hm-mission-tile__hint">
                {item.hint}
                {item.hintWarn ? (
                  <>
                    {item.hint ? ' · ' : null}
                    <span className="hm-mission-tile__warn">{item.hintWarn}</span>
                  </>
                ) : null}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
