import { useMemo } from 'react';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { ReportSummaryGrid } from '@components/reports';
import { useHostelRooms } from '@hooks/useHostelRooms';
import { useHostels } from '@hooks/useHostels';
import { useRoomTypes } from '@hooks/useRoomTypes';
import { useTransportRoutes } from '@hooks/useTransportRoutes';
import { useVehicles } from '@hooks/useVehicles';
import { exportToCsv } from '@utils/export-csv';
import { printReport } from '@utils/print-report';
import { ModuleReportPack } from '@workflow-packs';
import type { TransportRoute, Vehicle } from '@app-types/transport';
import type { HostelRoom } from '@app-types/hostel/hostel-room';

export function TransportHostelReportPage() {
  const routesQuery = useTransportRoutes();
  const vehiclesQuery = useVehicles();
  const hostelsQuery = useHostels();
  const roomsQuery = useHostelRooms();
  const { data: roomTypes = [] } = useRoomTypes();

  const routes = routesQuery.data ?? [];
  const vehicles = vehiclesQuery.data ?? [];
  const hostels = hostelsQuery.data ?? [];
  const rooms = roomsQuery.data ?? [];

  const hostelName = (id: number | null) =>
    hostels.find((h) => h.id === id)?.hostel_name ?? (id != null ? String(id) : '—');

  const roomTypeName = (id: number | null) =>
    roomTypes.find((r) => r.id === id)?.room_type ?? (id != null ? String(id) : '—');

  const isLoading =
    routesQuery.isLoading ||
    vehiclesQuery.isLoading ||
    hostelsQuery.isLoading ||
    roomsQuery.isLoading;

  const isError =
    routesQuery.isError || vehiclesQuery.isError || hostelsQuery.isError || roomsQuery.isError;

  const error = routesQuery.error ?? vehiclesQuery.error ?? hostelsQuery.error ?? roomsQuery.error;

  const totalBeds = useMemo(
    () => rooms.reduce((sum, room) => sum + (room.no_of_bed ?? 0), 0),
    [rooms],
  );

  const routeColumns: DataTableColumn<TransportRoute>[] = [
    {
      id: 'title',
      header: 'Route',
      cellClassName: 'font-medium',
      cell: (row) => row.route_title ?? '—',
    },
    {
      id: 'from_to',
      header: 'From → To',
      cellClassName: 'text-muted-foreground',
      cell: (row) => `${row.route_from ?? '—'} → ${row.route_to ?? '—'}`,
    },
    {
      id: 'vehicles',
      header: 'Vehicles',
      cellClassName: 'tabular-nums text-muted-foreground',
      cell: (row) => row.no_of_vehicle ?? '—',
    },
  ];

  const vehicleColumns: DataTableColumn<Vehicle>[] = [
    {
      id: 'vehicle_no',
      header: 'Vehicle No.',
      cellClassName: 'font-medium',
      cell: (row) => row.vehicle_no ?? row.registration_number,
    },
    {
      id: 'model',
      header: 'Model',
      cellClassName: 'text-muted-foreground',
      cell: (row) => row.vehicle_model ?? '—',
    },
    {
      id: 'driver',
      header: 'Driver',
      cellClassName: 'text-muted-foreground',
      cell: (row) => row.driver_name ?? '—',
    },
  ];

  const roomColumns: DataTableColumn<HostelRoom>[] = [
    {
      id: 'hostel',
      header: 'Hostel',
      cellClassName: 'font-medium',
      cell: (row) => hostelName(row.hostel_id),
    },
    { id: 'room', header: 'Room No.', cell: (row) => row.room_no ?? '—' },
    {
      id: 'type',
      header: 'Type',
      cellClassName: 'text-muted-foreground',
      cell: (row) => roomTypeName(row.room_type_id),
    },
    {
      id: 'beds',
      header: 'Beds',
      cellClassName: 'tabular-nums',
      cell: (row) => row.no_of_bed ?? '—',
    },
  ];

  const handleExportCsv = () => {
    exportToCsv(
      'transport-hostel-report',
      ['Section', 'Name', 'Detail'],
      [
        ...routes.map((row) => [
          'Transport route',
          row.route_title ?? '',
          `${row.route_from ?? ''} → ${row.route_to ?? ''}`.trim(),
        ]),
        ...vehicles.map((row) => [
          'Vehicle',
          row.vehicle_no ?? row.registration_number,
          row.vehicle_model ?? '',
        ]),
        ...rooms.map((row) => [
          'Hostel room',
          `${hostelName(row.hostel_id)} ${row.room_no ?? ''}`.trim(),
          roomTypeName(row.room_type_id),
        ]),
      ],
    );
  };

  const hasData = routes.length > 0 || vehicles.length > 0 || rooms.length > 0;

  return (
    <ModuleReportPack
      title="Transport & Hostel Report"
      description="Overview of transport routes, vehicles, and hostel room capacity."
      printTitle="Transport & Hostel Report"
      onPrint={printReport}
      onExportCsv={handleExportCsv}
      exportDisabled={!hasData}
      submitted
      hasData={hasData || isLoading}
      isLoading={isLoading}
      loadingMessage="Loading transport and hostel data..."
      isError={isError}
      error={error}
      onRetry={() => {
        void routesQuery.refetch();
        void vehiclesQuery.refetch();
        void hostelsQuery.refetch();
        void roomsQuery.refetch();
      }}
      isEmpty={!isLoading && !isError && !hasData}
      emptyTitle="No transport or hostel records"
      emptyDescription="Configure routes, vehicles, and hostel rooms to populate this report."
      summary={
        hasData ? (
          <ReportSummaryGrid
            items={[
              { label: 'Routes', value: routes.length },
              { label: 'Vehicles', value: vehicles.length },
              { label: 'Hostel rooms', value: rooms.length },
              { label: 'Total beds', value: totalBeds },
            ]}
          />
        ) : undefined
      }
      filters={
        <p className="col-span-full text-sm text-muted-foreground">
          Snapshot of current transport and hostel configuration.
        </p>
      }
    >
      <div className="space-y-8">
        {routes.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Transport routes</h3>
            <DataTable columns={routeColumns} data={routes} getRowKey={(row) => row.id} />
          </div>
        )}
        {vehicles.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Vehicles</h3>
            <DataTable columns={vehicleColumns} data={vehicles} getRowKey={(row) => row.id} />
          </div>
        )}
        {rooms.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Hostel rooms</h3>
            <DataTable columns={roomColumns} data={rooms} getRowKey={(row) => row.id} />
          </div>
        )}
      </div>
    </ModuleReportPack>
  );
}
