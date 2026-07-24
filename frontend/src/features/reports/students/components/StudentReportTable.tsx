import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import type { StudentListItem } from '@app-types/students/student';
import { formatClassSection, formatGender } from '@utils/student';

interface StudentReportTableProps {
  students: StudentListItem[];
}

const columns: DataTableColumn<StudentListItem>[] = [
  {
    id: 'admission_no',
    header: 'Admission No.',
    enableSorting: true,
    sortValue: (row) => row.admission_no,
    cell: (row) => (
      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{row.admission_no}</code>
    ),
  },
  {
    id: 'full_name',
    header: 'Student',
    enableSorting: true,
    sortValue: (row) => row.full_name,
    cellClassName: 'font-medium',
    cell: (row) => row.full_name,
  },
  {
    id: 'class_section',
    header: 'Class',
    enableSorting: true,
    sortValue: (row) => formatClassSection(row.class_name, row.section_name),
    cell: (row) => formatClassSection(row.class_name, row.section_name),
  },
  {
    id: 'roll_no',
    header: 'Roll No.',
    enableSorting: true,
    sortValue: (row) => row.roll_no ?? '',
    cellClassName: 'tabular-nums text-muted-foreground',
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
];

export function StudentReportTable({ students }: StudentReportTableProps) {
  return (
    <DataTable
      columns={columns}
      data={students}
      getRowKey={(row) => row.id}
      emptyMessage="No students match the filters."
    />
  );
}
