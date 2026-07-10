import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@components/ui/button';
import { Select } from '@components/ui/select';
import type { DataTablePaginationConfig } from '@components/data/data-table-types';
import { cn } from '@utils/cn';

interface DataTablePaginationProps extends DataTablePaginationConfig {
  className?: string;
}

export function DataTablePagination({
  page,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
  className,
}: DataTablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const rangeStart = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, totalCount);

  if (totalCount === 0) return null;

  return (
    <div
      className={cn(
        'flex flex-col gap-3 border-t border-border/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <span>
          Showing {rangeStart}–{rangeEnd} of {totalCount}
        </span>
        {onPageSizeChange && (
          <label className="flex items-center gap-2">
            <span className="sr-only">Rows per page</span>
            <Select
              aria-label="Rows per page"
              className="h-8 w-[5.5rem] text-xs"
              value={String(pageSize)}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              options={pageSizeOptions.map((size) => ({
                value: String(size),
                label: String(size),
              }))}
            />
            <span className="text-xs">/ page</span>
          </label>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
