import type { ReactNode } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@components/ui/table';
import { cn } from '@utils/cn';

export interface DataTableColumn<T> {
  id: string;
  header: ReactNode;
  headerClassName?: string;
  cell: (row: T) => ReactNode;
  cellClassName?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  getRowKey: (row: T) => string | number;
  actions?: (row: T) => ReactNode;
  actionsHeader?: ReactNode;
  actionsHeaderClassName?: string;
  className?: string;
}

export function DataTable<T>({
  data,
  columns,
  getRowKey,
  actions,
  actionsHeader = 'Actions',
  actionsHeaderClassName = 'text-right',
  className,
}: DataTableProps<T>) {
  const hasActions = Boolean(actions);

  return (
    <div className={cn('rounded-lg border bg-card', className)}>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.id} className={column.headerClassName}>
                {column.header}
              </TableHead>
            ))}
            {hasActions && (
              <TableHead className={actionsHeaderClassName}>{actionsHeader}</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={getRowKey(row)}>
              {columns.map((column) => (
                <TableCell key={column.id} className={column.cellClassName}>
                  {column.cell(row)}
                </TableCell>
              ))}
              {hasActions && (
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">{actions!(row)}</div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
