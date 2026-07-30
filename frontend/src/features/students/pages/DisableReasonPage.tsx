import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormTextField } from '@components/forms/fields';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { ModuleListPack } from '@workflow-packs';
import { apiClient } from '@services/api/client';

interface DisableReason {
  id: number;
  reason: string;
}

const schema = z.object({
  reason: z.string().trim().min(1, 'Reason is required'),
});
type FormValues = z.infer<typeof schema>;

export function DisableReasonPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<DisableReason | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DisableReason | null>(null);

  const { control, handleSubmit, reset, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { reason: '' },
  });

  // Fetch list
  const { data = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['students', 'disable-reasons'],
    queryFn: async () => {
      const { data } = await apiClient.get('/students/disable-reasons/');
      return data.data || [];
    },
  });

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: async (payload: FormValues) => {
      const { data } = await apiClient.post('/students/disable-reasons/', payload);
      return data.data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['students', 'disable-reasons'] });
      toast.success('Disable reason created');
      setOpen(false);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to create disable reason';
      toast.error(msg);
    },
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: FormValues }) => {
      const { data } = await apiClient.put(`/students/disable-reasons/${id}/`, payload);
      return data.data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['students', 'disable-reasons'] });
      toast.success('Disable reason updated');
      setOpen(false);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to update disable reason';
      toast.error(msg);
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/students/disable-reasons/${id}/`);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['students', 'disable-reasons'] });
      toast.success('Disable reason deleted');
      setDeleteTarget(null);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to delete disable reason';
      toast.error(msg);
    },
  });

  useEffect(() => {
    if (!open) return;
    reset(selected ? { reason: selected.reason } : { reason: '' });
  }, [open, selected, reset]);

  const filteredReasons = data.filter((item: DisableReason) =>
    item.reason.toLowerCase().includes(search.toLowerCase())
  );

  const addAction = (
    <PermissionButton
      permission="students.disable_reasons.create"
      onClick={() => {
        setSelected(null);
        setOpen(true);
      }}
      className="gap-1"
    >
      <Plus className="h-4 w-4" />
      Add Disable Reason
    </PermissionButton>
  );

  const columns: DataTableColumn<DisableReason>[] = [
    {
      id: 'reason',
      header: 'Disable Reason',
      cellClassName: 'font-medium',
      cell: (r) => r.reason,
    },
  ];

  return (
    <>
      <ModuleListPack
        title="Disable Reasons"
        description="Reasons for deactivating student accounts (e.g., Transfer, Dropout, Fee Default)."
        actions={addAction}
        isLoading={isLoading}
        loadingMessage="Loading disable reasons..."
        isError={isError}
        error={error}
        onRetry={() => void refetch()}
        isEmpty={!isLoading && !isError && data.length === 0}
        emptyTitle="No disable reasons"
        emptyDescription="Create reasons used during student disable action."
        emptyAction={addAction}
      >
        <DataTable
          data={filteredReasons}
          columns={columns}
          getRowKey={(r) => r.id}
          searchValue={search}
          onSearchChange={setSearch}
          actions={(row) => (
            <>
              <PermissionButton
                permission="students.disable_reasons.edit"
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
                permission="students.disable_reasons.delete"
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
        title={selected ? 'Edit Disable Reason' : 'Add Disable Reason'}
        onSubmit={handleSubmit((values) => {
          if (selected) {
            updateMutation.mutate({ id: selected.id, payload: values });
          } else {
            createMutation.mutate(values);
          }
        })}
        isLoading={createMutation.isPending || updateMutation.isPending}
      >
        <FormErrorSummary errors={formState.errors} />
        <FormTextField control={control} name="reason" label="Reason" required />
      </EntityFormDialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete Disable Reason?"
        description={`Are you sure you want to delete the reason "${deleteTarget?.reason || ''}"?`}
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (deleteTarget) {
            deleteMutation.mutate(deleteTarget.id);
          }
        }}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}
