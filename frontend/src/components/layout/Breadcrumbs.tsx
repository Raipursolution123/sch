import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { getBreadcrumbs } from '@utils/breadcrumbs';
import { cn } from '@utils/cn';

interface BreadcrumbsProps {
  pathname: string;
  className?: string;
}

/** Shell-v1 breadcrumb: muted trail · current page in ink. */
export function Breadcrumbs({ pathname, className }: BreadcrumbsProps) {
  const items = getBreadcrumbs(pathname);

  return (
    <nav aria-label="Breadcrumb" className={cn('min-w-0', className)}>
      <ol className="flex flex-wrap items-center gap-1.5 text-[0.8125rem]">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <Fragment key={`${item.label}-${index}`}>
              {index > 0 && (
                <li className="text-muted-foreground/50" aria-hidden="true">
                  /
                </li>
              )}
              <li className="min-w-0">
                {item.href && !isLast ? (
                  <Link
                    to={item.href}
                    className="truncate text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className={cn(
                      'truncate',
                      isLast ? 'font-medium text-foreground' : 'text-muted-foreground',
                    )}
                    aria-current={isLast ? 'page' : undefined}
                  >
                    {item.label}
                  </span>
                )}
              </li>
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
