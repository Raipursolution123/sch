import { Pencil, Plus, Trash2 } from 'lucide-react';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import type { ClassTeacherAssignment } from '@app-types/academics/class-teacher';

interface ClassTeachersTableProps {
  rows: ClassTeacherAssignment[];
  onAssign: (row: ClassTeacherAssignment) => void;
  onEdit: (row: ClassTeacherAssignment) => void;
  onRemove: (row: ClassTeacherAssignment) => void;
}

const columns: DataTableColumn<ClassTeacherAssignment>[] = [
  {
    id: 'class',
    header: 'Class',
    cellClassName: 'font-medium',
    cell: (row) => row.class_name ?? '—',
  },
  {
    id: 'section',
    header: 'Section',
    cellClassName: 'text-muted-foreground',
    cell: (row) => row.section_name ?? '—',
  },
  {
    id: 'teacher',
    header: 'Class teacher',
    cell: (row) =>
      row.staff_name ? (
        <div>
          <div>{row.staff_name}</div>
          {row.staff_employee_id ? (
            <div className="text-xs text-muted-foreground">{row.staff_employee_id}</div>
          ) : null}
        </div>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
];

export function ClassTeachersTable({
  rows,
  onAssign,
  onEdit,
  onRemove,
}: ClassTeachersTableProps) {
  return (
    <DataTable
      data={rows}
      columns={columns}
      getRowKey={(row) => `${row.class_id}-${row.section_id}`}
      actions={(row) =>
        row.id ? (
          <>
            <PermissionButton
              permission="class_teacher.edit"
              variant="ghost"
              size="sm"
              onClick={() => onEdit(row)}
              aria-label={`Edit class teacher for ${row.class_name} ${row.section_name}`}
            >
              <Pencil className="h-4 w-4" />
            </PermissionButton>
            <PermissionButton
              permission="class_teacher.delete"
              variant="ghost"
              size="sm"
              onClick={() => onRemove(row)}
              aria-label={`Remove class teacher for ${row.class_name} ${row.section_name}`}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </PermissionButton>
          </>
        ) : (
          <PermissionButton
            permission="class_teacher.create"
            variant="ghost"
            size="sm"
            onClick={() => onAssign(row)}
            aria-label={`Assign class teacher for ${row.class_name} ${row.section_name}`}
          >
            <Plus className="h-4 w-4" />
          </PermissionButton>
        )
      }
    />
  );
}
