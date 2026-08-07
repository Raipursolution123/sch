import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { Badge } from '@components/ui/badge';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { PermissionButton } from '@components/rbac/PermissionButton';
import {
  useApproveStaffPayrollIncrement,
  useRejectStaffPayrollIncrement,
  useStaffPayrollIncrements,
} from '@hooks/useStaffPayrollIncrement';
import type { StaffPayrollIncrement } from '@services/api/staff-payroll-increment.service';
import { ModuleListPack } from '@workflow-packs';
import { formatDate } from '@utils/format';

function statusVariant(status: string) {
  if (status === 'approved') return 'success' as const;
  if (status === 'rejected') return 'destructive' as const;
  return 'secondary' as const;
}

export function StaffPayrollIncrementApprovePage() {
  const { data = [], isLoading, isError, error, refetch } = useStaffPayrollIncrements('pending');
  const approveMutation = useApproveStaffPayrollIncrement();
  const rejectMutation = useRejectStaffPayrollIncrement();
  const [search, setSearch] = useState('');

  const filtered = data.filter((row) => {
    const q = search.toLowerCase();
    return (
      !q ||
      row.staff_name.toLowerCase().includes(q) ||
      row.employee_id.toLowerCase().includes(q) ||
      row.month.toLowerCase().includes(q)
    );
  });

  const columns: DataTableColumn<StaffPayrollIncrement>[] = [
    {
      id: 'staff',
      header: 'Staff',
      cellClassName: 'font-medium',
      cell: (row) => (
        <div>
          <span>{row.staff_name}</span>
          <p className="text-xs font-normal text-muted-foreground">{row.employee_id || '—'}</p>
        </div>
      ),
    },
    { id: 'period', header: 'Period', cell: (row) => `${row.month} ${row.year}` },
    {
      id: 'basic',
      header: 'Current basic',
      cellClassName: 'tabular-nums',
      cell: (row) => row.basic_salary.toLocaleString(),
    },
    {
      id: 'increment',
      header: 'Increment',
      cellClassName: 'tabular-nums',
      cell: (row) => row.increment.toLocaleString(),
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
      id: 'date',
      header: 'Requested',
      cellClassName: 'text-muted-foreground',
      cell: (row) => formatDate(row.date),
    },
  ];

  const isActionPending = approveMutation.isPending || rejectMutation.isPending;

  return (
    <ModuleListPack
      title="Approve Payroll Increment"
      description="Review pending salary increment requests."
      isLoading={isLoading}
      loadingMessage="Loading pending increments..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && data.length === 0}
      emptyTitle="No pending increments"
      emptyDescription="Pending payroll increment requests will appear here for approval."
    >
      <DataTable
        data={filtered}
        columns={columns}
        getRowKey={(row) => row.id}
        searchValue={search}
        onSearchChange={setSearch}
        actions={(row) => (
          <>
            <PermissionButton
              permission="staff.edit"
              variant="ghost"
              size="sm"
              title="Approve"
              disabled={isActionPending}
              onClick={() => approveMutation.mutate(row.id)}
            >
              <Check className="h-4 w-4 text-emerald-600" />
            </PermissionButton>
            <PermissionButton
              permission="staff.edit"
              variant="ghost"
              size="sm"
              title="Reject"
              disabled={isActionPending}
              onClick={() => rejectMutation.mutate(row.id)}
              className="text-destructive hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </PermissionButton>
          </>
        )}
      />
    </ModuleListPack>
  );
}
