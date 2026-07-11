import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, UserCheck } from 'lucide-react';
import { Button } from '@components/ui/button';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { PermissionButton } from '@components/rbac/PermissionButton';
import type { StudentListItem } from '@app-types/students/student';
import { ROUTES } from '@constants/index';
import { formatClassSection } from '@utils/student';
import { formatDate } from '@utils/format';
import { useEnableStudent } from '@hooks/useStudents';

interface DisabledStudentsTableProps {
  students: StudentListItem[];
  searchValue: string;
  onSearchChange: (value: string) => void;
}

export function DisabledStudentsTable({
  students,
  searchValue,
  onSearchChange,
}: DisabledStudentsTableProps) {
  const navigate = useNavigate();
  const [studentToEnable, setStudentToEnable] = useState<StudentListItem | null>(null);
  const enableMutation = useEnableStudent();

  const columns = useMemo<DataTableColumn<StudentListItem>[]>(
    () => [
      {
        id: 'admission_no',
        header: 'Admission No.',
        enableSorting: true,
        sortValue: (row) => row.admission_no,
        cell: (row) => (
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
            {row.admission_no}
          </code>
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
        id: 'disable_reason',
        header: 'Reason',
        cell: (row) => row.disable_reason_name ?? '—',
      },
      {
        id: 'disabled_at',
        header: 'Disabled on',
        cellClassName: 'text-muted-foreground',
        cell: (row) => (row.disabled_at ? formatDate(row.disabled_at) : '—'),
      },
      {
        id: 'disable_note',
        header: 'Note',
        cellClassName: 'max-w-xs truncate text-muted-foreground',
        cell: (row) => row.disable_note ?? '—',
      },
    ],
    [],
  );

  const handleEnable = () => {
    if (!studentToEnable) return;
    enableMutation.mutate(studentToEnable.id, {
      onSuccess: () => setStudentToEnable(null),
    });
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
        searchPlaceholder="Search by name, admission no., reason…"
        emptyMessage="No disabled students match your search."
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
              onClick={() => setStudentToEnable(student)}
              aria-label={`Re-enable ${student.full_name}`}
              className="text-primary hover:bg-primary/10 hover:text-primary"
            >
              <UserCheck className="h-4 w-4" />
            </PermissionButton>
          </>
        )}
        actionsHeader="Actions"
      />

      <ConfirmDialog
        open={studentToEnable !== null}
        onOpenChange={(open) => !open && setStudentToEnable(null)}
        title="Re-enable student"
        description={`Restore ${studentToEnable?.full_name} to the active student list and reactivate portal access?`}
        confirmLabel="Re-enable"
        isLoading={enableMutation.isPending}
        onConfirm={handleEnable}
      />
    </>
  );
}
