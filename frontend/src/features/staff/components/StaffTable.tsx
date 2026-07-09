import { useNavigate } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { Button } from '@components/ui/button';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { StatusBadge } from '@components/feedback/StatusBadge';
import type { StaffListItem } from '@app-types/staff/staff';
import type { DataTablePaginationConfig } from '@components/data/data-table-types';
import { ROUTES } from '@constants/index';
import { formatDepartmentDesignation } from '@utils/staff';
import { formatGender } from '@utils/student';
import { formatDate } from '@utils/format';

interface StaffTableProps {
  staff: StaffListItem[];
  searchValue: string;
  onSearchChange: (value: string) => void;
  pagination: DataTablePaginationConfig;
}

const columns: DataTableColumn<StaffListItem>[] = [
  {
    id: 'employee_id',
    header: 'Employee ID',
    enableSorting: true,
    sortValue: (row) => row.employee_id,
    cell: (row) => (
      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{row.employee_id}</code>
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
    enableSorting: true,
    sortValue: (row) => formatDepartmentDesignation(row.department_name, row.designation_name),
    cell: (row) => formatDepartmentDesignation(row.department_name, row.designation_name),
  },
  {
    id: 'contact_no',
    header: 'Contact',
    cellClassName: 'text-muted-foreground',
    cell: (row) => row.contact_no,
  },
  {
    id: 'date_of_joining',
    header: 'Joined',
    enableSorting: true,
    sortValue: (row) => row.date_of_joining,
    cellClassName: 'text-muted-foreground',
    cell: (row) => formatDate(row.date_of_joining),
  },
  {
    id: 'gender',
    header: 'Gender',
    cellClassName: 'text-muted-foreground',
    cell: (row) => formatGender(row.gender),
  },
  {
    id: 'status',
    header: 'Status',
    cell: (row) => <StatusBadge isActive={row.is_active} />,
  },
];

export function StaffTable({ staff, searchValue, onSearchChange, pagination }: StaffTableProps) {
  const navigate = useNavigate();

  return (
    <DataTable
      data={staff}
      columns={columns}
      getRowKey={(member) => member.id}
      enableSorting
      showDensityToggle
      searchValue={searchValue}
      onSearchChange={onSearchChange}
      searchPlaceholder="Search by name, employee ID, department…"
      pagination={pagination}
      emptyMessage="No staff match your search."
      actions={(member) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(ROUTES.staff.detail(member.id))}
          aria-label={`View ${member.full_name}`}
        >
          <Eye className="h-4 w-4" />
        </Button>
      )}
      actionsHeader="View"
    />
  );
}
