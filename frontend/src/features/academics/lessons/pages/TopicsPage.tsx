import { useState } from 'react';
import { ModuleListPack } from '@workflow-packs';
import { TopicTable } from '../../topics/components/TopicTable';
import { TopicCreateDialog } from '../../topics/components/TopicCreateDialog';
import { TopicUpdateDialog } from '../../topics/components/TopicUpdateDialog';
import { useTopicList, useCreateTopic, useUpdateTopic, useDeleteTopic } from '@hooks/useTopics';
import type { Topic, TopicCreatePayload, TopicUpdatePayload } from '@app-types/academics/topic';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { Plus } from 'lucide-react';

export function TopicsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error, refetch } = useTopicList({ page });

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
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Topics</h1>
        <p className="text-sm text-muted-foreground">
          Manage topic outlines associated with subject lessons.
        </p>
      </div>

      <ModuleListPack
        title=""
        description=""
        actions={addTopicAction}
        isLoading={isLoading}
        loadingMessage="Loading topics..."
        isError={isError}
        error={error}
        onRetry={() => void refetch()}
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
    </div>
  );
}
