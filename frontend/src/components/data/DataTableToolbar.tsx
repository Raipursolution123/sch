import { Search, Rows3 } from 'lucide-react';
import { Input } from '@components/ui/input';
import { Button } from '@components/ui/button';
import type { DataTableDensity } from '@components/data/data-table-types';
import { cn } from '@utils/cn';

interface DataTableToolbarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  density?: DataTableDensity;
  onDensityChange?: (density: DataTableDensity) => void;
  toolbarExtra?: React.ReactNode;
  className?: string;
}

export function DataTableToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search…',
  density = 'compact',
  onDensityChange,
  toolbarExtra,
  className,
}: DataTableToolbarProps) {
  const showSearch = onSearchChange != null;
  const showDensity = onDensityChange != null;

  if (!showSearch && !showDensity && !toolbarExtra) return null;

  return (
    <div
      className={cn(
        'flex flex-col gap-3 border-b border-border/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      {showSearch ? (
        <div className="relative w-full sm:max-w-sm">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={searchValue ?? ''}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={searchPlaceholder}
            className="pl-9"
            aria-label={searchPlaceholder}
          />
        </div>
      ) : (
        <div />
      )}

      <div className="flex items-center gap-2 self-end sm:self-auto">
        {toolbarExtra}
        {showDensity && (
          <div
            className="flex items-center rounded-md border border-border p-0.5"
            role="group"
            aria-label="Table density"
          >
            <Button
              type="button"
              variant={density === 'compact' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => onDensityChange('compact')}
              aria-pressed={density === 'compact'}
            >
              Dense
            </Button>
            <Button
              type="button"
              variant={density === 'comfortable' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => onDensityChange('comfortable')}
              aria-pressed={density === 'comfortable'}
            >
              Cozy
            </Button>
          </div>
        )}
        {showDensity && (
          <Rows3 className="hidden h-4 w-4 text-muted-foreground sm:block" aria-hidden="true" />
        )}
      </div>
    </div>
  );
}
