import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { StudentsTable } from '@features/students/components/StudentsTable';
import { StudentAdmissionDialog } from '@features/students/components/StudentAdmissionDialog';
import type { StudentAdmissionFormValues } from '@features/students/schemas/student-admission.schema';
import { toStudentPayload } from '@features/students/utils/student-payload';
import { useCreateStudent, useStudents, useSuggestedAdmissionNo } from '@hooks/useStudents';
import { useClasses } from '@hooks/useClasses';
import { useSections } from '@hooks/useSections';
import { matchesSearch } from '@utils/search';
import { formatClassSection } from '@utils/student';
import { ModuleListPack } from '@workflow-packs';

export function StudentsPage() {
  const { data: students, isLoading, isError, error, refetch } = useStudents();
  const { data: classesData } = useClasses();
  const classes = classesData?.results || [];

  const { data: sectionsData } = useSections();
  const sections = sectionsData?.results || [];
  const createMutation = useCreateStudent();

  const [admissionOpen, setAdmissionOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { data: suggestedAdmissionNo } = useSuggestedAdmissionNo(admissionOpen);

  const filteredStudents = useMemo(() => {
    if (!students) return [];
    return students.filter((student) =>
      matchesSearch(
        search,
        student.full_name,
        student.admission_no,
        student.mobileno,
        student.email,
        formatClassSection(student.class_name, student.section_name),
        student.roll_no,
      ),
    );
  }, [students, search]);

  const canAdmit =
    classes.some((c) => c.is_active === 'yes') && sections.some((s) => s.is_active === 'yes');

  const handleSubmit = (values: StudentAdmissionFormValues) => {
    createMutation.mutate(toStudentPayload(values), {
      onSuccess: () => setAdmissionOpen(false),
    });
  };

  const addStudentAction = (
    <PermissionButton
      permission="students.create"
      onClick={() => setAdmissionOpen(true)}
      className="gap-1"
      disabled={!canAdmit}
      title={canAdmit ? undefined : 'Add active classes and sections first'}
    >
      <Plus className="h-4 w-4" aria-hidden="true" />
      Add Student
    </PermissionButton>
  );

  return (
    <ModuleListPack
      title="Students"
      actions={addStudentAction}
      prerequisiteHint={
        !canAdmit && !isLoading ? (
          <p className="text-sm text-muted-foreground">
            Configure active classes and sections under Academics before admitting students.
          </p>
        ) : undefined
      }
      isLoading={isLoading}
      loadingMessage="Loading students..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && students?.length === 0}
      emptyTitle="No students found"
      emptyDescription="Admit your first student to start building enrollment records."
      emptyAction={canAdmit ? addStudentAction : undefined}
      footer={
        <StudentAdmissionDialog
          open={admissionOpen}
          onOpenChange={setAdmissionOpen}
          classes={classes}
          sections={sections}
          suggestedAdmissionNo={suggestedAdmissionNo}
          onSubmit={handleSubmit}
          isLoading={createMutation.isPending}
        />
      }
    >
      <StudentsTable
        students={filteredStudents}
        searchValue={search}
        onSearchChange={setSearch}
      />
    </ModuleListPack>
  );
}
