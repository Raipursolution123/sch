import { StaffLeaveAllotmentsTable } from '@features/staff/leave-allotments/components/StaffLeaveAllotmentsTable';
import { useStaffLeaveAllotmentRoster } from '@hooks/useStaffLeaveAllotments';

interface StaffLeaveTabProps {
  staffId: number;
}

export function StaffLeaveTab({ staffId }: StaffLeaveTabProps) {
  const { data: roster, isLoading, isError } = useStaffLeaveAllotmentRoster(staffId, staffId > 0);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading leave allotments...</p>;
  }
  if (isError) {
    return <p className="text-sm text-destructive">Failed to load leave allotments.</p>;
  }
  if (!roster || roster.allotments.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No leave types configured. Add leave types, then allot days from Leave Allotments.
      </p>
    );
  }

  const values = Object.fromEntries(
    roster.allotments.map((row) => [row.leave_type_id, String(row.alloted_leave ?? '0')]),
  );

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Current leave balance for this staff member. Edit allotments from the Leave Allotments page.
      </p>
      <StaffLeaveAllotmentsTable rows={roster.allotments} values={values} readOnly />
    </div>
  );
}
