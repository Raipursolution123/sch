import type { CSSProperties } from 'react';
import {
  densityBodyRowClass,
  densityHeadRowClass,
  densityInlineClass,
} from '@components/data/data-table-density';
import type { DataTableDensity } from '@components/data/data-table-types';
import { cn } from '@utils/cn';

/** Shared column metadata consumed by DataTable header/body cells. */
export interface DataTableColumnMeta {
  headerClassName?: string;
  cellClassName?: string;
  isSelect?: boolean;
  isActions?: boolean;
  wrap?: boolean;
  minWidth?: string;
  maxWidth?: string;
}

export function getColumnSizeStyle(meta?: DataTableColumnMeta): CSSProperties | undefined {
  if (!meta?.minWidth && !meta?.maxWidth) return undefined;
  return {
    minWidth: meta.minWidth,
    maxWidth: meta.maxWidth,
  };
}

function sharedHorizontalPadding(density: DataTableDensity) {
  return densityInlineClass[density];
}

export function getHeaderCellClassName(
  meta: DataTableColumnMeta | undefined,
  density: DataTableDensity,
): string {
  return cn(
    'align-middle text-left font-medium text-muted-foreground',
    sharedHorizontalPadding(density),
    densityHeadRowClass[density],
    meta?.headerClassName,
    meta?.isSelect && 'w-10 shrink-0 text-center',
    meta?.isActions && 'whitespace-nowrap',
    !meta?.isSelect && !meta?.isActions && (meta?.wrap ? 'whitespace-normal' : 'whitespace-nowrap'),
  );
}

export function getBodyCellClassName(
  meta: DataTableColumnMeta | undefined,
  density: DataTableDensity,
  extra?: string,
): string {
  return cn(
    'align-middle text-left',
    sharedHorizontalPadding(density),
    densityBodyRowClass[density],
    meta?.cellClassName,
    meta?.isSelect && 'w-10 shrink-0 text-center',
    meta?.isActions && 'whitespace-nowrap',
    !meta?.isSelect && !meta?.isActions && (meta?.wrap ? 'whitespace-normal' : 'whitespace-nowrap'),
    meta?.maxWidth && !meta?.wrap && 'overflow-hidden text-ellipsis',
    extra,
  );
}

/** Scroll viewport for wide ERP tables — horizontal scroll when content exceeds width. */
export const DATA_TABLE_SCROLL_CLASS =
  'overflow-x-auto overscroll-x-contain scroll-pe-4 [-webkit-overflow-scrolling:touch]';

/**
 * Intrinsic-width table with unified column grid.
 * border-collapse keeps thead/tbody column boundaries identical.
 */
export const DATA_TABLE_TABLE_CLASS =
  'w-max min-w-full table-auto border-collapse caption-bottom text-sm';
