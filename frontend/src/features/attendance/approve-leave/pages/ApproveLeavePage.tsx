import { useState } from 'react';
import { Plus } from 'lucide-react';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { ModuleListPack } from '@workflow-packs';
import { ApproveLeaveTable } from '../components/ApproveLeaveTable';
import { ApproveLeaveModal } from '../components/ApproveLeaveModal';
import { useApproveLeaves } from '@hooks/useApproveLeave';
import type { ApproveLeave } from '@services/api/approve-leave.service';

export function ApproveLeavePage() {
  const { data, isLoading, isError, error, refetch } = useApproveLeaves();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<ApproveLeave | null>(null);

  const handleEdit = (leave: ApproveLeave) => {
    setSelectedLeave(leave);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedLeave(null);
    setIsModalOpen(true);
  };

  const addAction = (
    <PermissionButton permission="attendance.report" onClick={handleAdd} className="gap-1">
      <Plus className="h-4 w-4" aria-hidden="true" />
      Add Leave Request
    </PermissionButton>
  );

  const leaves = data?.results ?? [];

  return (
    <ModuleListPack
      title="Approve Leave"
      description="Review and action student leave requests and attendance exceptions."
      actions={addAction}
      isLoading={isLoading}
      loadingMessage="Loading leave requests..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && leaves.length === 0}
      emptyTitle="No leave requests"
      emptyDescription="Student leave requests will appear here for review."
      emptyAction={addAction}
      footer={
        <ApproveLeaveModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          leave={selectedLeave}
        />
      }
    >
      <ApproveLeaveTable onEdit={handleEdit} />
    </ModuleListPack>
  );
}
