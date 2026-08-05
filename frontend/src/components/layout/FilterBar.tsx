import type { ReactNode } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@components/ui/input';
import { packPanelClassName } from '@components/pack/PackPanel';
import { cn } from '@utils/cn';

/** @deprecated Use packPanelClassName from @components/pack */
export const filterPanelClassName = cn(packPanelClassName, 'p-4 shadow-sm');

interface SearchBarProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  id?: string;
}

/** Reusable search input for toolbars and filter bars. */
export function SearchBar({
  value,
  onChange,
  placeholder = 'Search…',
  className,
  disabled = false,
  id = 'page-search',
}: SearchBarProps) {
  return (
    <div className={cn('relative w-full max-w-sm', className)}>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        id={id}
        type="search"
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="pl-9"
        aria-label={placeholder}
      />
    </div>
  );
}

interface FilterBarProps {
  children?: ReactNode;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  actions?: ReactNode;
  className?: string;
  /** Lay filter fields in a responsive grid (mark / report style). */
  layout?: 'row' | 'grid';
  columns?: 2 | 3 | 4 | 5;
}

const gridCols = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
  5: 'sm:grid-cols-2 lg:grid-cols-5',
} as const;

/** Horizontal filter toolbar — search + custom filters + actions. */
export function FilterBar({
  children,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  actions,
  className,
  layout = 'row',
  columns = 3,
}: FilterBarProps) {
  return (
    <div className={cn(filterPanelClassName, className)}>
      <div
        className={cn(
          layout === 'row' && 'flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center',
          layout === 'grid' && 'space-y-4',
        )}
      >
        {onSearchChange != null && (
          <SearchBar
            value={searchValue}
            onChange={onSearchChange}
            placeholder={searchPlaceholder}
            className="sm:max-w-xs"
          />
        )}
        {children && layout === 'row' && (
          <div className="flex flex-1 flex-wrap items-center gap-2">{children}</div>
        )}
        {children && layout === 'grid' && (
          <div className={cn('grid gap-4', gridCols[columns])}>{children}</div>
        )}
        {actions && (
          <div
            className={cn(
              'flex shrink-0 flex-wrap items-center gap-2',
              layout === 'row' && 'sm:ml-auto',
              layout === 'grid' && 'justify-end border-t border-border pt-4',
            )}
          >
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
