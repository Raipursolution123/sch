import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Eye, Trash2 } from 'lucide-react';
import { Button } from '@components/ui/button';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import type { DataTablePaginationConfig } from '@components/data/data-table-types';
import { StatusBadge } from '@components/feedback/StatusBadge';
import { DisableStudentDialog } from '@features/students/components/DisableStudentDialog';
import type { DisableStudentFormValues } from '@features/students/schemas/disable-student.schema';
import { PermissionButton } from '@components/rbac/PermissionButton';
import type { StudentListItem } from '@app-types/students/student';
import { ROUTES } from '@constants/index';
import { formatClassSection, formatGender } from '@utils/student';
import { useDisableStudent } from '@hooks/useStudents';

interface StudentsTableProps {
  students: StudentListItem[];
  pagination?: DataTablePaginationConfig;
  isLoading?: boolean;
  /** Enable checkbox column + bulk actions bar. @default true */
  enableBulkSelection?: boolean;
}

const columns: DataTableColumn<StudentListItem>[] = [
  {
    id: 'admission_no',
    header: 'Admission No.',
    enableSorting: true,
    sortValue: (row) => row.admission_no,
    cell: (row) => (
      <code className="rounded-sm bg-muted px-1.5 py-0.5 font-mono text-xs">
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

function exportStudentsCsv(rows: StudentListItem[]) {
  const header = ['Admission No.', 'Name', 'Class', 'Roll', 'Gender', 'Mobile', 'Status'];
  const lines = rows.map((row) =>
    [
      row.admission_no,
      row.full_name,
      formatClassSection(row.class_name, row.section_name),
      row.roll_no ?? '',
      formatGender(row.gender),
      row.mobileno ?? '',
      row.is_active === 'yes' ? 'Active' : 'Inactive',
    ]
      .map((value) => `"${String(value).replace(/"/g, '""')}"`)
      .join(','),
  );
  const blob = new Blob([[header.join(','), ...lines].join('\n')], {
    type: 'text/csv;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `students-export-${new Date().toISOString().slice(0, 10)}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function StudentsTable({
  students,
  pagination,
  isLoading,
  enableBulkSelection = true,
}: StudentsTableProps) {
  const navigate = useNavigate();
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [studentToDisable, setStudentToDisable] = useState<StudentListItem | null>(null);
  const disableMutation = useDisableStudent();

  const selectedStudents = useMemo(
    () => students.filter((student) => rowSelection[String(student.id)]),
    [students, rowSelection],
  );

  const handleDisable = (values: DisableStudentFormValues) => {
    if (!studentToDisable) return;
    disableMutation.mutate(
      {
        id: studentToDisable.id,
        payload: {
          disable_reason_id: values.disable_reason_id,
          dis_note: values.dis_note,
        },
      },
      {
        onSuccess: () => {
          setStudentToDisable(null);
          setRowSelection({});
        },
      },
    );
  };

  const bulkActions = enableBulkSelection ? (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 gap-1.5"
        disabled={selectedStudents.length === 0}
        onClick={() => exportStudentsCsv(selectedStudents)}
      >
        <Download className="h-3.5 w-3.5" aria-hidden="true" />
        Export selected
      </Button>
      <PermissionButton
        permission="students.delete"
        variant="outline"
        size="sm"
        className="h-8 gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
        disabled={selectedStudents.length === 0}
        onClick={() => {
          const first = selectedStudents[0];
          if (first) setStudentToDisable(first);
        }}
      >
        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
        Disable selected
      </PermissionButton>
    </>
  ) : undefined;

  return (
    <>
      <DataTable
        data={students}
        columns={columns}
        getRowKey={(student) => student.id}
        enableSorting
        showDensityToggle
        isLoading={isLoading}
        emptyMessage="No students match your filters."
        pagination={pagination}
        enableRowSelection={enableBulkSelection}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        bulkActions={bulkActions}
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
              onClick={() => setStudentToDisable(student)}
              aria-label={`Disable ${student.full_name}`}
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </PermissionButton>
          </>
        )}
        actionsHeader={<span className="sr-only">Actions</span>}
      />

      <DisableStudentDialog
        open={studentToDisable !== null}
        onOpenChange={(open) => !open && setStudentToDisable(null)}
        studentName={
          studentToDisable
            ? selectedStudents.length > 1 && selectedStudents[0]?.id === studentToDisable.id
              ? `${studentToDisable.full_name} (1 of ${selectedStudents.length} selected)`
              : studentToDisable.full_name
            : ''
        }
        onSubmit={handleDisable}
        isLoading={disableMutation.isPending}
      />
    </>
  );
}
