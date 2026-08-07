import { useState } from 'react';
import { DisabledStaffTable } from '@features/staff/components/DisabledStaffTable';
import { useStaffList } from '@hooks/useStaff';
import { useDebouncedValue } from '@hooks/useDebouncedValue';
import { ModuleListPack } from '@workflow-packs';

const PAGE_SIZE = 20;

export function DisabledStaffPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);

  const { data, isLoading, isError, error, refetch, isFetching } = useStaffList({
    page,
    pageSize: PAGE_SIZE,
    search: debouncedSearch,
    status: 'disabled',
  });

  const staff = data?.results ?? [];
  const totalCount = data?.count ?? 0;
  const isEmptyList = !isLoading && !isError && totalCount === 0 && !debouncedSearch.trim();

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <ModuleListPack
      title="Disabled Staff"
      description="Inactive employees removed from the active roster."
      isLoading={isLoading}
      loadingMessage="Loading disabled staff..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={isEmptyList}
      emptyTitle="No disabled staff"
      emptyDescription="When you disable a staff member, they appear here and can be re-enabled later."
    >
      <DisabledStaffTable
        staff={staff}
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
