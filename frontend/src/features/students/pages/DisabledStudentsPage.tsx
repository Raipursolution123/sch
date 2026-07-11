import { useMemo, useState } from 'react';
import { DisabledStudentsTable } from '@features/students/components/DisabledStudentsTable';
import { useDisabledStudents } from '@hooks/useStudents';
import { matchesSearch } from '@utils/search';
import { formatClassSection } from '@utils/student';
import { ModuleListPack } from '@workflow-packs';

export function DisabledStudentsPage() {
  const { data: students, isLoading, isError, error, refetch } = useDisabledStudents();
  const [search, setSearch] = useState('');

  const filteredStudents = useMemo(() => {
    if (!students) return [];
    return students.filter((student) =>
      matchesSearch(
        search,
        student.full_name,
        student.admission_no,
        student.disable_reason_name,
        student.disable_note,
        formatClassSection(student.class_name, student.section_name),
      ),
    );
  }, [students, search]);

  return (
    <ModuleListPack
      title="Disabled Students"
      isLoading={isLoading}
      loadingMessage="Loading disabled students..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && students?.length === 0}
      emptyTitle="No disabled students"
      emptyDescription="Students you disable will appear here with their reason and disable date."
    >
      <DisabledStudentsTable
        students={filteredStudents}
        searchValue={search}
        onSearchChange={setSearch}
      />
    </ModuleListPack>
  );
}
