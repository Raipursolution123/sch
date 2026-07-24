import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { z } from 'zod';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormTextField, FormTextareaField } from '@components/forms/fields';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { PermissionButton } from '@components/rbac/PermissionButton';
import {
  useCmsGallery,
  useCreateCmsGallery,
  useDeleteCmsGallery,
  useUpdateCmsGallery,
} from '@hooks/useCms';
import type { CmsMedia } from '@app-types/cms';
import { ModuleListPack } from '@workflow-packs';

const schema = z.object({
  img_name: z.string().trim().min(1, 'Name is required'),
  image: z.string().optional(),
  content_description: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

const columns: DataTableColumn<CmsMedia>[] = [
  {
    id: 'name',
    header: 'Name',
    cellClassName: 'font-medium',
    cell: (r) => r.img_name || r.vid_title || `Item #${r.id}`,
  },
  { id: 'category', header: 'Category', cell: (r) => r.category || '—' },
  {
    id: 'desc',
    header: 'Description',
    cellClassName: 'text-muted-foreground',
    cell: (r) => r.content_description || '—',
  },
];

export function GalleryPage() {
  const { data = [], isLoading, isError, error, refetch } = useCmsGallery();
  const createMutation = useCreateCmsGallery();
  const updateMutation = useUpdateCmsGallery();
  const deleteMutation = useDeleteCmsGallery();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<CmsMedia | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CmsMedia | null>(null);
  const { control, handleSubmit, reset, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { img_name: '', image: '', content_description: '' },
  });

  useEffect(() => {
    if (!open) return;
    reset(
      selected
        ? {
            img_name: selected.img_name || '',
            image: selected.image || '',
            content_description: selected.content_description || '',
          }
        : { img_name: '', image: '', content_description: '' },
    );
  }, [open, selected, reset]);

  const addAction = (
    <PermissionButton
      permission="cms.gallery.create"
      onClick={() => {
        setSelected(null);
        setOpen(true);
      }}
      className="gap-1"
    >
      <Plus className="h-4 w-4" />
      Add Gallery Item
    </PermissionButton>
  );

  return (
    <ModuleListPack
      title="Gallery"
      description="Manage front CMS gallery media (category defaults to gallery)."
      actions={addAction}
      isLoading={isLoading}
      loadingMessage="Loading gallery..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && data.length === 0}
      emptyTitle="No gallery items"
      emptyDescription="Add images or media to the gallery."
      emptyAction={addAction}
    >
      <DataTable
        data={data}
        columns={columns}
        getRowKey={(r) => r.id}
        actions={(row) => (
          <>
            <PermissionButton
              permission="cms.gallery.edit"
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
              permission="cms.gallery.delete"
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
      <EntityFormDialog
        open={open}
        onOpenChange={setOpen}
        title={selected ? 'Edit Gallery Item' : 'Add Gallery Item'}
        onSubmit={handleSubmit((values) => {
          const payload = {
            img_name: values.img_name.trim(),
            image: values.image?.trim() || '',
            content_description: values.content_description?.trim() || '',
            category: 'gallery',
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
        <FormTextField control={control} name="img_name" label="Name" required />
        <FormTextField control={control} name="image" label="Image path / URL" />
        <FormTextareaField control={control} name="content_description" label="Description" />
      </EntityFormDialog>
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete gallery item?"
        description={`Remove “${deleteTarget?.img_name ?? deleteTarget?.id ?? ''}”.`}
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteMutation.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
        }}
        isLoading={deleteMutation.isPending}
      />
    </ModuleListPack>
  );
}
