import { useMemo, useState, type ReactNode } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type RowSelectionState,
  type SortingState,
} from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { Checkbox } from '@components/ui/checkbox';
import { DataTableBulkBar } from '@components/data/DataTableBulkBar';
import { DataTablePagination } from '@components/data/DataTablePagination';
import { DataTableSkeleton } from '@components/data/DataTableSkeleton';
import { DataTableToolbar } from '@components/data/DataTableToolbar';
import {
  readStoredDensity,
  storeDensity,
} from '@components/data/data-table-density';
import type { DataTableColumnMeta } from '@components/data/data-table-layout';
import {
  DATA_TABLE_SCROLL_CLASS,
  DATA_TABLE_TABLE_CLASS,
  getBodyCellClassName,
  getColumnSizeStyle,
  getHeaderCellClassName,
} from '@components/data/data-table-layout';
import type {
  DataTableColumn,
  DataTableDensity,
  DataTableProps,
} from '@components/data/data-table-types';
import { cn } from '@utils/cn';

export type { DataTableColumn, DataTableDensity, DataTableProps } from '@components/data/data-table-types';

function SortIndicator({ direction }: { direction: false | 'asc' | 'desc' }) {
  if (direction === 'asc') return <ArrowUp className="ml-1 inline h-3.5 w-3.5" aria-hidden="true" />;
  if (direction === 'desc') return <ArrowDown className="ml-1 inline h-3.5 w-3.5" aria-hidden="true" />;
  return <ArrowUpDown className="ml-1 inline h-3.5 w-3.5 opacity-40" aria-hidden="true" />;
}

function buildColumns<T>({
  columns,
  enableSorting,
  enableRowSelection,
  actions,
  actionsHeader,
  actionsHeaderClassName,
}: {
  columns: DataTableColumn<T>[];
  enableSorting?: boolean;
  enableRowSelection?: boolean;
  actions?: (row: T) => ReactNode;
  actionsHeader?: ReactNode;
  actionsHeaderClassName?: string;
}): ColumnDef<T>[] {
  const defs: ColumnDef<T>[] = [];

  if (enableRowSelection) {
    defs.push({
      id: '__select',
      header: ({ table }) => (
        <Checkbox
          aria-label="Select all rows on this page"
          checked={table.getIsAllPageRowsSelected()}
          onChange={(event) => table.toggleAllPageRowsSelected(event.target.checked)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          aria-label="Select row"
          checked={row.getIsSelected()}
          onChange={(event) => row.toggleSelected(event.target.checked)}
        />
      ),
      enableSorting: false,
      meta: { isSelect: true } satisfies DataTableColumnMeta,
    });
  }

  columns.forEach((column) => {
    defs.push({
      id: column.id,
      accessorFn: column.sortValue ? (row) => column.sortValue!(row) : undefined,
      header: ({ column: tableColumn }) => {
        const canSort = enableSorting && column.enableSorting;
        if (!canSort) return <span>{column.header}</span>;
        return (
          <button
            type="button"
            className="-mx-0 inline-flex items-center font-medium hover:text-foreground"
            onClick={tableColumn.getToggleSortingHandler()}
          >
            {column.header}
            <SortIndicator direction={tableColumn.getIsSorted()} />
          </button>
        );
      },
      cell: ({ row }) => column.cell(row.original),
      enableSorting: enableSorting && column.enableSorting,
      meta: {
        headerClassName: column.headerClassName,
        cellClassName: column.cellClassName,
        wrap: column.wrap,
        minWidth: column.minWidth,
        maxWidth: column.maxWidth,
      } satisfies DataTableColumnMeta,
    });
  });

  if (actions) {
    defs.push({
      id: '__actions',
      header: () => actionsHeader ?? 'Actions',
      cell: ({ row }) => (
        <div className="flex shrink-0 items-center justify-end gap-1">{actions(row.original)}</div>
      ),
      enableSorting: false,
      meta: {
        headerClassName: actionsHeaderClassName ?? 'text-right',
        cellClassName: 'text-right',
        isActions: true,
        minWidth: '4.5rem',
      } satisfies DataTableColumnMeta,
    });
  }

  return defs;
}

export function DataTable<T>({
  data,
  columns,
  getRowKey,
  actions,
  actionsHeader,
  actionsHeaderClassName,
  className,
  density: densityProp,
  onDensityChange,
  stickyHeader = true,
  enableSorting = false,
  enableRowSelection = false,
  rowSelection: rowSelectionProp,
  onRowSelectionChange,
  bulkActions,
  isLoading = false,
  loadingRowCount = 5,
  emptyMessage = 'No records found.',
  pagination,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  toolbarExtra,
  showDensityToggle = false,
}: DataTableProps<T>) {
  const [internalDensity, setInternalDensity] = useState<DataTableDensity>(() => readStoredDensity());
  const [internalSelection, setInternalSelection] = useState<RowSelectionState>({});
  const [sorting, setSorting] = useState<SortingState>([]);

  const density = densityProp ?? internalDensity;
  const rowSelection = rowSelectionProp ?? internalSelection;

  const handleDensityChange = (next: DataTableDensity) => {
    if (densityProp == null) {
      setInternalDensity(next);
      storeDensity(next);
    }
    onDensityChange?.(next);
  };

  const handleRowSelectionChange = (
    updater: RowSelectionState | ((old: RowSelectionState) => RowSelectionState),
  ) => {
    const next = typeof updater === 'function' ? updater(rowSelection) : updater;
    if (rowSelectionProp == null) setInternalSelection(next);
    onRowSelectionChange?.(next);
  };

  const columnDefs = useMemo(
    () =>
      buildColumns({
        columns,
        enableSorting,
        enableRowSelection,
        actions,
        actionsHeader,
        actionsHeaderClassName,
      }),
    [columns, enableSorting, enableRowSelection, actions, actionsHeader, actionsHeaderClassName],
  );

  const table = useReactTable({
    data,
    columns: columnDefs,
    state: { sorting, rowSelection },
    onSortingChange: setSorting,
    onRowSelectionChange: handleRowSelectionChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    enableRowSelection,
    getRowId: (row) => String(getRowKey(row)),
    manualPagination: Boolean(pagination),
    pageCount: pagination ? Math.ceil(pagination.totalCount / pagination.pageSize) : undefined,
  });

  const selectedCount = table.getSelectedRowModel().rows.length;
  const showToolbar =
    onSearchChange != null || showDensityToggle || toolbarExtra != null;

  return (
    <div className={cn('overflow-hidden rounded-lg border bg-card shadow-sm', className)}>
      {showToolbar && (
        <DataTableToolbar
          searchValue={searchValue}
          onSearchChange={onSearchChange}
          searchPlaceholder={searchPlaceholder}
          density={density}
          onDensityChange={showDensityToggle || onDensityChange != null ? handleDensityChange : undefined}
          toolbarExtra={toolbarExtra}
        />
      )}

      {enableRowSelection && (
        <DataTableBulkBar
          selectedCount={selectedCount}
          onClear={() => table.resetRowSelection()}
        >
          {bulkActions}
        </DataTableBulkBar>
      )}

      <div className={DATA_TABLE_SCROLL_CLASS}>
        {isLoading ? (
          <DataTableSkeleton
            columnCount={columns.length}
            rowCount={loadingRowCount}
            density={density}
            hasActions={Boolean(actions)}
            hasSelection={enableRowSelection}
          />
        ) : data.length === 0 ? (
          <div className="px-4 py-12 text-center text-sm text-muted-foreground">{emptyMessage}</div>
        ) : (
          <table className={DATA_TABLE_TABLE_CLASS}>
            <thead
              className={cn(
                '[&_tr]:border-b',
                stickyHeader && 'sticky top-0 z-20 bg-card shadow-[0_1px_0_0_hsl(var(--border))]',
              )}
            >
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b">
                  {headerGroup.headers.map((header) => {
                    const meta = header.column.columnDef.meta as DataTableColumnMeta | undefined;
                    return (
                      <th
                        key={header.id}
                        className={getHeaderCellClassName(meta, density)}
                        style={getColumnSizeStyle(meta)}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  data-state={row.getIsSelected() ? 'selected' : undefined}
                  className="border-b transition-colors hover:bg-muted/40 data-[state=selected]:bg-primary-pale/30"
                >
                  {row.getVisibleCells().map((cell) => {
                    const meta = cell.column.columnDef.meta as DataTableColumnMeta | undefined;
                    return (
                      <td
                        key={cell.id}
                        className={getBodyCellClassName(meta, density)}
                        style={getColumnSizeStyle(meta)}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {pagination && !isLoading && <DataTablePagination {...pagination} />}
    </div>
  );
}
