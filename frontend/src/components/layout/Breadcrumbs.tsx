import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { getBreadcrumbs } from '@utils/breadcrumbs';
import { cn } from '@utils/cn';

interface BreadcrumbsProps {
  pathname: string;
  className?: string;
}

export function Breadcrumbs({ pathname, className }: BreadcrumbsProps) {
  const items = getBreadcrumbs(pathname);

  if (items.length <= 1) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className={cn('min-w-0', className)}>
      <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <Fragment key={`${item.label}-${index}`}>
              {index > 0 && (
                <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-50" aria-hidden="true" />
              )}
              <li className="min-w-0">
                {item.href && !isLast ? (
                  <Link to={item.href} className="truncate transition-colors hover:text-foreground">
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className={cn('truncate', isLast && 'font-medium text-foreground')}
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
