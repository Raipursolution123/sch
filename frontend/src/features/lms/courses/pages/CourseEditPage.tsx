import { useParams } from 'react-router-dom';
import { CourseForm } from '../components/CourseForm';
import { useCourse, useUpdateCourse } from '../../hooks/useCourses';
import { PageHeader } from '@components/layout/PageHeader';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@components/ui/alert';

export default function CourseEditPage() {
  const { id } = useParams<{ id: string }>();
  const courseId = Number(id);

  const { data: course, isLoading, isError } = useCourse(courseId);
  const updateMutation = useUpdateCourse(courseId);

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !course) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load course details. It may have been deleted.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Edit Online Course" description={`Update details for: ${course.title}`} />
      <CourseForm
        initialValues={course}
        onSubmit={(v) => updateMutation.mutate(v)}
        isSubmitting={updateMutation.isPending}
      />
    </div>
  );
}
