import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Trash2 } from 'lucide-react';
import { Button } from '@components/ui/button';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { StatusBadge } from '@components/feedback/StatusBadge';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { PermissionButton } from '@components/rbac/PermissionButton';
import type { StudentListItem } from '@app-types/students/student';
import { ROUTES } from '@constants/index';
import { formatClassSection, formatGender } from '@utils/student';
import { useDeleteStudent } from '@hooks/useStudents';

interface StudentsTableProps {
  students: StudentListItem[];
  searchValue: string;
  onSearchChange: (value: string) => void;
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

export function StudentsTable({ students, searchValue, onSearchChange }: StudentsTableProps) {
  const navigate = useNavigate();
  const [studentToDelete, setStudentToDelete] = useState<StudentListItem | null>(null);
  const deleteMutation = useDeleteStudent();

  const handleDelete = () => {
    if (studentToDelete) {
      deleteMutation.mutate(studentToDelete.id, {
        onSuccess: () => setStudentToDelete(null),
      });
    }
  };

  return (
    <>
      <DataTable
        data={students}
        columns={columns}
        getRowKey={(student) => student.id}
        enableSorting
        showDensityToggle
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        searchPlaceholder="Search by name, admission no., class…"
        emptyMessage="No students match your search."
        actions={(student) => (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(ROUTES.students.detail(student.id))}
              aria-label={`View ${student.full_name}`}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <PermissionButton
              permission="students.delete"
              variant="ghost"
              size="sm"
              onClick={() => setStudentToDelete(student)}
              aria-label={`Delete ${student.full_name}`}
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </PermissionButton>
          </>
        )}
        actionsHeader="Actions"
      />

      <ConfirmDialog
        open={studentToDelete !== null}
        onOpenChange={(open) => !open && setStudentToDelete(null)}
        title="Delete student"
        description={`Are you sure you want to delete ${studentToDelete?.full_name}? This action cannot be undone.`}
        confirmLabel="Delete"
        destructive
        isLoading={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </>
  );
}
