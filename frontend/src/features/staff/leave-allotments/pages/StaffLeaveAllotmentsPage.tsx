import { useEffect, useMemo, useState } from 'react';
import { Save } from 'lucide-react';
import { FormField } from '@components/forms/FormField';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { Select } from '@components/ui/select';
import { StaffLeaveAllotmentsTable } from '@features/staff/leave-allotments/components/StaffLeaveAllotmentsTable';
import {
  useSaveStaffLeaveAllotments,
  useStaffLeaveAllotmentRoster,
} from '@hooks/useStaffLeaveAllotments';
import { useStaff } from '@hooks/useStaff';
import { ModuleMarkGridPack } from '@workflow-packs';

export function StaffLeaveAllotmentsPage() {
  const { data: staffPage } = useStaff(1);
  const staff = staffPage?.results ?? [];
  const [staffId, setStaffId] = useState(0);
  const [values, setValues] = useState<Record<number, string>>({});

  const activeStaff = useMemo(() => staff.filter((s) => s.is_active === 'yes'), [staff]);

  const filtersReady = staffId > 0;
  const {
    data: roster,
    isLoading,
    isError,
    error,
    refetch,
  } = useStaffLeaveAllotmentRoster(staffId, filtersReady);
  const saveMutation = useSaveStaffLeaveAllotments();

  useEffect(() => {
    if (activeStaff.length > 0 && staffId === 0) {
      setStaffId(activeStaff[0].id);
    }
  }, [activeStaff, staffId]);

  useEffect(() => {
    if (!roster) return;
    const next: Record<number, string> = {};
    for (const row of roster.allotments) {
      next[row.leave_type_id] = String(row.alloted_leave ?? '0');
    }
    setValues(next);
  }, [roster]);

  const handleSave = () => {
    if (!roster) return;
    saveMutation.mutate({
      staff_id: staffId,
      entries: roster.allotments.map((row) => ({
        leave_type_id: row.leave_type_id,
        alloted_leave: values[row.leave_type_id] ?? row.alloted_leave ?? '0',
      })),
    });
  };

  return (
    <ModuleMarkGridPack
      title="Leave Allotments"
      description="Assign annual leave days by type for each staff member. Used days come from approved and pending requests."
      prerequisiteHint={
        activeStaff.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Add active staff records before allotting leave.
          </p>
        ) : undefined
      }
      filters={
        <FormField label="Staff" htmlFor="leave_allot_staff">
          <Select
            id="leave_allot_staff"
            placeholder="Select staff"
            options={activeStaff.map((s) => ({
              value: String(s.id),
              label: `${s.full_name} (${s.employee_id})`,
            }))}
            value={staffId ? String(staffId) : ''}
            onChange={(e) => setStaffId(Number(e.target.value))}
            disabled={activeStaff.length === 0}
          />
        </FormField>
      }
      actions={
        <PermissionButton
          permission="staff.edit"
          disabled={!filtersReady || !roster || saveMutation.isPending}
          onClick={handleSave}
          className="gap-1"
        >
          <Save className="h-4 w-4" aria-hidden="true" />
          Save allotments
        </PermissionButton>
      }
      isLoading={filtersReady && isLoading}
      loadingMessage="Loading leave allotments..."
      isError={filtersReady && isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={filtersReady && !isLoading && !isError && (roster?.allotments.length ?? 0) === 0}
      emptyTitle="No leave types"
      emptyDescription="Create leave types first, then allot days to staff."
    >
      {filtersReady && roster && roster.allotments.length > 0 ? (
        <StaffLeaveAllotmentsTable
          rows={roster.allotments}
          values={values}
          onChange={(leaveTypeId, value) =>
            setValues((prev) => ({ ...prev, [leaveTypeId]: value }))
          }
        />
      ) : null}
    </ModuleMarkGridPack>
  );
}
