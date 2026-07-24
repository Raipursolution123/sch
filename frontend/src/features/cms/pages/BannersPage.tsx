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
  useCmsBanners,
  useCreateCmsBanner,
  useDeleteCmsBanner,
  useUpdateCmsBanner,
} from '@hooks/useCms';
import type { CmsBanner } from '@app-types/cms';
import { ModuleListPack } from '@workflow-packs';

const schema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  feature_image: z.string().optional(),
  url: z.string().optional(),
  description: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

const columns: DataTableColumn<CmsBanner>[] = [
  { id: 'title', header: 'Banner', cellClassName: 'font-medium', cell: (r) => r.title },
  { id: 'url', header: 'URL', cell: (r) => r.url || '—' },
  { id: 'active', header: 'Active', cell: (r) => r.is_active || '—' },
];

export function BannersPage() {
  const { data = [], isLoading, isError, error, refetch } = useCmsBanners();
  const createMutation = useCreateCmsBanner();
  const updateMutation = useUpdateCmsBanner();
  const deleteMutation = useDeleteCmsBanner();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<CmsBanner | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CmsBanner | null>(null);
  const { control, handleSubmit, reset, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', feature_image: '', url: '', description: '' },
  });

  useEffect(() => {
    if (!open) return;
    reset(
      selected
        ? {
            title: selected.title,
            feature_image: selected.feature_image || '',
            url: selected.url || '',
            description: selected.description || '',
          }
        : { title: '', feature_image: '', url: '', description: '' },
    );
  }, [open, selected, reset]);

  const addAction = (
    <PermissionButton
      permission="cms.banners.create"
      onClick={() => {
        setSelected(null);
        setOpen(true);
      }}
      className="gap-1"
    >
      <Plus className="h-4 w-4" />
      Add Banner
    </PermissionButton>
  );

  return (
    <ModuleListPack
      title="Banners"
      description="Front CMS banner images (programs with type=banner)."
      actions={addAction}
      isLoading={isLoading}
      loadingMessage="Loading banners..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && data.length === 0}
      emptyTitle="No banners"
      emptyDescription="Create a banner for the homepage slider."
      emptyAction={addAction}
    >
      <DataTable
        data={data}
        columns={columns}
        getRowKey={(r) => r.id}
        actions={(row) => (
          <>
            <PermissionButton
              permission="cms.banners.edit"
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
              permission="cms.banners.delete"
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
        title={selected ? 'Edit Banner' : 'Add Banner'}
        onSubmit={handleSubmit((values) => {
          const payload = {
            title: values.title.trim(),
            feature_image: values.feature_image?.trim() || '',
            url: values.url?.trim() || '',
            description: values.description?.trim() || '',
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
        <FormTextField control={control} name="title" label="Title" required />
        <FormTextField control={control} name="feature_image" label="Image path / URL" />
        <FormTextField control={control} name="url" label="Link URL" />
        <FormTextareaField control={control} name="description" label="Description" />
      </EntityFormDialog>
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete banner?"
        description={`Remove “${deleteTarget?.title ?? ''}”.`}
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
