import { Pencil, Trash2 } from 'lucide-react';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { PermissionButton } from '@components/rbac/PermissionButton';
import type { Vehicle } from '@app-types/transport';

interface Props {
  vehicles: Vehicle[];
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (vehicle: Vehicle) => void;
}

const columns: DataTableColumn<Vehicle>[] = [
  {
    id: 'registration',
    header: 'Registration',
    cellClassName: 'font-medium',
    cell: (row) => row.registration_number,
  },
  { id: 'vehicle', header: 'Vehicle no.', cell: (row) => row.vehicle_no ?? '—' },
  { id: 'capacity', header: 'Capacity', cell: (row) => row.max_seating_capacity },
  { id: 'driver', header: 'Driver', cell: (row) => row.driver_name ?? '—' },
  { id: 'contact', header: 'Contact', cell: (row) => row.driver_contact ?? '—' },
];

export function VehiclesTable({ vehicles, onEdit, onDelete }: Props) {
  return (
    <DataTable
      data={vehicles}
      columns={columns}
      getRowKey={(row) => row.id}
      actions={(row) => (
        <>
          <PermissionButton
            permission="transport.edit"
            variant="ghost"
            size="sm"
            onClick={() => onEdit(row)}
            aria-label={`Edit ${row.registration_number}`}
          >
            <Pencil className="h-4 w-4" />
          </PermissionButton>
          <PermissionButton
            permission="transport.delete"
            variant="ghost"
            size="sm"
            onClick={() => onDelete(row)}
            className="text-destructive hover:text-destructive"
            aria-label={`Delete ${row.registration_number}`}
          >
            <Trash2 className="h-4 w-4" />
          </PermissionButton>
        </>
      )}
    />
  );
}
