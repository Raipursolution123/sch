import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, UserCheck } from 'lucide-react';
import { Button } from '@components/ui/button';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import type { DataTablePaginationConfig } from '@components/data/data-table-types';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { PermissionButton } from '@components/rbac/PermissionButton';
import type { StaffListItem } from '@app-types/staff/staff';
import { ROUTES } from '@constants/index';
import { formatDepartmentDesignation } from '@utils/staff';
import { formatDate } from '@utils/format';
import { useEnableStaff } from '@hooks/useStaff';

interface DisabledStaffTableProps {
  staff: StaffListItem[];
  searchValue: string;
  onSearchChange: (value: string) => void;
  pagination?: DataTablePaginationConfig;
  isLoading?: boolean;
}

export function DisabledStaffTable({
  staff,
  searchValue,
  onSearchChange,
  pagination,
  isLoading,
}: DisabledStaffTableProps) {
  const navigate = useNavigate();
  const [staffToEnable, setStaffToEnable] = useState<StaffListItem | null>(null);
  const enableMutation = useEnableStaff();

  const columns = useMemo<DataTableColumn<StaffListItem>[]>(
    () => [
      {
        id: 'employee_id',
        header: 'Employee ID',
        enableSorting: true,
        sortValue: (row) => row.employee_id,
        cell: (row) => (
          <code className="rounded-sm bg-muted px-1.5 py-0.5 font-mono text-xs">
            {row.employee_id}
          </code>
        ),
      },
      {
        id: 'full_name',
        header: 'Name',
        enableSorting: true,
        sortValue: (row) => row.full_name,
        cellClassName: 'font-medium',
        cell: (row) => row.full_name,
      },
      {
        id: 'role',
        header: 'Department',
        cell: (row) => formatDepartmentDesignation(row.department_name, row.designation_name),
      },
      {
        id: 'disabled_at',
        header: 'Disabled on',
        cellClassName: 'text-muted-foreground',
        cell: (row) => (row.disable_at ? formatDate(row.disable_at) : '—'),
      },
    ],
    [],
  );

  return (
    <>
      <DataTable
        data={staff}
        columns={columns}
        getRowKey={(row) => row.id}
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        pagination={pagination}
        isLoading={isLoading}
        actions={(row) => (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(ROUTES.staff.detail(row.id))}
              aria-label={`View ${row.full_name}`}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <PermissionButton
              permission="staff.edit"
              variant="ghost"
              size="sm"
              title="Re-enable staff"
              onClick={() => setStaffToEnable(row)}
            >
              <UserCheck className="h-4 w-4 text-emerald-600" />
            </PermissionButton>
          </>
        )}
      />

      <ConfirmDialog
        open={staffToEnable !== null}
        onOpenChange={(open) => {
          if (!open) setStaffToEnable(null);
        }}
        title="Re-enable staff member?"
        description={
          staffToEnable
            ? `${staffToEnable.full_name} (${staffToEnable.employee_id}) will be restored to the active roster.`
            : ''
        }
        confirmLabel="Re-enable"
        isLoading={enableMutation.isPending}
        onConfirm={() => {
          if (staffToEnable) {
            enableMutation.mutate(staffToEnable.id, {
              onSuccess: () => setStaffToEnable(null),
            });
          }
        }}
      />
    </>
  );
}
