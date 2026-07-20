import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import type { LedgerGroup } from '@/types/finance';
import type { DataTablePaginationConfig } from '@components/data/data-table-types';
import { useLedgerGroups } from '@/hooks/useLedgerGroups';

interface LedgerGroupsTableProps {
  groups: LedgerGroup[];
  pagination: DataTablePaginationConfig;
  onEdit: (group: LedgerGroup) => void;
  onDelete: (id: number) => void;
}

export const LedgerGroupsTable = ({
  groups,
  pagination,
  onEdit,
  onDelete,
}: LedgerGroupsTableProps) => {
  const { data: allGroups } = useLedgerGroups();

  const columns: DataTableColumn<LedgerGroup>[] = [
    {
      id: 'serial_no',
      header: 'S.No',
      cell: (row) => {
        const index = groups.indexOf(row);
        return (pagination.page - 1) * pagination.pageSize + index + 1;
      },
    },
    {
      id: 'name',
      header: 'Name',
      cellClassName: 'font-medium',
      cell: (row) => row.name,
    },
    {
      id: 'code',
      header: 'Code',
      cell: (row) => row.code || '-',
    },
    {
      id: 'parent_id',
      header: 'Parent Group',
      cell: (row) => {
        if (!row.parent_id) return '-';
        const parent = allGroups?.find((g: LedgerGroup) => g.id === row.parent_id);
        return parent ? parent.code || parent.name : row.parent_id;
      },
    },
    {
      id: 'affects_gross',
      header: 'Affects Gross',
      cell: (row) => (row.affects_gross === 1 ? 'Yes (Direct)' : 'No (Indirect)'),
    },
    {
      id: 'actions',
      header: 'Actions',
      headerClassName: 'text-right',
      cellClassName: 'text-right',
      cell: (row) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="icon" onClick={() => onEdit(row)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(row.id)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      data={groups}
      columns={columns}
      pagination={pagination}
      getRowKey={(row) => row.id}
    />
  );
};
