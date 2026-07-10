import { Skeleton } from '@components/ui/skeleton';
import type { DataTableDensity } from '@components/data/data-table-types';
import {
  DATA_TABLE_TABLE_CLASS,
  getBodyCellClassName,
  getHeaderCellClassName,
} from '@components/data/data-table-layout';
import { cn } from '@utils/cn';

interface DataTableSkeletonProps {
  columnCount: number;
  rowCount?: number;
  density?: DataTableDensity;
  hasActions?: boolean;
  hasSelection?: boolean;
}

const SKELETON_WIDTHS = ['w-24', 'w-32', 'w-20', 'w-28', 'w-16', 'w-36', 'w-24', 'w-20'];

export function DataTableSkeleton({
  columnCount,
  rowCount = 5,
  density = 'compact',
  hasActions = false,
  hasSelection = false,
}: DataTableSkeletonProps) {
  const cols = columnCount + (hasActions ? 1 : 0) + (hasSelection ? 1 : 0);

  return (
    <table className={cn(DATA_TABLE_TABLE_CLASS, 'animate-pulse')}>
      <thead>
        <tr className="border-b">
          {Array.from({ length: cols }).map((_, index) => (
            <th
              key={index}
              className={cn(
                getHeaderCellClassName(undefined, density),
                index === cols - 1 && hasActions && 'text-right',
              )}
            >
              <Skeleton className="inline-block h-3 w-16" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rowCount }).map((_, rowIndex) => (
          <tr key={rowIndex} className="border-b">
            {Array.from({ length: cols }).map((__, colIndex) => (
              <td
                key={colIndex}
                className={cn(
                  getBodyCellClassName(undefined, density),
                  colIndex === cols - 1 && hasActions && 'text-right',
                )}
              >
                <Skeleton
                  className={cn(
                    'inline-block h-4',
                    SKELETON_WIDTHS[colIndex % SKELETON_WIDTHS.length],
                  )}
                />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
