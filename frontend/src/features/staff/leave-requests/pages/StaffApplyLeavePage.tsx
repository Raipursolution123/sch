import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Badge } from '@components/ui/badge';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { StaffLeaveRequestFormDialog } from '@features/staff/leave-requests/components/StaffLeaveRequestFormDialog';
import type { StaffLeaveRequestFormValues } from '@features/staff/leave-requests/schemas/leave-request.schema';
import { useLeaveTypes } from '@hooks/useLeaveTypes';
import { useApplyStaffLeave, useMyStaffLeaveRequests } from '@hooks/useStaffLeaveRequests';
import { useStaff } from '@hooks/useStaff';
import type { StaffLeaveRequest } from '@app-types/staff/leave-request';
import { ModuleListPack } from '@workflow-packs';
import { formatDate } from '@utils/format';

function statusVariant(status: StaffLeaveRequest['status']) {
  if (status === 'approved') return 'success' as const;
  if (status === 'rejected') return 'destructive' as const;
  return 'secondary' as const;
}

export function StaffApplyLeavePage() {
  const { data: requests = [], isLoading, isError, error, refetch } = useMyStaffLeaveRequests();
  const { data: staffPage } = useStaff(1);
  const staff = staffPage?.results ?? [];
  const { data: leaveTypes = [] } = useLeaveTypes();
  const applyMutation = useApplyStaffLeave();
  const [createOpen, setCreateOpen] = useState(false);

  const canApply =
    staff.some((s) => s.is_active === 'yes') && leaveTypes.some((t) => t.is_active === 'yes');

  const handleApply = (values: StaffLeaveRequestFormValues) => {
    applyMutation.mutate(
      {
        staff_id: values.staff_id,
        leave_type_id: values.leave_type_id,
        leave_from: values.leave_from,
        leave_to: values.leave_to,
        employee_remark: values.employee_remark?.trim() || '',
      },
      { onSuccess: () => setCreateOpen(false) },
    );
  };

  const columns: DataTableColumn<StaffLeaveRequest>[] = [
    {
      id: 'type',
      header: 'Leave type',
      cell: (row) => row.leave_type_name ?? '—',
    },
    {
      id: 'dates',
      header: 'Dates',
      cellClassName: 'text-muted-foreground',
      cell: (row) => `${formatDate(row.leave_from)} – ${formatDate(row.leave_to)}`,
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

  const applyAction = (
    <PermissionButton
      permission="apply_leave"
      onClick={() => setCreateOpen(true)}
      className="gap-1"
      disabled={!canApply}
      title={canApply ? undefined : 'Configure leave types and ensure your staff profile is active'}
    >
      <Plus className="h-4 w-4" aria-hidden="true" />
      Apply Leave
    </PermissionButton>
  );

  return (
    <ModuleListPack
      title="Apply Leave"
      description="Submit leave requests for your staff profile and track their status."
      actions={applyAction}
      isLoading={isLoading}
      loadingMessage="Loading your leave requests..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && requests.length === 0}
      emptyTitle="No leave requests yet"
      emptyDescription="Submit a leave request when you need time off."
      emptyAction={canApply ? applyAction : undefined}
      footer={
        <StaffLeaveRequestFormDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          staff={staff}
          leaveTypes={leaveTypes}
          onSubmit={handleApply}
          isLoading={applyMutation.isPending}
        />
      }
    >
      {requests.length > 0 ? (
        <DataTable data={requests} columns={columns} getRowKey={(row) => row.id} />
      ) : null}
    </ModuleListPack>
  );
}
