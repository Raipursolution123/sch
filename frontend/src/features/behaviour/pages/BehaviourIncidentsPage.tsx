import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { z } from 'zod';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormNumberField, FormTextField } from '@components/forms/fields';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { ModuleListPack } from '@workflow-packs';
import {
  useBehaviourIncidents,
  useCreateBehaviourIncident,
  useDeleteBehaviourIncident,
  useUpdateBehaviourIncident,
} from '@hooks/useBehaviour';
import type { BehaviourIncidentType } from '@services/api/behaviour.service';

const schema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  point: z.number().int(),
  description: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export function BehaviourIncidentsPage() {
  const { data = [], isLoading, isError, error, refetch } = useBehaviourIncidents();
  const createMutation = useCreateBehaviourIncident();
  const updateMutation = useUpdateBehaviourIncident();
  const deleteMutation = useDeleteBehaviourIncident();

  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<BehaviourIncidentType | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BehaviourIncidentType | null>(null);

  const { control, handleSubmit, reset, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', point: 0, description: '' },
  });

  useEffect(() => {
    if (!open) return;
    reset(
      selected
        ? {
            title: selected.title,
            point: selected.point,
            description: selected.description || '',
          }
        : { title: '', point: 0, description: '' },
    );
  }, [open, selected, reset]);

  const filtered = data.filter((item) => item.title.toLowerCase().includes(search.toLowerCase()));

  const addAction = (
    <PermissionButton
      permission="behaviour.create"
      onClick={() => {
        setSelected(null);
        setOpen(true);
      }}
      className="gap-1"
    >
      <Plus className="h-4 w-4" />
      Add Incident Type
    </PermissionButton>
  );

  const columns: DataTableColumn<BehaviourIncidentType>[] = [
    { id: 'title', header: 'Title', cellClassName: 'font-medium', cell: (r) => r.title },
    { id: 'point', header: 'Points', cell: (r) => r.point },
    {
      id: 'description',
      header: 'Description',
      cell: (r) => r.description || '—',
    },
  ];

  return (
    <>
      <ModuleListPack
        title="Behaviour Incident Types"
        description="Master list of positive and negative behaviour incidents with point values."
        actions={addAction}
        isLoading={isLoading}
        loadingMessage="Loading incident types..."
        isError={isError}
        error={error}
        onRetry={() => void refetch()}
        isEmpty={!isLoading && !isError && data.length === 0}
        emptyTitle="No incident types"
        emptyDescription="Create incident types before assigning them to students."
        emptyAction={addAction}
      >
        <DataTable
          data={filtered}
          columns={columns}
          getRowKey={(r) => r.id}
          searchValue={search}
          onSearchChange={setSearch}
          actions={(row) => (
            <>
              <PermissionButton
                permission="behaviour.edit"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelected(row);
                  setOpen(true);
                }}
              >
                <Pencil className="h-4 w-4" />
              </PermissionButton>
              <PermissionButton
                permission="behaviour.delete"
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => setDeleteTarget(row)}
              >
                <Trash2 className="h-4 w-4" />
              </PermissionButton>
            </>
          )}
        />
      </ModuleListPack>

      <EntityFormDialog
        open={open}
        onOpenChange={setOpen}
        title={selected ? 'Edit Incident Type' : 'Add Incident Type'}
        onSubmit={handleSubmit((values) => {
          const payload = {
            title: values.title,
            point: values.point,
            description: values.description || '',
          };
          if (selected) {
            updateMutation.mutate(
              { id: selected.id, payload },
              { onSuccess: () => setOpen(false) },
            );
          } else {
            createMutation.mutate(payload, { onSuccess: () => setOpen(false) });
          }
        })}
        isLoading={createMutation.isPending || updateMutation.isPending}
      >
        <FormErrorSummary errors={formState.errors} />
        <FormTextField control={control} name="title" label="Title" required />
        <FormNumberField control={control} name="point" label="Points" required />
        <FormTextField control={control} name="description" label="Description" />
      </EntityFormDialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(openState) => {
          if (!openState) setDeleteTarget(null);
        }}
        title="Delete incident type"
        description={
          deleteTarget
            ? `Delete "${deleteTarget.title}"? Types already assigned cannot be deleted.`
            : ''
        }
        confirmLabel="Delete"
        destructive
        isLoading={deleteMutation.isPending}
        onConfirm={() => {
          if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
        }}
      />
    </>
  );
}
