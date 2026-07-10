import { PermissionButton } from '@components/rbac/PermissionButton';
import { cn } from '@utils/cn';

interface ApprovalActionBarProps {
  onApprove?: () => void;
  onReject?: () => void;
  onSubmit?: () => void;
  isLoading?: boolean;
  className?: string;
}

export function ApprovalActionBar({
  onApprove,
  onReject,
  onSubmit,
  isLoading,
  className,
}: ApprovalActionBarProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {onSubmit && (
        <PermissionButton permission="exams.submit" onClick={onSubmit} isLoading={isLoading}>
          Submit for approval
        </PermissionButton>
      )}
      {onApprove && (
        <PermissionButton permission="exams.approve" onClick={onApprove} isLoading={isLoading}>
          Approve
        </PermissionButton>
      )}
      {onReject && (
        <PermissionButton
          permission="exams.approve"
          variant="outline"
          onClick={onReject}
          disabled={isLoading}
          className="text-destructive hover:text-destructive"
        >
          Reject
        </PermissionButton>
      )}
    </div>
  );
}
