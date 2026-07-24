import { useState } from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { Badge } from '@components/ui/badge';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { useApproveLeaves, useDeleteApproveLeave } from '@hooks/useApproveLeave';
import type { ApproveLeave } from '@services/api/approve-leave.service';

interface ApproveLeaveTableProps {
  onEdit: (leave: ApproveLeave) => void;
}

function LeaveStatusCell({ leave }: { leave: ApproveLeave }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {leave.status === 0 && <Badge variant="secondary">Pending</Badge>}
      {leave.status === 1 && (
        <Badge variant="default" className="bg-green-600">
          Approved
        </Badge>
      )}
      {leave.status === 2 && <Badge variant="destructive">Rejected</Badge>}
      {leave.is_attendance ? (
        <Badge
          variant="outline"
          className={`border-orange-200 ${
            leave.attendance_type_label === 'Absent'
              ? 'bg-red-50 text-red-700'
              : leave.attendance_type_label === 'Late'
                ? 'bg-orange-50 text-orange-700'
                : 'bg-blue-50 text-blue-700'
          }`}
        >
          Teacher Marked: {leave.attendance_type_label}
        </Badge>
      ) : null}
    </div>
  );
}

const columns: DataTableColumn<ApproveLeave>[] = [
  {
    id: 'student',
    header: 'Student',
    cellClassName: 'font-medium',
    cell: (leave) => leave.student_name,
  },
  {
    id: 'class',
    header: 'Class & Section',
    cell: (leave) => `${leave.class_name} (${leave.section_name})`,
  },
  {
    id: 'dates',
    header: 'Leave Dates',
    cell: (leave) => `${leave.from_date} to ${leave.to_date}`,
  },
  {
    id: 'reason',
    header: 'Reason',
    wrap: true,
    maxWidth: '16rem',
    cell: (leave) => leave.reason,
  },
  {
    id: 'status',
    header: 'Status',
    cell: (leave) => <LeaveStatusCell leave={leave} />,
  },
];

export function ApproveLeaveTable({ onEdit }: ApproveLeaveTableProps) {
  const [page, setPage] = useState(1);
  const { data } = useApproveLeaves(page);
  const deleteMutation = useDeleteApproveLeave();
  const [deleteTarget, setDeleteTarget] = useState<ApproveLeave | null>(null);

  const leaves: ApproveLeave[] = data?.results ?? [];

  return (
    <>
      <DataTable
        data={leaves}
        columns={columns}
        getRowKey={(leave) => leave.id}
        showDensityToggle
        pagination={{
          page,
          pageSize: 20,
          totalCount: data?.count ?? leaves.length,
          onPageChange: setPage,
        }}
        actions={(leave) => (
          <>
            <PermissionButton
              permission="attendance.report"
              variant="ghost"
              size="sm"
              onClick={() => onEdit(leave)}
              aria-label="Edit leave"
            >
              <Edit2 className="h-4 w-4" />
            </PermissionButton>
            <PermissionButton
              permission="attendance.report"
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => setDeleteTarget(leave)}
              aria-label="Delete leave"
            >
              <Trash2 className="h-4 w-4" />
            </PermissionButton>
          </>
        )}
      />
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete leave request"
        description={
          deleteTarget
            ? `Delete leave request for "${deleteTarget.student_name}"? This cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        destructive
        isLoading={deleteMutation.isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteMutation.mutate(deleteTarget.id, {
            onSuccess: () => setDeleteTarget(null),
          });
        }}
      />
    </>
  );
}
