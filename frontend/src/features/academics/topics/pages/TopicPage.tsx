import { useState } from 'react';
import { ModuleListPack } from '@workflow-packs';
import { TopicTable } from '../components/TopicTable';
import { TopicCreateDialog } from '../components/TopicCreateDialog';
import { TopicUpdateDialog } from '../components/TopicUpdateDialog';
import { useTopicList, useCreateTopic, useUpdateTopic, useDeleteTopic } from '@/hooks/useTopics';
import type { Topic, TopicCreatePayload, TopicUpdatePayload } from '@/types/academics/topic';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { Plus } from 'lucide-react';

export function TopicPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useTopicList({ page });

  const topics = data?.results || [];
  const count = data?.count || 0;

  const createMutation = useCreateTopic();
  const updateMutation = useUpdateTopic();
  const deleteMutation = useDeleteTopic();

  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const closeFormDialog = () => {
    setSelectedTopic(null);
    setIsCreateOpen(false);
  };

  const handleCreateSubmit = (payload: TopicCreatePayload) => {
    createMutation.mutate(payload, { onSuccess: closeFormDialog });
  };

  const handleUpdateSubmit = (id: number, payload: TopicUpdatePayload) => {
    updateMutation.mutate({ id, data: payload }, { onSuccess: closeFormDialog });
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const addTopicAction = (
    <PermissionButton
      permission="manage_topic.create"
      onClick={() => setIsCreateOpen(true)}
      className="gap-1"
    >
      <Plus className="h-4 w-4" aria-hidden="true" />
      Add Topic
    </PermissionButton>
  );

  return (
    <ModuleListPack
      title="Topics"
      description="Manage topics associated with lessons and track their completion status."
      actions={addTopicAction}
      isLoading={isLoading}
      loadingMessage="Loading topics..."
      isError={isError}
      errorMessage="Failed to load topics. Please try again later."
      isEmpty={!isLoading && !isError && topics.length === 0}
      emptyTitle="No topics found"
      emptyDescription="No topics have been created yet."
      emptyAction={addTopicAction}
      footer={
        <>
          <TopicCreateDialog
            open={isCreateOpen}
            onOpenChange={setIsCreateOpen}
            onSubmit={handleCreateSubmit}
            isLoading={createMutation.isPending}
          />
          <TopicUpdateDialog
            open={selectedTopic !== null}
            onOpenChange={(open) => {
              if (!open) closeFormDialog();
            }}
            topic={selectedTopic}
            onSubmit={handleUpdateSubmit}
            isLoading={updateMutation.isPending}
          />
        </>
      }
    >
      <TopicTable
        topics={topics}
        pagination={{
          page,
          pageSize: 10,
          totalCount: count,
          onPageChange: setPage,
        }}
        onEdit={setSelectedTopic}
        onDelete={handleDelete}
      />
    </ModuleListPack>
  );
}
