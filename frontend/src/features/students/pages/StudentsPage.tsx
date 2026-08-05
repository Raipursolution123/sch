import { useState } from 'react';
import { Plus } from 'lucide-react';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { SearchBar } from '@components/layout/FilterBar';
import { PackFilterPanel, PackStatItem, PackStatStrip } from '@components/pack';
import { StudentsTable } from '@features/students/components/StudentsTable';
import { StudentAdmissionDialog } from '@features/students/components/StudentAdmissionDialog';
import type { StudentAdmissionFormValues } from '@features/students/schemas/student-admission.schema';
import { toStudentPayload } from '@features/students/utils/student-payload';
import { useCreateStudent, useStudentsList, useSuggestedAdmissionNo } from '@hooks/useStudents';
import { useDebouncedValue } from '@hooks/useDebouncedValue';
import { useClasses } from '@hooks/useClasses';
import { useClassSections } from '@hooks/useClassSections';
import { useActiveSession } from '@hooks/useSessions';
import { ModuleListPack } from '@workflow-packs';

const PAGE_SIZE = 20;

export function StudentsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);
  const [admissionOpen, setAdmissionOpen] = useState(false);

  const { data: activeSession } = useActiveSession();
  const { data, isLoading, isError, error, refetch, isFetching } = useStudentsList({
    page,
    pageSize: PAGE_SIZE,
    search: debouncedSearch,
    status: 'active',
  });
  const { data: classesData } = useClasses();
  const classes = classesData?.results || [];
  const { data: classSectionsData } = useClassSections();
  const createMutation = useCreateStudent();
  const { data: suggestedAdmissionNo } = useSuggestedAdmissionNo(admissionOpen);

  const students = data?.results ?? [];
  const totalCount = data?.count ?? 0;
  const canAdmit = (classSectionsData?.results ?? []).some((m) => m.is_active === 'yes');

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

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
      title={canAdmit ? undefined : 'Add active class sections first'}
    >
      <Plus className="h-4 w-4" aria-hidden="true" />
      Add Student
    </PermissionButton>
  );

  const isEmptyList = !isLoading && !isError && totalCount === 0 && !debouncedSearch.trim();

  return (
    <ModuleListPack
      title="Students"
      description="Enrollment roster for the active session."
      actions={addStudentAction}
      stats={
        !isLoading && !isError && totalCount > 0 ? (
          <PackStatStrip>
            <PackStatItem label="enrolled" value={totalCount.toLocaleString()} />
            {activeSession?.session ? (
              <>
                <span aria-hidden="true">·</span>
                <span>
                  Session{' '}
                  <span className="font-mono tabular-nums text-foreground">
                    {activeSession.session}
                  </span>
                </span>
              </>
            ) : null}
          </PackStatStrip>
        ) : undefined
      }
      filters={
        <PackFilterPanel>
          <SearchBar
            value={search}
            onChange={handleSearchChange}
            placeholder="Search name, admission no., mobile…"
            id="students-search"
          />
        </PackFilterPanel>
      }
      prerequisiteHint={
        !canAdmit && !isLoading ? (
          <p className="text-sm text-muted-foreground">
            Assign active class sections under Academics → Class Sections before admitting students.
          </p>
        ) : undefined
      }
      isLoading={isLoading}
      loadingMessage="Loading students..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={isEmptyList}
      emptyTitle="No students enrolled yet"
      emptyDescription="Admit your first student to build class rolls, attendance, and fee records."
      emptyAction={canAdmit ? addStudentAction : undefined}
      footer={
        <StudentAdmissionDialog
          open={admissionOpen}
          onOpenChange={setAdmissionOpen}
          classes={classes}
          suggestedAdmissionNo={suggestedAdmissionNo}
          onSubmit={handleSubmit}
          isLoading={createMutation.isPending}
        />
      }
    >
      <StudentsTable
        students={students}
        isLoading={isFetching && !isLoading}
        pagination={{
          page,
          pageSize: PAGE_SIZE,
          totalCount,
          onPageChange: setPage,
        }}
      />
    </ModuleListPack>
  );
}
