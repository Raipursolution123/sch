import { useNavigate } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { Button } from '@components/ui/button';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { StatusBadge } from '@components/feedback/StatusBadge';
import type { StudentListItem } from '@app-types/students/student';
import { ROUTES } from '@constants/index';
import { formatClassSection, formatGender } from '@utils/student';

interface StudentsTableProps {
  students: StudentListItem[];
}

const columns: DataTableColumn<StudentListItem>[] = [
  {
    id: 'admission_no',
    header: 'Admission No.',
    cell: (row) => (
      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{row.admission_no}</code>
    ),
  },
  {
    id: 'full_name',
    header: 'Student',
    cellClassName: 'font-medium',
    cell: (row) => row.full_name,
  },
  {
    id: 'class_section',
    header: 'Class',
    cell: (row) => formatClassSection(row.class_name, row.section_name),
  },
  {
    id: 'roll_no',
    header: 'Roll No.',
    cellClassName: 'text-muted-foreground tabular-nums',
    cell: (row) => (row.roll_no != null ? row.roll_no : '—'),
  },
  {
    id: 'gender',
    header: 'Gender',
    cellClassName: 'text-muted-foreground',
    cell: (row) => formatGender(row.gender),
  },
  {
    id: 'mobileno',
    header: 'Mobile',
    cellClassName: 'text-muted-foreground',
    cell: (row) => row.mobileno ?? '—',
  },
  {
    id: 'status',
    header: 'Status',
    cell: (row) => <StatusBadge isActive={row.is_active} />,
  },
];

export function StudentsTable({ students }: StudentsTableProps) {
  const navigate = useNavigate();

  return (
    <DataTable
      data={students}
      columns={columns}
      getRowKey={(student) => student.id}
      actions={(student) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(ROUTES.students.detail(student.id))}
          aria-label={`View ${student.full_name}`}
        >
          <Eye className="h-4 w-4" />
        </Button>
      )}
      actionsHeader="View"
    />
  );
}
