import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { z } from 'zod';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormSelectField, FormTextField, FormTextareaField } from '@components/forms/fields';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { PermissionButton } from '@components/rbac/PermissionButton';
import {
  useCmsMedia,
  useCreateCmsMedia,
  useDeleteCmsMedia,
  useUpdateCmsMedia,
} from '@hooks/useCms';
import type { CmsMedia } from '@app-types/cms';
import { ModuleListPack } from '@workflow-packs';

const schema = z.object({
  img_name: z.string().trim().min(1, 'Name is required'),
  category: z.string().optional(),
  file_type: z.string().optional(),
  image: z.string().optional(),
  vid_url: z.string().optional(),
  vid_title: z.string().optional(),
  content_description: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

const columns: DataTableColumn<CmsMedia>[] = [
  {
    id: 'name',
    header: 'Name',
    cellClassName: 'font-medium',
    cell: (r) => r.img_name || r.vid_title || `Media #${r.id}`,
  },
  { id: 'category', header: 'Category', cell: (r) => r.category || '—' },
  { id: 'type', header: 'Type', cell: (r) => r.file_type || '—' },
];

export function MediaPage() {
  const { data = [], isLoading, isError, error, refetch } = useCmsMedia();
  const createMutation = useCreateCmsMedia();
  const updateMutation = useUpdateCmsMedia();
  const deleteMutation = useDeleteCmsMedia();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<CmsMedia | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CmsMedia | null>(null);
  const { control, handleSubmit, reset, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      img_name: '',
      category: 'media',
      file_type: 'image',
      image: '',
      vid_url: '',
      vid_title: '',
      content_description: '',
    },
  });

  useEffect(() => {
    if (!open) return;
    reset(
      selected
        ? {
            img_name: selected.img_name || '',
            category: selected.category || 'media',
            file_type: selected.file_type || 'image',
            image: selected.image || '',
            vid_url: selected.vid_url || '',
            vid_title: selected.vid_title || '',
            content_description: selected.content_description || '',
          }
        : {
            img_name: '',
            category: 'media',
            file_type: 'image',
            image: '',
            vid_url: '',
            vid_title: '',
            content_description: '',
          },
    );
  }, [open, selected, reset]);

  const addAction = (
    <PermissionButton
      permission="cms.media.create"
      onClick={() => {
        setSelected(null);
        setOpen(true);
      }}
      className="gap-1"
    >
      <Plus className="h-4 w-4" />
      Add Media
    </PermissionButton>
  );

  return (
    <ModuleListPack
      title="Media Manager"
      description="Manage front CMS media files and video links."
      actions={addAction}
      isLoading={isLoading}
      loadingMessage="Loading media..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && data.length === 0}
      emptyTitle="No media"
      emptyDescription="Upload or register media items for the website."
      emptyAction={addAction}
    >
      <DataTable
        data={data}
        columns={columns}
        getRowKey={(r) => r.id}
        actions={(row) => (
          <>
            <PermissionButton
              permission="cms.media.edit"
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
              permission="cms.media.delete"
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
        title={selected ? 'Edit Media' : 'Add Media'}
        onSubmit={handleSubmit((values) => {
          const payload = {
            img_name: values.img_name.trim(),
            category: values.category?.trim() || 'media',
            file_type: values.file_type?.trim() || 'image',
            image: values.image?.trim() || '',
            vid_url: values.vid_url?.trim() || '',
            vid_title: values.vid_title?.trim() || '',
            content_description: values.content_description?.trim() || '',
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
        <FormTextField control={control} name="category" label="Category" />
        <FormSelectField
          control={control}
          name="file_type"
          label="File type"
          options={[
            { value: 'image', label: 'Image' },
            { value: 'video', label: 'Video' },
            { value: 'file', label: 'File' },
          ]}
        />
        <FormTextField control={control} name="image" label="Image path / URL" />
        <FormTextField control={control} name="vid_title" label="Video title" />
        <FormTextField control={control} name="vid_url" label="Video URL" />
        <FormTextareaField control={control} name="content_description" label="Description" />
      </EntityFormDialog>
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete media?"
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
