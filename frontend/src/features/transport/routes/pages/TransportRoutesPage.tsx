import { useState } from 'react';
import { Plus } from 'lucide-react';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { ModuleListPack } from '@workflow-packs';
import {
  useCreateTransportRoute,
  useDeleteTransportRoute,
  useTransportRoutes,
  useUpdateTransportRoute,
} from '@hooks/useTransportRoutes';
import type { TransportRoute } from '@app-types/transport';
import { TransportRouteFormDialog } from '@features/transport/routes/components/TransportRouteFormDialog';
import { TransportRoutesTable } from '@features/transport/routes/components/TransportRoutesTable';
import type { TransportRouteFormValues } from '@features/transport/routes/schemas/transport-route.schema';

const optionalNumber = (value: string) => (value === '' ? null : Number(value));

export function TransportRoutesPage() {
  const { data, isLoading, isError, error, refetch } = useTransportRoutes();
  const createMutation = useCreateTransportRoute();
  const updateMutation = useUpdateTransportRoute();
  const deleteMutation = useDeleteTransportRoute();
  const [selected, setSelected] = useState<TransportRoute | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TransportRoute | null>(null);

  const addAction = (
    <PermissionButton
      permission="transport.create"
      onClick={() => {
        setSelected(null);
        setFormOpen(true);
      }}
      className="gap-1"
    >
      <Plus className="h-4 w-4" />
      Add Route
    </PermissionButton>
  );

  const handleSubmit = (values: TransportRouteFormValues) => {
    const payload = {
      route_title: values.route_title,
      route_from: values.route_from || null,
      route_to: values.route_to || null,
      route_distance: optionalNumber(values.route_distance),
      no_of_vehicle: optionalNumber(values.no_of_vehicle),
      note: values.note || null,
      is_active: values.is_active ? 'yes' : 'no',
    };
    const options = { onSuccess: () => setFormOpen(false) };
    if (selected) updateMutation.mutate({ id: selected.id, payload }, options);
    else createMutation.mutate(payload, options);
  };

  return (
    <ModuleListPack
      title="Transport Routes"
      description="Manage school transport routes and operating distances."
      actions={addAction}
      isLoading={isLoading}
      loadingMessage="Loading routes..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && (data?.length ?? 0) === 0}
      emptyTitle="No routes"
      emptyDescription="Add a route before assigning a vehicle."
      emptyAction={addAction}
      footer={
        <>
          <TransportRouteFormDialog
            open={formOpen}
            onOpenChange={setFormOpen}
            route={selected}
            onSubmit={handleSubmit}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
          <ConfirmDialog
            open={deleteTarget !== null}
            onOpenChange={(open) => !open && setDeleteTarget(null)}
            title="Delete route"
            description={`Delete "${deleteTarget?.route_title ?? 'this route'}"? This cannot be undone.`}
            confirmLabel="Delete"
            destructive
            isLoading={deleteMutation.isPending}
            onConfirm={() =>
              deleteTarget &&
              deleteMutation.mutate(deleteTarget.id, {
                onSuccess: () => setDeleteTarget(null),
              })
            }
          />
        </>
      }
    >
      <TransportRoutesTable
        routes={data ?? []}
        onEdit={(route) => {
          setSelected(route);
          setFormOpen(true);
        }}
        onDelete={setDeleteTarget}
      />
    </ModuleListPack>
  );
}
