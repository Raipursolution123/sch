import { useState } from 'react';
import { ModuleListPack } from '@workflow-packs';
import { SyllabusStatusTable } from '../components/SyllabusStatusTable';
import { SyllabusStatusUpdateDialog } from '../components/SyllabusStatusUpdateDialog';
import { SyllabusStatusCreateDialog } from '../components/SyllabusStatusCreateDialog';
import {
  useSyllabusStatusList,
  useUpdateSyllabusStatus,
  useCreateSyllabusStatus,
  useDeleteSyllabusStatus,
} from '@hooks/useSyllabusStatus';
import type {
  SyllabusStatus,
  SyllabusStatusCreatePayload,
  SyllabusStatusUpdatePayload,
} from '@app-types/academics/syllabus-status';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { Plus } from 'lucide-react';

export function SyllabusStatusPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error, refetch } = useSyllabusStatusList({ page });
  const syllabusStatuses = data?.results || [];
  const count = data?.count || 0;

  const updateMutation = useUpdateSyllabusStatus();
  const createMutation = useCreateSyllabusStatus();
  const deleteMutation = useDeleteSyllabusStatus();

  const [selectedSyllabus, setSelectedSyllabus] = useState<SyllabusStatus | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const closeFormDialog = () => {
    setSelectedSyllabus(null);
    setIsCreateOpen(false);
  };

  const handleCreateSubmit = (data: SyllabusStatusCreatePayload) => {
    createMutation.mutate(data, { onSuccess: closeFormDialog });
  };

  const handleUpdateStatus = (data: SyllabusStatusUpdatePayload) => {
    if (selectedSyllabus) {
      updateMutation.mutate({ id: selectedSyllabus.id, data }, { onSuccess: closeFormDialog });
    }
  };

  const handleDeleteStatus = (id: number) => {
    deleteMutation.mutate(id);
  };

  const addSyllabusAction = (
    <PermissionButton
      permission="manage_syllabus_status.create"
      onClick={() => setIsCreateOpen(true)}
      className="gap-1"
    >
      <Plus className="h-4 w-4" aria-hidden="true" />
      Add Syllabus
    </PermissionButton>
  );

  return (
    <ModuleListPack
      title="Syllabus Status"
      description="Manage and track syllabus status for all lessons and topics."
      actions={addSyllabusAction}
      isLoading={isLoading}
      loadingMessage="Loading syllabus status..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && syllabusStatuses.length === 0}
      emptyTitle="No syllabus found"
      emptyDescription="No syllabus has been assigned or created yet."
      emptyAction={addSyllabusAction}
      footer={
        <>
          <SyllabusStatusCreateDialog
            open={isCreateOpen}
            onOpenChange={setIsCreateOpen}
            onSubmit={handleCreateSubmit}
            isLoading={createMutation.isPending}
          />
          <SyllabusStatusUpdateDialog
            open={selectedSyllabus !== null}
            onOpenChange={(open) => {
              if (!open) closeFormDialog();
            }}
            syllabus={selectedSyllabus}
            onSubmit={handleUpdateStatus}
            isLoading={updateMutation.isPending}
          />
        </>
      }
    >
      <SyllabusStatusTable
        syllabusStatuses={syllabusStatuses}
        pagination={{
          page,
          pageSize: 10,
          totalCount: count,
          onPageChange: setPage,
        }}
        onEditStatus={(syllabus) => {
          setSelectedSyllabus(syllabus);
        }}
        onDeleteStatus={handleDeleteStatus}
      />
    </ModuleListPack>
  );
}
