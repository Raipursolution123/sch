import { Link } from 'react-router-dom';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { ROUTES } from '@constants/index';
import type { FeeCollectRosterStudent } from '@app-types/fees/fee-collect';
import { formatAmount } from '@utils/format';

interface CollectFeesTableProps {
  students: FeeCollectRosterStudent[];
  onCollect: (student: FeeCollectRosterStudent) => void;
}

export function CollectFeesTable({ students, onCollect }: CollectFeesTableProps) {
  const columns: DataTableColumn<FeeCollectRosterStudent>[] = [
    {
      id: 'roll_no',
      header: 'Roll',
      cellClassName: 'tabular-nums text-muted-foreground w-16',
      cell: (row) => (row.roll_no != null ? row.roll_no : '—'),
    },
    {
      id: 'student',
      header: 'Student',
      cellClassName: 'font-medium',
      cell: (row) => (
        <div>
          <Link
            to={ROUTES.students.detail(row.student_id)}
            className="hover:text-primary hover:underline"
          >
            {row.full_name}
          </Link>
          <p className="text-xs font-normal text-muted-foreground">{row.admission_no}</p>
        </div>
      ),
    },
    {
      id: 'total_due',
      header: 'Total due',
      cellClassName: 'tabular-nums',
      cell: (row) => formatAmount(row.total_due),
    },
    {
      id: 'total_paid',
      header: 'Paid',
      cellClassName: 'tabular-nums text-muted-foreground',
      cell: (row) => formatAmount(row.total_paid),
    },
    {
      id: 'total_balance',
      header: 'Balance',
      cellClassName: 'tabular-nums font-medium',
      cell: (row) => formatAmount(row.total_balance),
    },
    {
      id: 'actions',
      header: '',
      cellClassName: 'text-right',
      cell: (row) => (
        <PermissionButton
          permission="fees.manage"
          variant="outline"
          size="sm"
          disabled={row.total_balance <= 0}
          onClick={() => onCollect(row)}
        >
          Collect
        </PermissionButton>
      ),
    },
  ];

  return <DataTable data={students} columns={columns} getRowKey={(row) => row.student_id} />;
}
