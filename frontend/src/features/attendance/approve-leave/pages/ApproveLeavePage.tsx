import { useState } from 'react';

import { Button } from '@components/ui/button';
import { Plus } from 'lucide-react';
import { ApproveLeaveTable } from '../components/ApproveLeaveTable';
import { ApproveLeaveModal } from '../components/ApproveLeaveModal';
import { type ApproveLeave } from '@services/api/approve-leave.service';

export function ApproveLeavePage() {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Approve Leave</h1>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Leave Request
        </Button>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="flex flex-col space-y-1.5 p-6">
          <h3 className="text-lg font-semibold leading-none tracking-tight">Leave Requests</h3>
        </div>
        <div className="p-6 pt-0">
          <ApproveLeaveTable onEdit={handleEdit} />
        </div>
      </div>

      <ApproveLeaveModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        leave={selectedLeave}
      />
    </div>
  );
}
