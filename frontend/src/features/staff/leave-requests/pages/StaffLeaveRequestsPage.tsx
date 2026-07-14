import { useState } from 'react';
import { Plus } from 'lucide-react';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { StaffLeaveRequestFormDialog } from '@features/staff/leave-requests/components/StaffLeaveRequestFormDialog';
import { StaffLeaveRequestsTable } from '@features/staff/leave-requests/components/StaffLeaveRequestsTable';
import type { StaffLeaveRequestFormValues } from '@features/staff/leave-requests/schemas/leave-request.schema';
import { useLeaveTypes } from '@hooks/useLeaveTypes';
import {
  useCreateStaffLeaveRequest,
  useReviewStaffLeaveRequest,
  useStaffLeaveRequests,
} from '@hooks/useStaffLeaveRequests';
import { useStaff } from '@hooks/useStaff';
import type { StaffLeaveRequest } from '@app-types/staff/leave-request';
import { ModuleListPack } from '@workflow-packs';

type ReviewMode = 'approved' | 'rejected' | null;

export function StaffLeaveRequestsPage() {
  const { data: requests, isLoading, isError, error, refetch } = useStaffLeaveRequests();
  const { data: staffPage } = useStaff(1);
  const staff = staffPage?.results ?? [];
  const { data: leaveTypes = [] } = useLeaveTypes();
  const createMutation = useCreateStaffLeaveRequest();
  const reviewMutation = useReviewStaffLeaveRequest();

  const [createOpen, setCreateOpen] = useState(false);
  const [reviewMode, setReviewMode] = useState<ReviewMode>(null);
  const [reviewTarget, setReviewTarget] = useState<StaffLeaveRequest | null>(null);

  const canCreate =
    staff.some((s) => s.is_active === 'yes') && leaveTypes.some((t) => t.is_active === 'yes');

  const handleCreate = (values: StaffLeaveRequestFormValues) => {
    createMutation.mutate(
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

  const openReview = (request: StaffLeaveRequest, mode: 'approved' | 'rejected') => {
    setReviewTarget(request);
    setReviewMode(mode);
  };

  const closeReview = () => {
    setReviewMode(null);
    setReviewTarget(null);
  };

  const addAction = (
    <PermissionButton
      permission="staff.create"
      onClick={() => setCreateOpen(true)}
      className="gap-1"
      disabled={!canCreate}
      title={canCreate ? undefined : 'Add leave types and active staff first'}
    >
      <Plus className="h-4 w-4" aria-hidden="true" />
      Add Request
    </PermissionButton>
  );

  return (
    <ModuleListPack
      title="Leave Requests"
      description="Review pending staff leave requests. Approve or reject pending items."
      actions={addAction}
      prerequisiteHint={
        !canCreate && !isLoading ? (
          <p className="text-sm text-muted-foreground">
            Configure leave types and ensure staff records exist before creating requests.
          </p>
        ) : undefined
      }
      isLoading={isLoading}
      loadingMessage="Loading leave requests..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && (requests?.length ?? 0) === 0}
      emptyTitle="No leave requests"
      emptyDescription="Create a leave request for a staff member to begin review."
      emptyAction={canCreate ? addAction : undefined}
      footer={
        <>
          <StaffLeaveRequestFormDialog
            open={createOpen}
            onOpenChange={setCreateOpen}
            staff={staff}
            leaveTypes={leaveTypes}
            onSubmit={handleCreate}
            isLoading={createMutation.isPending}
          />

          <ConfirmDialog
            open={reviewMode !== null}
            onOpenChange={(open) => {
              if (!open) closeReview();
            }}
            title={reviewMode === 'approved' ? 'Approve leave request?' : 'Reject leave request?'}
            description={
              reviewTarget
                ? `${reviewMode === 'approved' ? 'Approve' : 'Reject'} leave for ${reviewTarget.staff_name ?? 'staff'} (${reviewTarget.leave_type_name ?? 'leave'}).`
                : ''
            }
            confirmLabel={reviewMode === 'approved' ? 'Approve' : 'Reject'}
            destructive={reviewMode === 'rejected'}
            isLoading={reviewMutation.isPending}
            onConfirm={() => {
              if (!reviewTarget || !reviewMode) return;
              reviewMutation.mutate(
                {
                  id: reviewTarget.id,
                  payload: { status: reviewMode },
                },
                { onSuccess: closeReview },
              );
            }}
          />
        </>
      }
    >
      <StaffLeaveRequestsTable
        requests={requests ?? []}
        onApprove={(row) => openReview(row, 'approved')}
        onReject={(row) => openReview(row, 'rejected')}
        isReviewPending={reviewMutation.isPending}
      />
    </ModuleListPack>
  );
}
