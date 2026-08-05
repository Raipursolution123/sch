import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Printer } from 'lucide-react';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { FeeReceiptModal } from '@features/fees/components/FeeReceiptModal';
import { ROUTES } from '@constants/index';
import type { FeeReceipt } from '@app-types/fees/fee-receipt';
import type { FeePaymentSearchRow } from '@app-types/fees/fee-search';
import { formatAmount, formatDate } from '@utils/format';
import { formatClassSection } from '@utils/student';

interface PaymentSearchTableProps {
  payments: FeePaymentSearchRow[];
}

export function PaymentSearchTable({ payments }: PaymentSearchTableProps) {
  const [receipt, setReceipt] = useState<FeeReceipt | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);

  const openReceipt = (row: FeePaymentSearchRow) => {
    setReceipt({
      payment_id: row.payment_id,
      receipt_no: row.receipt_no ?? null,
      date: row.date,
      amount: row.amount,
      payment_mode: row.payment_mode,
      description: row.description,
      feetype_name: row.feetype_name,
      student_id: row.student_id,
      admission_no: row.admission_no,
      full_name: row.full_name,
      class_name: row.class_name,
      section_name: row.section_name,
      collected_by: row.collected_by,
    });
    setReceiptOpen(true);
  };

  const columns: DataTableColumn<FeePaymentSearchRow>[] = [
    {
      id: 'date',
      header: 'Date',
      cellClassName: 'text-muted-foreground whitespace-nowrap',
      cell: (row) => formatDate(row.date),
    },
    {
      id: 'receipt',
      header: 'Receipt',
      cellClassName: 'tabular-nums text-muted-foreground',
      cell: (row) => row.receipt_no ?? '—',
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
    {
      id: 'actions',
      header: '',
      cellClassName: 'text-right',
      cell: (row) => (
        <PermissionButton
          permission="fees.manage"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground"
          onClick={() => openReceipt(row)}
          title="Print Receipt"
        >
          <Printer className="h-4 w-4" />
          <span className="sr-only">Print</span>
        </PermissionButton>
      ),
    },
  ];

  return (
    <>
      <DataTable data={payments} columns={columns} getRowKey={(row) => row.payment_id} />
      <FeeReceiptModal open={receiptOpen} onOpenChange={setReceiptOpen} receipt={receipt} />
    </>
  );
}
