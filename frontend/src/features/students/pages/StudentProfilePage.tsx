import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { PermissionButton } from '@components/rbac/PermissionButton';
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
import { ModuleProfilePack } from '@workflow-packs';

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

  return (
    <ModuleProfilePack
      backTo={ROUTES.students.root}
      backLabel="Back to Students"
      isLoading={isLoading}
      loadingMessage="Loading student profile..."
      isError={isError || !student}
      errorTitle="Student not found"
      error={error}
      onRetry={() => void refetch()}
      headerActions={
        student ? (
          <PermissionButton
            permission="students.delete"
            variant="destructive"
            size="sm"
            onClick={() => setDeleteConfirmOpen(true)}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete Student
          </PermissionButton>
        ) : undefined
      }
      tabs={
        student
          ? PROFILE_TABS.map((tab) => ({
              id: tab.id,
              label: tab.label,
              disabled: !tab.enabled,
              content:
                tab.id === 'overview' ? (
                  <StudentOverviewTab student={student} onEditClick={() => setEditOpen(true)} />
                ) : tab.id === 'academic' ? (
                  <StudentAcademicTab student={student} />
                ) : tab.id === 'fees' ? (
                  <StudentFeesTab student={student} />
                ) : (
                  <StudentGuardiansTab student={student} />
                ),
            }))
          : []
      }
      activeTab={currentTab}
      onTabChange={(value) => {
        setSearchParams(value === 'overview' ? {} : { tab: value }, { replace: true });
      }}
      footer={
        student ? (
          <>
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
          </>
        ) : undefined
      }
    />
  );
}
