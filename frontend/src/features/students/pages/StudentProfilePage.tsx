import { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { Button } from '@components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { LoadingState } from '@components/feedback/LoadingState';
import { ErrorState } from '@components/feedback/ErrorState';
import { StudentOverviewTab } from '@features/students/components/StudentOverviewTab';
import { StudentAcademicTab } from '@features/students/components/StudentAcademicTab';
import { StudentFeesTab } from '@features/students/components/StudentFeesTab';
import { StudentGuardiansTab } from '@features/students/components/StudentGuardiansTab';
import { StudentAdmissionDialog } from '@features/students/components/StudentAdmissionDialog';
import type { StudentAdmissionFormValues } from '@features/students/schemas/student-admission.schema';
import { toStudentPayload } from '@features/students/utils/student-payload';
import { useStudent, useUpdateStudent, useDeleteStudent } from '@hooks/useStudents';
import { useClasses } from '@hooks/useClasses';
import { useSections } from '@hooks/useSections';
import { ROUTES } from '@constants/index';

const PROFILE_TABS = [
  { id: 'overview', label: 'Overview', enabled: true },
  { id: 'academic', label: 'Academic', enabled: true },
  { id: 'guardians', label: 'Guardians', enabled: true },
  { id: 'fees', label: 'Fees', enabled: true },
] as const;

type ProfileTabId = (typeof PROFILE_TABS)[number]['id'];

function isProfileTab(value: string | null): value is ProfileTabId {
  return PROFILE_TABS.some((tab) => tab.id === value);
}

export function StudentProfilePage() {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const id = Number(studentId);
  const { data: student, isLoading, isError, error, refetch } = useStudent(id);
  const { data: classesData } = useClasses();
  const classes = classesData?.results || [];

  const { data: sectionsData } = useSections();
  const sections = sectionsData?.results || [];
  const updateMutation = useUpdateStudent(id);
  const deleteMutation = useDeleteStudent();

  const activeTab = searchParams.get('tab');
  const currentTab = isProfileTab(activeTab) ? activeTab : 'overview';

  const handleEditSubmit = (values: StudentAdmissionFormValues) => {
    updateMutation.mutate(toStudentPayload(values), {
      onSuccess: () => setEditOpen(false),
    });
  };

  const handleDeleteSubmit = () => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        setDeleteConfirmOpen(false);
        navigate(ROUTES.students.root);
      },
    });
  };

  if (isLoading) {
    return <LoadingState message="Loading student profile..." />;
  }

  if (isError || !student) {
    return (
      <ErrorState
        title="Student not found"
        message={error instanceof Error ? error.message : 'Could not load student profile'}
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to={ROUTES.students.root}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Students
        </Link>

        <Button
          variant="destructive"
          size="sm"
          onClick={() => setDeleteConfirmOpen(true)}
          className="gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Delete Student
        </Button>
      </div>

      <Tabs
        value={currentTab}
        onValueChange={(value) => {
          setSearchParams(value === 'overview' ? {} : { tab: value }, { replace: true });
        }}
      >
        <TabsList className="w-full justify-start overflow-x-auto">
          {PROFILE_TABS.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} disabled={!tab.enabled}>
              {tab.label}
              {!tab.enabled && <span className="sr-only"> (coming soon)</span>}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <StudentOverviewTab student={student} onEditClick={() => setEditOpen(true)} />
        </TabsContent>

        <TabsContent value="academic" className="mt-6">
          <StudentAcademicTab student={student} />
        </TabsContent>

        <TabsContent value="fees" className="mt-6">
          <StudentFeesTab student={student} />
        </TabsContent>

        <TabsContent value="guardians" className="mt-6">
          <StudentGuardiansTab student={student} />
        </TabsContent>
      </Tabs>

      <StudentAdmissionDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        classes={classes}
        sections={sections}
        student={student}
        onSubmit={handleEditSubmit}
        isLoading={updateMutation.isPending}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete student"
        description={`Are you sure you want to delete ${student.full_name}? This action cannot be undone.`}
        confirmLabel="Delete"
        destructive
        isLoading={deleteMutation.isPending}
        onConfirm={handleDeleteSubmit}
      />
    </div>
  );
}
