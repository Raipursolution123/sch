import { UserCheck } from 'lucide-react';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { Badge } from '@components/ui/badge';
import type { OnlineAdmission } from '@app-types/admissions/online-admission';
import { formatDate } from '@utils/format';

interface OnlineAdmissionsTableProps {
  admissions: OnlineAdmission[];
  onConvert: (admission: OnlineAdmission) => void;
  convertingId?: number | null;
}

function fullName(row: OnlineAdmission) {
  return [row.firstname, row.lastname].filter(Boolean).join(' ').trim() || '—';
}

const columns: DataTableColumn<OnlineAdmission>[] = [
  {
    id: 'reference_no',
    header: 'Reference',
    cellClassName: 'font-medium',
    cell: (row) => row.reference_no,
  },
  {
    id: 'name',
    header: 'Applicant',
    cell: (row) => fullName(row),
  },
  {
    id: 'mobileno',
    header: 'Mobile',
    cellClassName: 'text-muted-foreground',
    cell: (row) => row.mobileno || '—',
  },
  {
    id: 'submit_date',
    header: 'Submitted',
    cellClassName: 'text-muted-foreground',
    cell: (row) => (row.submit_date ? formatDate(row.submit_date) : '—'),
  },
  {
    id: 'status',
    header: 'Enrollment',
    cell: (row) => (
      <Badge variant={row.is_enroll === 1 ? 'success' : 'muted'}>
        {row.is_enroll === 1 ? 'Enrolled' : 'Pending'}
      </Badge>
    ),
  },
];

export function OnlineAdmissionsTable({
  admissions,
  onConvert,
  convertingId,
}: OnlineAdmissionsTableProps) {
  return (
    <DataTable
      data={admissions}
      columns={columns}
      getRowKey={(row) => row.id}
      actions={(row) => (
        <PermissionButton
          permission="students.create"
          variant="ghost"
          size="sm"
          disabled={row.is_enroll === 1 || convertingId === row.id}
          onClick={() => onConvert(row)}
          aria-label={`Convert ${fullName(row)} to student`}
          className="gap-1"
        >
          <UserCheck className="h-4 w-4" />
          Convert
        </PermissionButton>
      )}
    />
  );
}
