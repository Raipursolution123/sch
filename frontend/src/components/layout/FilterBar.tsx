import type { ReactNode } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@components/ui/input';
import { cn } from '@utils/cn';

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
}

/** Horizontal filter toolbar — search + custom filters + actions. */
export function FilterBar({
  children,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  actions,
  className,
}: FilterBarProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-lg border bg-card p-4 shadow-sm sm:flex-row sm:flex-wrap sm:items-center',
        className,
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
      {children && <div className="flex flex-1 flex-wrap items-center gap-2">{children}</div>}
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2 sm:ml-auto">{actions}</div>}
    </div>
  );
}
