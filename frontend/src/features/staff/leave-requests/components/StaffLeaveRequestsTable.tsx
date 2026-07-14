import { Check, X } from 'lucide-react';
import { Badge } from '@components/ui/badge';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import type { StaffLeaveRequest } from '@app-types/staff/leave-request';
import { formatDate } from '@utils/format';

interface StaffLeaveRequestsTableProps {
  requests: StaffLeaveRequest[];
  onApprove: (request: StaffLeaveRequest) => void;
  onReject: (request: StaffLeaveRequest) => void;
  isReviewPending?: boolean;
}

function statusVariant(status: StaffLeaveRequest['status']) {
  if (status === 'approved') return 'success' as const;
  if (status === 'rejected') return 'destructive' as const;
  return 'secondary' as const;
}

export function StaffLeaveRequestsTable({
  requests,
  onApprove,
  onReject,
  isReviewPending,
}: StaffLeaveRequestsTableProps) {
  const columns: DataTableColumn<StaffLeaveRequest>[] = [
    {
      id: 'staff',
      header: 'Staff',
      cellClassName: 'font-medium',
      cell: (row) => (
        <div>
          <span>{row.staff_name ?? '—'}</span>
          <p className="text-xs font-normal text-muted-foreground">{row.employee_id ?? '—'}</p>
        </div>
      ),
    },
    {
      id: 'type',
      header: 'Leave type',
      cellClassName: 'text-muted-foreground',
      cell: (row) => row.leave_type_name ?? '—',
    },
    {
      id: 'dates',
      header: 'Dates',
      cellClassName: 'text-muted-foreground',
      cell: (row) => {
        if (!row.leave_from && !row.leave_to) return '—';
        return `${formatDate(row.leave_from)} – ${formatDate(row.leave_to)}`;
      },
    },
    {
      id: 'days',
      header: 'Days',
      cellClassName: 'tabular-nums',
      cell: (row) => row.leave_days,
    },
    {
      id: 'status',
      header: 'Status',
      cell: (row) => (
        <Badge variant={statusVariant(row.status)} className="capitalize">
          {row.status}
        </Badge>
      ),
    },
    {
      id: 'remark',
      header: 'Remark',
      cellClassName: 'text-muted-foreground max-w-[16rem]',
      cell: (row) => row.employee_remark || '—',
      wrap: true,
    },
  ];

  return (
    <DataTable
      data={requests}
      columns={columns}
      getRowKey={(row) => row.id}
      actions={(row) => {
        if (row.status !== 'pending') {
          return <span className="text-xs capitalize text-muted-foreground">{row.status}</span>;
        }
        return (
          <>
            <PermissionButton
              permission="staff.edit"
              variant="ghost"
              size="sm"
              disabled={isReviewPending}
              onClick={() => onApprove(row)}
              aria-label={`Approve leave for ${row.staff_name}`}
            >
              <Check className="h-4 w-4" />
            </PermissionButton>
            <PermissionButton
              permission="staff.edit"
              variant="ghost"
              size="sm"
              disabled={isReviewPending}
              onClick={() => onReject(row)}
              aria-label={`Reject leave for ${row.staff_name}`}
              className="text-destructive hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </PermissionButton>
          </>
        );
      }}
    />
  );
}
