import { Badge } from '@components/ui/badge';
import { Button } from '@components/ui/button';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { Pagination } from '@components/ui';
import { Check, X } from 'lucide-react';
import type { OfflineBankPayment } from '@app-types/fees/offline-bank-payment';
import { formatAmount, formatDate } from '@utils/format';

interface OfflineBankPaymentsTableProps {
  rows: OfflineBankPayment[];
  totalCount: number;
  page: number;
  onPageChange: (page: number) => void;
  onApprove: (row: OfflineBankPayment) => void;
  onReject: (row: OfflineBankPayment) => void;
}

function statusBadge(status: OfflineBankPayment['status']) {
  if (status === 'approved') return <Badge variant="secondary">Approved</Badge>;
  if (status === 'rejected') return <Badge variant="destructive">Rejected</Badge>;
  return <Badge variant="outline">Pending</Badge>;
}

export function OfflineBankPaymentsTable({
  rows,
  totalCount,
  page,
  onPageChange,
  onApprove,
  onReject,
}: OfflineBankPaymentsTableProps) {
  const columns: DataTableColumn<OfflineBankPayment>[] = [
    {
      id: 'date',
      header: 'Payment date',
      cell: (row) => (row.payment_date ? formatDate(row.payment_date) : '—'),
    },
    {
      id: 'student',
      header: 'Student',
      cell: (row) => (
        <div>
          <div className="font-medium">{row.full_name || '—'}</div>
          <div className="text-xs text-muted-foreground">
            {[row.admission_no, row.class_name, row.section_name].filter(Boolean).join(' · ') ||
              '—'}
          </div>
        </div>
      ),
    },
    {
      id: 'fee',
      header: 'Fee type',
      cell: (row) => row.feetype_name || '—',
    },
    {
      id: 'bank',
      header: 'Bank / Ref',
      cell: (row) => (
        <div>
          <div>{row.bank_from || '—'}</div>
          <div className="text-xs text-muted-foreground">{row.reference || '—'}</div>
        </div>
      ),
    },
    {
      id: 'amount',
      header: 'Amount',
      cellClassName: 'tabular-nums font-medium',
      cell: (row) => formatAmount(row.amount),
    },
    {
      id: 'status',
      header: 'Status',
      cell: (row) => statusBadge(row.status),
    },
  ];

  return (
    <div className="space-y-4">
      <DataTable
        data={rows}
        columns={columns}
        getRowKey={(row) => row.id}
        actions={(row) =>
          row.status === 'pending' ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onApprove(row)}
                aria-label={`Approve payment ${row.id}`}
                className="text-emerald-700 hover:text-emerald-800"
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onReject(row)}
                aria-label={`Reject payment ${row.id}`}
                className="text-destructive hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : null
        }
      />
      <Pagination
        currentPage={page}
        totalPages={Math.max(1, Math.ceil(totalCount / 20))}
        onPageChange={onPageChange}
      />
    </div>
  );
}
