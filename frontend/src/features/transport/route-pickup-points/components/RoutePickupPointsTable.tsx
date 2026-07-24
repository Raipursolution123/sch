import { Pencil, Trash2 } from 'lucide-react';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import type { PickupPoint, RoutePickupPoint, TransportRoute } from '@app-types/transport';

interface RoutePickupPointsTableProps {
  assignments: RoutePickupPoint[];
  routes: TransportRoute[];
  pickupPoints: PickupPoint[];
  onEdit: (assignment: RoutePickupPoint) => void;
  onDelete: (assignment: RoutePickupPoint) => void;
}

function routeLabel(routes: TransportRoute[], routeId: number) {
  const route = routes.find((item) => item.id === routeId);
  return route?.route_title || `Route ${routeId}`;
}

function pickupLabel(pickupPoints: PickupPoint[], pickupId: number) {
  const point = pickupPoints.find((item) => item.id === pickupId);
  return point?.name || `Pickup ${pickupId}`;
}

export function RoutePickupPointsTable({
  assignments,
  routes,
  pickupPoints,
  onEdit,
  onDelete,
}: RoutePickupPointsTableProps) {
  const columns: DataTableColumn<RoutePickupPoint>[] = [
    {
      id: 'route',
      header: 'Route',
      cellClassName: 'font-medium',
      cell: (row) => routeLabel(routes, row.transport_route_id),
    },
    {
      id: 'pickup_point',
      header: 'Pickup Point',
      cell: (row) => pickupLabel(pickupPoints, row.pickup_point_id),
    },
    {
      id: 'fees',
      header: 'Fees',
      cellClassName: 'text-muted-foreground',
      cell: (row) => row.fees ?? 0,
    },
    {
      id: 'pickup_time',
      header: 'Pickup Time',
      cellClassName: 'text-muted-foreground',
      cell: (row) => row.pickup_time || '—',
    },
    {
      id: 'order_number',
      header: 'Order',
      cellClassName: 'text-muted-foreground',
      cell: (row) => row.order_number || '—',
    },
  ];

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
            aria-label="Edit assignment"
          >
            <Pencil className="h-4 w-4" />
          </PermissionButton>
          <PermissionButton
            permission="transport.delete"
            variant="ghost"
            size="sm"
            onClick={() => onDelete(row)}
            aria-label="Delete assignment"
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </PermissionButton>
        </>
      )}
    />
  );
}
