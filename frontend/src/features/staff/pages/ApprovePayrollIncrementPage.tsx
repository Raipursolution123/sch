import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { PermissionButton } from '@components/rbac/PermissionButton';
import {
  useApproveStaffPayrollIncrement,
  useRejectStaffPayrollIncrement,
  useStaffPayrollIncrements,
} from '@hooks/useStaffPayrollIncrement';
import type { StaffPayrollIncrement } from '@app-types/staff/payroll-increment';
import { ModuleListPack } from '@workflow-packs';
import { formatAmount } from '@utils/format';

export function ApprovePayrollIncrementPage() {
  const { data = [], isLoading, isError, error, refetch } = useStaffPayrollIncrements();
  const approveMutation = useApproveStaffPayrollIncrement();
  const rejectMutation = useRejectStaffPayrollIncrement();

  const [approveTarget, setApproveTarget] = useState<StaffPayrollIncrement | null>(null);
  const [rejectTarget, setRejectTarget] = useState<StaffPayrollIncrement | null>(null);

  const columns: DataTableColumn<StaffPayrollIncrement>[] = [
    {
      id: 'staff',
      header: 'Staff Name',
      cellClassName: 'font-medium',
      cell: (r) => (
        <div>
          <span>{r.staff_name}</span>
          <p className="text-xs font-normal text-muted-foreground">{r.employee_id}</p>
        </div>
      ),
    },
    {
      id: 'period',
      header: 'Period',
      cell: (r) => `${r.month} ${r.year}`,
    },
    {
      id: 'basic_salary',
      header: 'Basic Salary',
      cellClassName: 'tabular-nums',
      cell: (r) => formatAmount(r.basic_salary),
    },
    {
      id: 'increment',
      header: 'Increment Amount',
      cellClassName: 'tabular-nums text-success font-medium',
      cell: (r) => `+ ${formatAmount(r.increment)}`,
    },
    {
      id: 'status',
      header: 'Status',
      cell: (r) => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase ${
            r.status === 'approved'
              ? 'bg-success/15 text-success'
              : r.status === 'rejected'
                ? 'bg-destructive/15 text-destructive'
                : 'bg-warning/15 text-warning'
          }`}
        >
          {r.status}
        </span>
      ),
    },
  ];

  return (
    <>
      <ModuleListPack
        title="Approve Payroll Increments"
        description="Review, approve, or reject pending payroll increment requests."
        isLoading={isLoading}
        loadingMessage="Loading increments..."
        isError={isError}
        error={error}
        onRetry={() => void refetch()}
        isEmpty={!isLoading && !isError && data.length === 0}
        emptyTitle="No requests found"
        emptyDescription="There are currently no payroll increment requests to approve."
      >
        <DataTable
          data={data}
          columns={columns}
          getRowKey={(r) => r.pi_id}
          actions={(row) => (
            <>
              {row.status === 'pending' && (
                <div className="flex gap-2">
                  <PermissionButton
                    permission="staff.payroll.edit"
                    variant="outline"
                    size="sm"
                    className="border-success text-success hover:bg-success/10 hover:text-success gap-1"
                    onClick={() => setApproveTarget(row)}
                  >
                    <Check className="h-4 w-4" />
                    Approve
                  </PermissionButton>
                  <PermissionButton
                    permission="staff.payroll.edit"
                    variant="outline"
                    size="sm"
                    className="border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive gap-1"
                    onClick={() => setRejectTarget(row)}
                  >
                    <X className="h-4 w-4" />
                    Reject
                  </PermissionButton>
                </div>
              )}
            </>
          )}
        />
      </ModuleListPack>

      <ConfirmDialog
        open={approveTarget !== null}
        onOpenChange={(v) => !v && setApproveTarget(null)}
        title="Approve increment request?"
        description={`Approve the increment of ${formatAmount(approveTarget?.increment || 0)} for ${approveTarget?.staff_name}. This will update their basic salary.`}
        confirmLabel="Approve"
        onConfirm={() => {
          if (!approveTarget) return;
          approveMutation.mutate(approveTarget.pi_id, { onSuccess: () => setApproveTarget(null) });
        }}
        isLoading={approveMutation.isPending}
      />

      <ConfirmDialog
        open={rejectTarget !== null}
        onOpenChange={(v) => !v && setRejectTarget(null)}
        title="Reject increment request?"
        description={`Reject the increment request for ${rejectTarget?.staff_name}.`}
        confirmLabel="Reject"
        destructive
        onConfirm={() => {
          if (!rejectTarget) return;
          rejectMutation.mutate(rejectTarget.pi_id, { onSuccess: () => setRejectTarget(null) });
        }}
        isLoading={rejectMutation.isPending}
      />
    </>
  );
}
