import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { StaffTable } from '@features/staff/components/StaffTable';
import { StaffFormDialog } from '@features/staff/components/StaffFormDialog';
import type { StaffFormValues } from '@features/staff/schemas/staff-form.schema';
import { toStaffPayload } from '@features/staff/utils/staff-payload';
import {
  useCreateStaff,
  useStaff,
  useStaffDepartments,
  useStaffDesignations,
  useSuggestedEmployeeId,
} from '@hooks/useStaff';
import { matchesSearch } from '@utils/search';
import { formatDepartmentDesignation } from '@utils/staff';
import { ModuleListPack } from '@workflow-packs';

export function StaffPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get('page')) || 1;

  const { data: staffData, isLoading, isError, error, refetch } = useStaff(page);
  const staff = staffData?.results;
  const count = staffData?.count || 0;
  const { data: departments = [] } = useStaffDepartments();
  const { data: designations = [] } = useStaffDesignations();
  const createMutation = useCreateStaff();

  const [formOpen, setFormOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { data: suggestedEmployeeId } = useSuggestedEmployeeId(formOpen);

  const filteredStaff = useMemo(() => {
    if (!staff) return [];
    return staff.filter((member) =>
      matchesSearch(
        search,
        member.full_name,
        member.employee_id,
        member.email,
        member.contact_no,
        formatDepartmentDesignation(member.department_name, member.designation_name),
      ),
    );
  }, [staff, search]);

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

  return (
    <ModuleListPack
      title="Staff"
      description="Browse staff members and open profiles for details."
      actions={addStaffAction}
      isLoading={isLoading}
      loadingMessage="Loading staff..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && staff?.length === 0}
      emptyTitle="No staff found"
      emptyDescription="Add your first staff member to start building employee records."
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
        staff={filteredStaff}
        searchValue={search}
        onSearchChange={setSearch}
        pagination={{
          page,
          pageSize: 10,
          totalCount: count,
          onPageChange: (p) => setSearchParams({ page: p.toString() }),
        }}
      />
    </ModuleListPack>
  );
}
