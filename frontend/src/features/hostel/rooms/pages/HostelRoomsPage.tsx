import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormNumberField, FormTextField, FormTextareaField } from '@components/forms/fields';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { Button } from '@components/ui/button';
import {
  useCreateHostelRoom,
  useDeleteHostelRoom,
  useHostelRooms,
  useUpdateHostelRoom,
} from '@hooks/useHostelRooms';
import { useHostels } from '@hooks/useHostels';
import { useRoomTypes } from '@hooks/useRoomTypes';
import type { HostelRoom } from '@app-types/hostel/hostel-room';
import { ModuleListPack } from '@workflow-packs';

const schema = z.object({
  room_no: z.string().trim().min(1, 'Room number is required'),
  hostel_id: z.number().optional().nullable(),
  room_type_id: z.number().optional().nullable(),
  no_of_bed: z.number().optional().nullable(),
  cost_per_bed: z.number().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function HostelRoomsPage() {
  const { data, isLoading, isError, error, refetch } = useHostelRooms();
  const { data: hostels = [] } = useHostels();
  const { data: roomTypes = [] } = useRoomTypes();
  const createMutation = useCreateHostelRoom();
  const updateMutation = useUpdateHostelRoom();
  const deleteMutation = useDeleteHostelRoom();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<HostelRoom | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<HostelRoom | null>(null);

  const hostelName = (id: number | null) =>
    hostels.find((h) => h.id === id)?.hostel_name ?? (id != null ? String(id) : '—');
  const roomTypeName = (id: number | null) =>
    roomTypes.find((r) => r.id === id)?.room_type ?? (id != null ? String(id) : '—');

  const columns: DataTableColumn<HostelRoom>[] = [
    { id: 'room_no', header: 'Room', cellClassName: 'font-medium', cell: (r) => r.room_no ?? '—' },
    { id: 'hostel', header: 'Hostel', cell: (r) => hostelName(r.hostel_id) },
    { id: 'type', header: 'Room type', cell: (r) => roomTypeName(r.room_type_id) },
    { id: 'beds', header: 'Beds', cellClassName: 'tabular-nums', cell: (r) => r.no_of_bed ?? '—' },
    {
      id: 'cost',
      header: 'Cost / bed',
      cellClassName: 'tabular-nums',
      cell: (r) => r.cost_per_bed ?? '—',
    },
  ];

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      room_no: '',
      hostel_id: null,
      room_type_id: null,
      no_of_bed: null,
      cost_per_bed: 0,
      title: '',
      description: '',
    },
  });

  const openCreate = () => {
    setSelected(null);
    reset({
      room_no: '',
      hostel_id: null,
      room_type_id: null,
      no_of_bed: null,
      cost_per_bed: 0,
      title: '',
      description: '',
    });
    setDialogOpen(true);
  };

  const openEdit = (room: HostelRoom) => {
    setSelected(room);
    reset({
      room_no: room.room_no ?? '',
      hostel_id: room.hostel_id,
      room_type_id: room.room_type_id,
      no_of_bed: room.no_of_bed,
      cost_per_bed: room.cost_per_bed ?? 0,
      title: room.title ?? '',
      description: room.description ?? '',
    });
    setDialogOpen(true);
  };

  const onSubmit = (values: FormValues) => {
    const payload = {
      room_no: values.room_no,
      hostel_id: values.hostel_id ?? null,
      room_type_id: values.room_type_id ?? null,
      no_of_bed: values.no_of_bed ?? null,
      cost_per_bed: values.cost_per_bed ?? 0,
      title: values.title || null,
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
      Add Room
    </Button>
  );

  return (
    <ModuleListPack
      title="Hostel Rooms"
      description="Assign rooms to hostels and room types."
      actions={addAction}
      isLoading={isLoading}
      loadingMessage="Loading rooms..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && (data?.length ?? 0) === 0}
      emptyTitle="No rooms"
      emptyDescription="Add a hostel room to get started."
      emptyAction={addAction}
      footer={
        <>
          <EntityFormDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            title={selected ? 'Edit room' : 'Add room'}
            onSubmit={handleSubmit(onSubmit)}
            isLoading={createMutation.isPending || updateMutation.isPending}
            submitLabel={selected ? 'Save' : 'Create'}
          >
            <FormErrorSummary errors={errors} />
            <FormTextField control={control} name="room_no" label="Room number" />
            <FormNumberField control={control} name="hostel_id" label="Hostel ID" optional />
            <FormNumberField control={control} name="room_type_id" label="Room type ID" optional />
            <FormNumberField control={control} name="no_of_bed" label="Beds" optional />
            <FormNumberField control={control} name="cost_per_bed" label="Cost per bed" optional />
            <FormTextField control={control} name="title" label="Title" optional />
            <FormTextareaField control={control} name="description" label="Description" optional />
          </EntityFormDialog>
          <ConfirmDialog
            open={deleteTarget !== null}
            onOpenChange={(open) => {
              if (!open) setDeleteTarget(null);
            }}
            title="Delete room"
            description={
              deleteTarget ? `Delete room "${deleteTarget.room_no}"? This cannot be undone.` : ''
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
