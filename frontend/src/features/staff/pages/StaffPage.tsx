import { useState } from 'react';
import { Plus } from 'lucide-react';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { StaffTable } from '@features/staff/components/StaffTable';
import { StaffFormDialog } from '@features/staff/components/StaffFormDialog';
import type { StaffFormValues } from '@features/staff/schemas/staff-form.schema';
import { toStaffPayload } from '@features/staff/utils/staff-payload';
import {
  useCreateStaff,
  useStaffDepartments,
  useStaffDesignations,
  useStaffList,
  useSuggestedEmployeeId,
} from '@hooks/useStaff';
import { useDebouncedValue } from '@hooks/useDebouncedValue';
import { ModuleListPack } from '@workflow-packs';

const PAGE_SIZE = 20;

export function StaffPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);
  const [formOpen, setFormOpen] = useState(false);

  const { data, isLoading, isError, error, refetch, isFetching } = useStaffList({
    page,
    pageSize: PAGE_SIZE,
    search: debouncedSearch,
  });
  const staff = data?.results ?? [];
  const totalCount = data?.count ?? 0;

  const { data: departments = [] } = useStaffDepartments();
  const { data: designations = [] } = useStaffDesignations();
  const createMutation = useCreateStaff();
  const { data: suggestedEmployeeId } = useSuggestedEmployeeId(formOpen);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleSubmit = (values: StaffFormValues) => {
    createMutation.mutate(toStaffPayload(values), {
      onSuccess: () => setFormOpen(false),
    });
  };

  const addStaffAction = (
    <PermissionButton permission="staff.create" onClick={() => setFormOpen(true)} className="gap-1">
      <Plus className="h-4 w-4" aria-hidden="true" />
      Add Staff
    </PermissionButton>
  );

  const isEmptyList = !isLoading && !isError && totalCount === 0 && !debouncedSearch.trim();

  return (
    <ModuleListPack
      title="Staff"
      description="Employee roster — open a profile for employment, payroll, leave, and documents."
      actions={addStaffAction}
      isLoading={isLoading}
      loadingMessage="Loading staff..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={isEmptyList}
      emptyTitle="No staff on the roster yet"
      emptyDescription="Add your first employee to build attendance, payroll, and leave records."
      emptyAction={addStaffAction}
      footer={
        <StaffFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          departments={departments}
          designations={designations}
          suggestedEmployeeId={suggestedEmployeeId}
          onSubmit={handleSubmit}
          isLoading={createMutation.isPending}
        />
      }
    >
      <StaffTable
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
