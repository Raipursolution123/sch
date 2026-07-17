import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormTextField, FormTextareaField } from '@components/forms/fields';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { Button } from '@components/ui/button';
import {
  useCreateRoomType,
  useDeleteRoomType,
  useRoomTypes,
  useUpdateRoomType,
} from '@hooks/useRoomTypes';
import type { RoomType } from '@app-types/hostel/room-type';
import { ModuleListPack } from '@workflow-packs';

const schema = z.object({
  room_type: z.string().trim().min(1, 'Room type is required'),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const columns: DataTableColumn<RoomType>[] = [
  {
    id: 'room_type',
    header: 'Room type',
    cellClassName: 'font-medium',
    cell: (r) => r.room_type ?? '—',
  },
  {
    id: 'description',
    header: 'Description',
    cellClassName: 'text-muted-foreground',
    cell: (r) => r.description ?? '—',
  },
];

export function RoomTypesPage() {
  const { data, isLoading, isError, error, refetch } = useRoomTypes();
  const createMutation = useCreateRoomType();
  const updateMutation = useUpdateRoomType();
  const deleteMutation = useDeleteRoomType();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<RoomType | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RoomType | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { room_type: '', description: '' },
  });

  const openCreate = () => {
    setSelected(null);
    reset({ room_type: '', description: '' });
    setDialogOpen(true);
  };

  const openEdit = (row: RoomType) => {
    setSelected(row);
    reset({ room_type: row.room_type ?? '', description: row.description ?? '' });
    setDialogOpen(true);
  };

  const onSubmit = (values: FormValues) => {
    const payload = {
      room_type: values.room_type,
      description: values.description || null,
    };
    if (selected) {
      updateMutation.mutate(
        { id: selected.id, payload },
        { onSuccess: () => setDialogOpen(false) },
      );
      return;
    }
    createMutation.mutate(payload, { onSuccess: () => setDialogOpen(false) });
  };

  const addAction = (
    <Button onClick={openCreate} className="gap-1">
      <Plus className="h-4 w-4" aria-hidden="true" />
      Add Room Type
    </Button>
  );

  return (
    <ModuleListPack
      title="Room Types"
      description="Define room categories for hostel allocation."
      actions={addAction}
      isLoading={isLoading}
      loadingMessage="Loading room types..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && (data?.length ?? 0) === 0}
      emptyTitle="No room types"
      emptyDescription="Add a room type to classify hostel rooms."
      emptyAction={addAction}
      footer={
        <>
          <EntityFormDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            title={selected ? 'Edit room type' : 'Add room type'}
            onSubmit={handleSubmit(onSubmit)}
            isLoading={createMutation.isPending || updateMutation.isPending}
            submitLabel={selected ? 'Save' : 'Create'}
          >
            <FormErrorSummary errors={errors} />
            <FormTextField control={control} name="room_type" label="Room type" />
            <FormTextareaField control={control} name="description" label="Description" optional />
          </EntityFormDialog>
          <ConfirmDialog
            open={deleteTarget !== null}
            onOpenChange={(open) => {
              if (!open) setDeleteTarget(null);
            }}
            title="Delete room type"
            description={
              deleteTarget ? `Delete "${deleteTarget.room_type}"? This cannot be undone.` : ''
            }
            confirmLabel="Delete"
            destructive
            isLoading={deleteMutation.isPending}
            onConfirm={() => {
              if (!deleteTarget) return;
              deleteMutation.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
            }}
          />
        </>
      }
    >
      <DataTable
        data={data ?? []}
        columns={columns}
        getRowKey={(row) => row.id}
        actions={(row) => (
          <>
            <Button variant="ghost" size="sm" onClick={() => openEdit(row)} aria-label="Edit">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleteTarget(row)}
              aria-label="Delete"
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
      />
    </ModuleListPack>
  );
}
