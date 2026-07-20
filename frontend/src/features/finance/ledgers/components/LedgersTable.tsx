import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@components/ui/button';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import type { Ledger } from '@app-types/finance';
import type { FeeType } from '@app-types/fees/fee-type';
import type { DataTablePaginationConfig } from '@components/data/data-table-types';
import { useFeeTypes } from '@hooks/useFeeTypes';

interface LedgersTableProps {
  ledgers: Ledger[];
  pagination: DataTablePaginationConfig;
  onEdit: (ledger: Ledger) => void;
  onDelete: (id: number) => void;
}

export const LedgersTable = ({ ledgers, pagination, onEdit, onDelete }: LedgersTableProps) => {
  const { data: feeTypesData } = useFeeTypes();

  const columns: DataTableColumn<Ledger>[] = [
    {
      id: 'serial_no',
      header: 'S.No',
      cell: (row) => {
        const index = ledgers.indexOf(row);
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
      id: 'group_id',
      header: 'Group ID',
      cell: (row) => row.group_id,
    },
    {
      id: 'code',
      header: 'Code',
      cell: (row) => row.code || '-',
    },
    {
      id: 'op_balance',
      header: 'Opening Balance',
      cell: (row) => `${row.op_balance} (${row.op_balance_dc === 'D' ? 'Dr' : 'Cr'})`,
    },
    {
      id: 'fee_type',
      header: 'Fee Type',
      cell: (row) => {
        let ids: string[] = [];
        if (row.fee_types) {
          try {
            const parsed = JSON.parse(row.fee_types);
            if (Array.isArray(parsed)) ids = parsed.map(String);
          } catch {
            // fee_types may be a plain string rather than JSON
          }
        }
        if (ids.length === 0 && row.feetype_id) {
          ids = [String(row.feetype_id)];
        }
        if (ids.length === 0) return '-';
        if (!feeTypesData) return ids.join(', ');

        const names = ids.map((val) => {
          if (!isNaN(Number(val))) {
            const ft = feeTypesData.find((f: FeeType) => String(f.id) === val);
            return ft ? ft.name || `Type ${val}` : `Type ${val}`;
          }
          return val;
        });
        return names.join(', ');
      },
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
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive/90"
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this ledger?')) {
                onDelete(row.id);
              }
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={ledgers}
      pagination={pagination}
      getRowKey={(row) => row.id}
    />
  );
};
