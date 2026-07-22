import { Pencil, Trash2, ShieldAlert } from 'lucide-react';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import type { Role } from '@/types/settings/roles';

interface RolesTableProps {
  roles: Role[];
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
  onManagePermissions: (role: Role) => void;
}

const columns = (
  onManagePermissions: (role: Role) => void
): DataTableColumn<Role>[] => [
  {
    id: 'name',
    header: 'Role Name',
    cellClassName: 'font-medium',
    cell: (row) => row.name,
  },
  {
    id: 'type',
    header: 'Type',
    cell: (row) => {
      const isSystem = row.is_system === 1 || row.is_superadmin === 1;
      return isSystem ? (
        <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">System Role</Badge>
      ) : (
        <Badge variant="secondary">Custom Role</Badge>
      );
    },
  },
  {
    id: 'permissions',
    header: 'Access Control',
    cell: (row) => (
      <Button
        variant="outline"
        size="sm"
        onClick={() => onManagePermissions(row)}
        className="space-x-1"
      >
        <ShieldAlert className="h-4 w-4 text-primary" />
        <span>Permissions</span>
      </Button>
    ),
  },
];

export function RolesTable({
  roles,
  onEdit,
  onDelete,
  onManagePermissions,
}: RolesTableProps) {
  return (
    <DataTable
      data={roles}
      columns={columns(onManagePermissions)}
      getRowKey={(role) => role.id}
      actions={(role) => {
        const isSuper = role.is_superadmin === 1;

        return (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(role)}
              aria-label={`Edit ${role.name}`}
            >
              <Pencil className="h-4 w-4 text-blue-500" />
            </Button>
            {!isSuper && (
              <Button
                variant="ghost"
                size="sm"
                disabled={role.is_system === 1}
                onClick={() => onDelete(role)}
                aria-label={`Delete ${role.name}`}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </>
        );
      }}
    />
  );
}
export default RolesTable;
