import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@components/ui/button';
import { PageHeader } from '@components/layout/PageHeader';
import { ListSearch } from '@components/forms/ListSearch';import { EmptyState } from '@components/feedback/EmptyState';
import { LoadingState } from '@components/feedback/LoadingState';
import { ErrorState } from '@components/feedback/ErrorState';
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

export function StaffPage() {
  const { data: staff, isLoading, isError, error, refetch } = useStaff();
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

  const canAdd = departments.length > 0 && designations.length > 0;

  const handleSubmit = (values: StaffFormValues) => {
    createMutation.mutate(toStaffPayload(values), {
      onSuccess: () => setFormOpen(false),
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff"
        description="Browse staff members and open profiles for details."
        actions={
          <Button onClick={() => setFormOpen(true)} className="gap-1" disabled={!canAdd}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Staff
          </Button>
        }
      />

      {isLoading && <LoadingState message="Loading staff..." />}

      {isError && (
        <ErrorState
          message={error instanceof Error ? error.message : 'Could not load staff'}
          onRetry={() => void refetch()}
        />
      )}

      {!isLoading && !isError && staff?.length === 0 && (
        <EmptyState
          title="No staff found"
          description="Add your first staff member to start building employee records."
          action={
            canAdd ? (
              <Button onClick={() => setFormOpen(true)} className="gap-1">
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add Staff
              </Button>
            ) : undefined
          }
        />
      )}

      {!isLoading && !isError && staff && staff.length > 0 && (
        <>
          <ListSearch
            value={search}
            onChange={setSearch}
            placeholder="Search by name, employee ID, department..."
          />
          {filteredStaff.length === 0 ? (
            <p className="text-sm text-muted-foreground">No staff match your search.</p>
          ) : (
            <StaffTable staff={filteredStaff} />
          )}
        </>
      )}

      <StaffFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        departments={departments}
        designations={designations}
        suggestedEmployeeId={suggestedEmployeeId}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending}
      />
    </div>
  );
}
