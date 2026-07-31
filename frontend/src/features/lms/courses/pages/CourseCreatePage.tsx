import { CourseForm } from '../components/CourseForm';
import { useCreateCourse } from '../../hooks/useCourses';
import { PageHeader } from '@components/layout/PageHeader';

export default function CourseCreatePage() {
  const createMutation = useCreateCourse();

  return (
    <div className="space-y-6">
      <PageHeader title="Create Online Course" description="Add a new course to the LMS" />
      <CourseForm
        onSubmit={(v) => createMutation.mutate(v)}
        isSubmitting={createMutation.isPending}
      />
    </div>
  );
}
