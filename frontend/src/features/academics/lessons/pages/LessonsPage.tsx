import { useState } from 'react';
import { ModuleListPack } from '@workflow-packs';
import { LessonTable } from '../components/LessonTable';
import { LessonCreateDialog } from '../components/LessonCreateDialog';
import { LessonUpdateDialog } from '../components/LessonUpdateDialog';
import {
  useLessonList,
  useCreateLesson,
  useUpdateLesson,
  useDeleteLesson,
} from '@hooks/useLessons';
import type { Lesson, LessonCreatePayload, LessonUpdatePayload } from '@app-types/academics/lesson';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { Plus } from 'lucide-react';

export function LessonsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error, refetch } = useLessonList({ page });

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
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Lessons</h1>
        <p className="text-sm text-muted-foreground">
          Manage institution lessons associated with subjects.
        </p>
      </div>

      <ModuleListPack
        title=""
        description=""
        actions={addLessonAction}
        isLoading={isLoading}
        loadingMessage="Loading lessons..."
        isError={isError}
        error={error}
        onRetry={() => void refetch()}
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
    </div>
  );
}
