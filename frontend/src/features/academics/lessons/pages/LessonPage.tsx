import { useState } from 'react';
import { ModuleListPack } from '@workflow-packs';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs';

// Lesson Imports
import { LessonTable } from '../components/LessonTable';
import { LessonCreateDialog } from '../components/LessonCreateDialog';
import { LessonUpdateDialog } from '../components/LessonUpdateDialog';
import {
  useLessonList,
  useCreateLesson,
  useUpdateLesson,
  useDeleteLesson,
} from '@/hooks/useLessons';
import type { Lesson, LessonCreatePayload, LessonUpdatePayload } from '@/types/academics/lesson';

// Topic Imports
import { TopicTable } from '../../topics/components/TopicTable';
import { TopicCreateDialog } from '../../topics/components/TopicCreateDialog';
import { TopicUpdateDialog } from '../../topics/components/TopicUpdateDialog';
import { useTopicList, useCreateTopic, useUpdateTopic, useDeleteTopic } from '@/hooks/useTopics';
import type { Topic, TopicCreatePayload, TopicUpdatePayload } from '@/types/academics/topic';

import { PermissionButton } from '@components/rbac/PermissionButton';
import { Plus } from 'lucide-react';

export function LessonPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Lessons & Topics</h1>
          <p className="text-sm text-muted-foreground">
            Manage lessons and topics associated with subjects.
          </p>
        </div>
      </div>

      <Tabs defaultValue="lessons" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="lessons">Lessons</TabsTrigger>
          <TabsTrigger value="topics">Topics</TabsTrigger>
        </TabsList>

        <TabsContent value="lessons" className="mt-0">
          <LessonTabContent />
        </TabsContent>

        <TabsContent value="topics" className="mt-0">
          <TopicTabContent />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function LessonTabContent() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useLessonList({ page });

  const lessons = data?.results || [];
  const count = data?.count || 0;

  const createMutation = useCreateLesson();
  const updateMutation = useUpdateLesson();
  const deleteMutation = useDeleteLesson();

  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const closeFormDialog = () => {
    setSelectedLesson(null);
    setIsCreateOpen(false);
  };

  const handleCreateSubmit = (payload: LessonCreatePayload) => {
    createMutation.mutate(payload, { onSuccess: closeFormDialog });
  };

  const handleUpdateSubmit = (id: number, payload: LessonUpdatePayload) => {
    updateMutation.mutate({ id, data: payload }, { onSuccess: closeFormDialog });
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const addLessonAction = (
    <PermissionButton
      permission="manage_lesson.create"
      onClick={() => setIsCreateOpen(true)}
      className="gap-1"
    >
      <Plus className="h-4 w-4" aria-hidden="true" />
      Add Lesson
    </PermissionButton>
  );

  return (
    <ModuleListPack
      title=""
      description=""
      actions={addLessonAction}
      isLoading={isLoading}
      loadingMessage="Loading lessons..."
      isError={isError}
      errorMessage="Failed to load lessons. Please try again later."
      isEmpty={!isLoading && !isError && lessons.length === 0}
      emptyTitle="No lessons found"
      emptyDescription="No lessons have been created yet."
      emptyAction={addLessonAction}
      footer={
        <>
          <LessonCreateDialog
            open={isCreateOpen}
            onOpenChange={setIsCreateOpen}
            onSubmit={handleCreateSubmit}
            isLoading={createMutation.isPending}
          />
          <LessonUpdateDialog
            open={selectedLesson !== null}
            onOpenChange={(open) => {
              if (!open) closeFormDialog();
            }}
            lesson={selectedLesson}
            onSubmit={handleUpdateSubmit}
            isLoading={updateMutation.isPending}
          />
        </>
      }
    >
      <LessonTable
        lessons={lessons}
        pagination={{
          page,
          pageSize: 10,
          totalCount: count,
          onPageChange: setPage,
        }}
        onEdit={setSelectedLesson}
        onDelete={handleDelete}
      />
    </ModuleListPack>
  );
}

function TopicTabContent() {
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
      title=""
      description=""
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
