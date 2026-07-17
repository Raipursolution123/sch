import { Pencil, Trash2 } from 'lucide-react';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { PermissionButton } from '@components/rbac/PermissionButton';
import type { PickupPoint } from '@app-types/transport';

interface Props {
  pickupPoints: PickupPoint[];
  onEdit: (point: PickupPoint) => void;
  onDelete: (point: PickupPoint) => void;
}

const columns: DataTableColumn<PickupPoint>[] = [
  { id: 'name', header: 'Pickup point', cellClassName: 'font-medium', cell: (row) => row.name },
  { id: 'latitude', header: 'Latitude', cell: (row) => row.latitude ?? '—' },
  { id: 'longitude', header: 'Longitude', cell: (row) => row.longitude ?? '—' },
];

export function PickupPointsTable({ pickupPoints, onEdit, onDelete }: Props) {
  return (
    <DataTable
      data={pickupPoints}
      columns={columns}
      getRowKey={(row) => row.id}
      actions={(row) => (
        <>
          <PermissionButton
            permission="transport.edit"
            variant="ghost"
            size="sm"
            onClick={() => onEdit(row)}
            aria-label={`Edit ${row.name}`}
          >
            <Pencil className="h-4 w-4" />
          </PermissionButton>
          <PermissionButton
            permission="transport.delete"
            variant="ghost"
            size="sm"
            onClick={() => onDelete(row)}
            className="text-destructive hover:text-destructive"
            aria-label={`Delete ${row.name}`}
          >
            <Trash2 className="h-4 w-4" />
          </PermissionButton>
        </>
      )}
    />
  );
}
