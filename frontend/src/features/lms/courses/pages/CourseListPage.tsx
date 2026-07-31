import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@constants/index';
import { ModuleListPack } from '@workflow-packs/layouts/ModuleListPack';
import { useCourses, useDeleteCourse } from '../../hooks/useCourses';
import { Edit2, Trash2, Plus } from 'lucide-react';
import { Button } from '@components/ui/button';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import type { Course } from '@app-types/lms';
import { Badge } from '@components/ui/badge';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';

export default function CourseListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { data, isLoading, isError, error, refetch } = useCourses(page, pageSize);
  const deleteMutation = useDeleteCourse();

  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

  const handleDelete = () => {
    if (courseToDelete) {
      deleteMutation.mutate(courseToDelete.id, {
        onSuccess: () => setCourseToDelete(null),
      });
    }
  };

  const columns = useMemo<DataTableColumn<Course>[]>(
    () => [
      {
        id: 'title',
        header: 'Title',
        enableSorting: true,
        sortValue: (c) => c.title,
        cellClassName: 'font-medium',
        cell: (c) => c.title,
      },
      {
        id: 'price',
        header: 'Price',
        cell: (c) =>
          c.free_course === 1 ? (
            <Badge variant="secondary">Free</Badge>
          ) : (
            `₹${Number(c.price).toFixed(2)}`
          ),
      },
      {
        id: 'visibility',
        header: 'Visibility',
        cell: (c) =>
          c.front_side_visibility === 'yes' ? (
            <Badge>Visible</Badge>
          ) : (
            <Badge variant="outline">Hidden</Badge>
          ),
      },
      {
        id: 'status',
        header: 'Status',
        cell: (c) =>
          c.status === 1 ? (
            <Badge className="bg-green-600 hover:bg-green-600">Active</Badge>
          ) : (
            <Badge variant="secondary">Draft</Badge>
          ),
      },
    ],
    [],
  );

  const addAction = (
    <Button onClick={() => navigate(ROUTES.lms.courses.new)}>
      <Plus className="mr-2 h-4 w-4" />
      Add Course
    </Button>
  );

  return (
    <ModuleListPack
      title="Online Courses"
      description="Manage your online courses, pricing, and visibility"
      actions={addAction}
      isLoading={isLoading}
      loadingMessage="Loading courses..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && (data?.results?.length ?? 0) === 0}
      emptyTitle="No courses found"
      emptyDescription="Create your first online course to start teaching."
      emptyAction={addAction}
      footer={
        <ConfirmDialog
          open={!!courseToDelete}
          onOpenChange={(open) => !open && setCourseToDelete(null)}
          title="Delete Course"
          description={`Are you sure you want to delete "${courseToDelete?.title}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          isLoading={deleteMutation.isPending}
          destructive
          confirmLabel="Delete"
        />
      }
    >
      <DataTable
        data={data?.results || []}
        columns={columns}
        getRowKey={(c) => c.id}
        enableSorting
        pagination={{
          page,
          pageSize,
          totalCount: data?.count || 0,
          onPageChange: setPage,
        }}
        actions={(c) => (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(ROUTES.lms.courses.edit(c.id))}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-500 hover:bg-red-50 hover:text-red-600"
              onClick={() => setCourseToDelete(c)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
      />
    </ModuleListPack>
  );
}
