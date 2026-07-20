import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import type { StaffListItem } from '@app-types/staff/staff';
import { formatDepartmentDesignation } from '@utils/staff';

interface StaffReportTableProps {
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
    id: 'department',
    header: 'Department / Designation',
    cell: (row) => formatDepartmentDesignation(row.department_name, row.designation_name),
  },
  {
    id: 'contact',
    header: 'Contact',
    cellClassName: 'text-muted-foreground',
    cell: (row) => row.contact_no || row.email || '—',
  },
  {
    id: 'joined',
    header: 'Joined',
    cellClassName: 'text-muted-foreground',
    cell: (row) => row.date_of_joining ?? '—',
  },
];

export function StaffReportTable({ staff }: StaffReportTableProps) {
  return (
    <DataTable
      columns={columns}
      data={staff}
      getRowKey={(row) => row.id}
      emptyMessage="No staff match the filters."
    />
  );
}
