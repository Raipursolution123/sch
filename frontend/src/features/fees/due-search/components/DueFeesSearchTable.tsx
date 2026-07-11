import { Link } from 'react-router-dom';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { ROUTES } from '@constants/index';
import type { FeeDueSearchStudent } from '@app-types/fees/fee-search';
import { formatAmount } from '@utils/format';
import { formatClassSection } from '@utils/student';

interface DueFeesSearchTableProps {
  students: FeeDueSearchStudent[];
}

export function DueFeesSearchTable({ students }: DueFeesSearchTableProps) {
  const columns: DataTableColumn<FeeDueSearchStudent>[] = [
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
      id: 'class_section',
      header: 'Class',
      cellClassName: 'text-muted-foreground',
      cell: (row) => formatClassSection(row.class_name, row.section_name),
    },
    {
      id: 'roll_no',
      header: 'Roll',
      cellClassName: 'tabular-nums text-muted-foreground',
      cell: (row) => (row.roll_no != null ? row.roll_no : '—'),
    },
    {
      id: 'total_due',
      header: 'Due',
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
  ];

  return <DataTable data={students} columns={columns} getRowKey={(row) => row.student_id} />;
}
