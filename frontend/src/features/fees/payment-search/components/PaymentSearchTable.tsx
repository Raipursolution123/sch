import { Link } from 'react-router-dom';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { ROUTES } from '@constants/index';
import type { FeePaymentSearchRow } from '@app-types/fees/fee-search';
import { formatAmount, formatDate } from '@utils/format';
import { formatClassSection } from '@utils/student';

interface PaymentSearchTableProps {
  payments: FeePaymentSearchRow[];
}

export function PaymentSearchTable({ payments }: PaymentSearchTableProps) {
  const columns: DataTableColumn<FeePaymentSearchRow>[] = [
    {
      id: 'date',
      header: 'Date',
      cellClassName: 'text-muted-foreground whitespace-nowrap',
      cell: (row) => formatDate(row.date),
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
      id: 'class_section',
      header: 'Class',
      cellClassName: 'text-muted-foreground',
      cell: (row) => formatClassSection(row.class_name, row.section_name),
    },
    {
      id: 'feetype',
      header: 'Fee type',
      cell: (row) => row.feetype_name ?? '—',
    },
    {
      id: 'amount',
      header: 'Amount',
      cellClassName: 'tabular-nums font-medium',
      cell: (row) => formatAmount(row.amount),
    },
    {
      id: 'payment_mode',
      header: 'Mode',
      cellClassName: 'capitalize text-muted-foreground',
      cell: (row) => row.payment_mode,
    },
    {
      id: 'description',
      header: 'Note',
      cellClassName: 'text-muted-foreground max-w-xs truncate',
      cell: (row) => row.description ?? '—',
    },
  ];

  return <DataTable data={payments} columns={columns} getRowKey={(row) => row.payment_id} />;
}
