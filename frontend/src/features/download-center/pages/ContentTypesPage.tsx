import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { z } from 'zod';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormSwitchField, FormTextField, FormTextareaField } from '@components/forms/fields';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { PermissionButton } from '@components/rbac/PermissionButton';
import {
  useContentTypes,
  useCreateContentType,
  useDeleteContentType,
  useUpdateContentType,
} from '@hooks/useDownloadCenter';
import type { ContentType } from '@app-types/download-center';
import { ModuleListPack } from '@workflow-packs';

const schema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  description: z.string().optional(),
  is_active: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

const columns: DataTableColumn<ContentType>[] = [
  { id: 'name', header: 'Name', cellClassName: 'font-medium', cell: (r) => r.name },
  {
    id: 'description',
    header: 'Description',
    cell: (r) => r.description || '—',
  },
  {
    id: 'status',
    header: 'Status',
    cell: (r) => (r.is_active === 1 ? 'Active' : 'Inactive'),
  },
];

export function ContentTypesPage() {
  const { data = [], isLoading, isError, error, refetch } = useContentTypes();
  const createMutation = useCreateContentType();
  const updateMutation = useUpdateContentType();
  const deleteMutation = useDeleteContentType();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<ContentType | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ContentType | null>(null);
  const { control, handleSubmit, reset, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', description: '', is_active: true },
  });

  useEffect(() => {
    if (!open) return;
    reset(
      selected
        ? {
            name: selected.name || '',
            description: selected.description || '',
            is_active: selected.is_active !== 0,
          }
        : { name: '', description: '', is_active: true },
    );
  }, [open, selected, reset]);

  const addAction = (
    <PermissionButton
      permission="downloadcenter.type.create"
      onClick={() => {
        setSelected(null);
        setOpen(true);
      }}
      className="gap-1"
    >
      <Plus className="h-4 w-4" />
      Add Type
    </PermissionButton>
  );

  return (
    <>
      <ModuleListPack
        title="Content Types"
        description="Categories for downloadable study materials."
        actions={addAction}
        isLoading={isLoading}
        loadingMessage="Loading content types..."
        isError={isError}
        error={error}
        onRetry={() => void refetch()}
        isEmpty={!isLoading && !isError && data.length === 0}
        emptyTitle="No content types"
        emptyDescription="Create a type such as Notes, Assignments, or Syllabus."
        emptyAction={addAction}
      >
        <DataTable
          data={data}
          columns={columns}
          getRowKey={(r) => r.id}
          actions={(row) => (
            <>
              <PermissionButton
                permission="downloadcenter.type.edit"
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
                permission="downloadcenter.type.delete"
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
        title={selected ? 'Edit Content Type' : 'Add Content Type'}
        onSubmit={handleSubmit((values) => {
          const payload = {
            name: values.name,
            description: values.description || '',
            is_active: values.is_active ? 1 : 0,
          };
          if (selected) {
            updateMutation.mutate(
              { id: selected.id, payload },
              { onSuccess: () => setOpen(false) },
            );
            return;
          }
          createMutation.mutate(payload, { onSuccess: () => setOpen(false) });
        })}
        isLoading={createMutation.isPending || updateMutation.isPending}
      >
        <FormErrorSummary errors={formState.errors} />
        <FormTextField control={control} name="name" label="Name" required />
        <FormTextareaField control={control} name="description" label="Description" />
        <FormSwitchField control={control} name="is_active" label="Active" />
      </EntityFormDialog>
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete content type?"
        description={`Remove “${deleteTarget?.name ?? ''}”.`}
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteMutation.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
        }}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}
