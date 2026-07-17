import { Pencil, Trash2 } from 'lucide-react';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { StatusBadge } from '@components/feedback/StatusBadge';
import { PermissionButton } from '@components/rbac/PermissionButton';
import type { TransportRoute } from '@app-types/transport';

interface Props {
  routes: TransportRoute[];
  onEdit: (route: TransportRoute) => void;
  onDelete: (route: TransportRoute) => void;
}

const columns: DataTableColumn<TransportRoute>[] = [
  {
    id: 'title',
    header: 'Route',
    cellClassName: 'font-medium',
    cell: (row) => row.route_title ?? 'Untitled route',
  },
  { id: 'from', header: 'From', cell: (row) => row.route_from ?? '—' },
  { id: 'to', header: 'To', cell: (row) => row.route_to ?? '—' },
  { id: 'distance', header: 'Distance', cell: (row) => row.route_distance ?? '—' },
  { id: 'vehicles', header: 'Vehicles', cell: (row) => row.no_of_vehicle ?? '—' },
  {
    id: 'status',
    header: 'Status',
    cell: (row) => <StatusBadge isActive={row.is_active === 'yes' ? 'yes' : 'no'} />,
  },
];

export function TransportRoutesTable({ routes, onEdit, onDelete }: Props) {
  return (
    <DataTable
      data={routes}
      columns={columns}
      getRowKey={(row) => row.id}
      actions={(row) => (
        <>
          <PermissionButton
            permission="transport.edit"
            variant="ghost"
            size="sm"
            onClick={() => onEdit(row)}
            aria-label={`Edit ${row.route_title ?? 'route'}`}
          >
            <Pencil className="h-4 w-4" />
          </PermissionButton>
          <PermissionButton
            permission="transport.delete"
            variant="ghost"
            size="sm"
            onClick={() => onDelete(row)}
            className="text-destructive hover:text-destructive"
            aria-label={`Delete ${row.route_title ?? 'route'}`}
          >
            <Trash2 className="h-4 w-4" />
          </PermissionButton>
        </>
      )}
    />
  );
}
