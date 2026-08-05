import { useState } from 'react';
import { DisabledStudentsTable } from '@features/students/components/DisabledStudentsTable';
import { useStudentsList } from '@hooks/useStudents';
import { useDebouncedValue } from '@hooks/useDebouncedValue';
import { ModuleListPack } from '@workflow-packs';

const PAGE_SIZE = 20;

export function DisabledStudentsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);

  const { data, isLoading, isError, error, refetch, isFetching } = useStudentsList({
    page,
    pageSize: PAGE_SIZE,
    search: debouncedSearch,
    status: 'disabled',
  });

  const students = data?.results ?? [];
  const totalCount = data?.count ?? 0;
  const isEmptyList = !isLoading && !isError && totalCount === 0 && !debouncedSearch.trim();

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <ModuleListPack
      title="Disabled Students"
      description="Students removed from active enrollment, with reason and date."
      isLoading={isLoading}
      loadingMessage="Loading disabled students..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={isEmptyList}
      emptyTitle="No disabled students"
      emptyDescription="When you disable a student, they appear here with the reason — ready to re-enable later."
    >
      <DisabledStudentsTable
        students={students}
        searchValue={search}
        onSearchChange={handleSearchChange}
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
