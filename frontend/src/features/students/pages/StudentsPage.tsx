import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@components/ui/button';
import { PageHeader } from '@components/layout/PageHeader';
import { ListSearch } from '@components/forms/ListSearch';
import { EmptyState } from '@components/feedback/EmptyState';
import { LoadingState } from '@components/feedback/LoadingState';
import { ErrorState } from '@components/feedback/ErrorState';
import { StudentsTable } from '@features/students/components/StudentsTable';
import { StudentAdmissionDialog } from '@features/students/components/StudentAdmissionDialog';
import type { StudentAdmissionFormValues } from '@features/students/schemas/student-admission.schema';
import { toStudentPayload } from '@features/students/utils/student-payload';
import { useCreateStudent, useStudents, useSuggestedAdmissionNo } from '@hooks/useStudents';
import { useClasses } from '@hooks/useClasses';
import { useSections } from '@hooks/useSections';
import { matchesSearch } from '@utils/search';
import { formatClassSection } from '@utils/student';

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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Students"
        description="Browse enrolled students and open profiles for details."
        actions={
          <Button
            onClick={() => setAdmissionOpen(true)}
            className="gap-1"
            disabled={!canAdmit}
            title={canAdmit ? undefined : 'Add active classes and sections first'}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Student
          </Button>
        }
      />

      {!canAdmit && !isLoading && (
        <p className="text-sm text-muted-foreground">
          Configure active classes and sections under Academics before admitting students.
        </p>
      )}

      {isLoading && <LoadingState message="Loading students..." />}

      {isError && (
        <ErrorState
          message={error instanceof Error ? error.message : 'Could not load students'}
          onRetry={() => void refetch()}
        />
      )}

      {!isLoading && !isError && students?.length === 0 && (
        <EmptyState
          title="No students found"
          description="Admit your first student to start building enrollment records."
          action={
            canAdmit ? (
              <Button onClick={() => setAdmissionOpen(true)} className="gap-1">
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add Student
              </Button>
            ) : undefined
          }
        />
      )}

      {!isLoading && !isError && students && students.length > 0 && (
        <>
          <ListSearch
            value={search}
            onChange={setSearch}
            placeholder="Search by name, admission no., class..."
          />
          {filteredStudents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No students match your search.</p>
          ) : (
            <StudentsTable students={filteredStudents} />
          )}
        </>
      )}

      <StudentAdmissionDialog
        open={admissionOpen}
        onOpenChange={setAdmissionOpen}
        classes={classes}
        sections={sections}
        suggestedAdmissionNo={suggestedAdmissionNo}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending}
      />
    </div>
  );
}
