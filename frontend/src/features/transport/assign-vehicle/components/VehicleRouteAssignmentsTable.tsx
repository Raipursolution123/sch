import { Pencil, Trash2 } from 'lucide-react';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { PermissionButton } from '@components/rbac/PermissionButton';
import type { VehicleRouteAssignment } from '@app-types/transport';

interface Props {
  assignments: VehicleRouteAssignment[];
  onEdit: (assignment: VehicleRouteAssignment) => void;
  onDelete: (assignment: VehicleRouteAssignment) => void;
}

const columns: DataTableColumn<VehicleRouteAssignment>[] = [
  {
    id: 'route',
    header: 'Route',
    cellClassName: 'font-medium',
    cell: (row) => row.route_title ?? `Route ${row.route_id}`,
  },
  {
    id: 'journey',
    header: 'Journey',
    cell: (row) => [row.route_from, row.route_to].filter(Boolean).join(' → ') || '—',
  },
  { id: 'vehicle', header: 'Vehicle', cell: (row) => row.vehicle_no ?? `#${row.vehicle_id}` },
  { id: 'driver', header: 'Driver', cell: (row) => row.driver_name ?? '—' },
];

export function VehicleRouteAssignmentsTable({ assignments, onEdit, onDelete }: Props) {
  return (
    <DataTable
      data={assignments}
      columns={columns}
      getRowKey={(row) => row.id}
      actions={(row) => (
        <>
          <PermissionButton
            permission="transport.edit"
            variant="ghost"
            size="sm"
            onClick={() => onEdit(row)}
            aria-label="Edit vehicle assignment"
          >
            <Pencil className="h-4 w-4" />
          </PermissionButton>
          <PermissionButton
            permission="transport.delete"
            variant="ghost"
            size="sm"
            onClick={() => onDelete(row)}
            className="text-destructive hover:text-destructive"
            aria-label="Remove vehicle assignment"
          >
            <Trash2 className="h-4 w-4" />
          </PermissionButton>
        </>
      )}
    />
  );
}
