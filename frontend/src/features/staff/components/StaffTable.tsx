import { useNavigate } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { Button } from '@components/ui/button';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { StatusBadge } from '@components/feedback/StatusBadge';
import type { StaffListItem } from '@app-types/staff/staff';
import { ROUTES } from '@constants/index';
import { formatDepartmentDesignation } from '@utils/staff';
import { formatGender } from '@utils/student';
import { formatDate } from '@utils/format';

interface StaffTableProps {
  staff: StaffListItem[];
}

const columns: DataTableColumn<StaffListItem>[] = [
  {
    id: 'employee_id',
    header: 'Employee ID',
    cell: (row) => (
      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{row.employee_id}</code>
    ),
  },
  {
    id: 'full_name',
    header: 'Name',
    cellClassName: 'font-medium',
    cell: (row) => row.full_name,
  },
  {
    id: 'role',
    header: 'Department',
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

export function StaffTable({ staff }: StaffTableProps) {
  const navigate = useNavigate();

  return (
    <DataTable
      data={staff}
      columns={columns}
      getRowKey={(member) => member.id}
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
