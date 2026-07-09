import type { ReactNode } from 'react';

export type DataTableDensity = 'compact' | 'comfortable';

export interface DataTableColumn<T> {
  id: string;
  header: ReactNode;
  headerClassName?: string;
  cell: (row: T) => ReactNode;
  cellClassName?: string;
  /** Enable client-side sort for this column */
  enableSorting?: boolean;
  /** Value used for sorting when cell is custom-rendered */
  sortValue?: (row: T) => string | number | null | undefined;
  /** Allow cell text to wrap (default: single-line, column grows with content) */
  wrap?: boolean;
  /** Optional intrinsic column bounds — prefer over cellClassName width utilities */
  minWidth?: string;
  maxWidth?: string;
  /**
   * @deprecated Sticky columns are not used; horizontal scroll is preferred for wide ERP tables.
   */
  sticky?: boolean;
}

export interface DataTablePaginationConfig {
  page: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
}

export interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  getRowKey: (row: T) => string | number;
  actions?: (row: T) => ReactNode;
  actionsHeader?: ReactNode;
  actionsHeaderClassName?: string;
  className?: string;
  /** @default 'compact' */
  density?: DataTableDensity;
  onDensityChange?: (density: DataTableDensity) => void;
  /** @default true */
  stickyHeader?: boolean;
  /**
   * @deprecated No longer applied — use horizontal scroll instead of pinning columns.
   */
  stickyFirstColumn?: boolean;
  enableSorting?: boolean;
  enableRowSelection?: boolean;
  rowSelection?: Record<string, boolean>;
  onRowSelectionChange?: (selection: Record<string, boolean>) => void;
  bulkActions?: ReactNode;
  isLoading?: boolean;
  loadingRowCount?: number;
  emptyMessage?: ReactNode;
  pagination?: DataTablePaginationConfig;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  toolbarExtra?: ReactNode;
  /** Show dense/comfortable density toggle in the toolbar */
  showDensityToggle?: boolean;
}
