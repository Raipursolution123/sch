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
import { useCmsPages, useCreateCmsPage, useDeleteCmsPage, useUpdateCmsPage } from '@hooks/useCms';
import type { CmsPage } from '@app-types/cms';
import { ModuleListPack } from '@workflow-packs';

const schema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  slug: z.string().optional(),
  description: z.string().optional(),
  url: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

const columns: DataTableColumn<CmsPage>[] = [
  { id: 'title', header: 'Page', cellClassName: 'font-medium', cell: (r) => r.title },
  { id: 'slug', header: 'Slug', cell: (r) => r.slug || '—' },
  { id: 'type', header: 'Type', cell: (r) => r.type || '—' },
  { id: 'active', header: 'Active', cell: (r) => r.is_active || '—' },
];

export function PagesPage() {
  const { data = [], isLoading, isError, error, refetch } = useCmsPages();
  const createMutation = useCreateCmsPage();
  const updateMutation = useUpdateCmsPage();
  const deleteMutation = useDeleteCmsPage();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<CmsPage | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CmsPage | null>(null);
  const { control, handleSubmit, reset, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', slug: '', description: '', url: '' },
  });

  useEffect(() => {
    if (!open) return;
    reset(
      selected
        ? {
            title: selected.title,
            slug: selected.slug || '',
            description: selected.description || '',
            url: selected.url || '',
          }
        : { title: '', slug: '', description: '', url: '' },
    );
  }, [open, selected, reset]);

  const addAction = (
    <PermissionButton
      permission="cms.pages.create"
      onClick={() => {
        setSelected(null);
        setOpen(true);
      }}
      className="gap-1"
    >
      <Plus className="h-4 w-4" />
      Add Page
    </PermissionButton>
  );

  return (
    <ModuleListPack
      title="Pages"
      description="Manage front CMS content pages."
      actions={addAction}
      isLoading={isLoading}
      loadingMessage="Loading pages..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && data.length === 0}
      emptyTitle="No pages"
      emptyDescription="Create a content page for the website."
      emptyAction={addAction}
    >
      <DataTable
        data={data}
        columns={columns}
        getRowKey={(r) => r.id}
        actions={(row) => (
          <>
            <PermissionButton
              permission="cms.pages.edit"
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
              permission="cms.pages.delete"
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
        title={selected ? 'Edit Page' : 'Add Page'}
        onSubmit={handleSubmit((values) => {
          const payload = {
            title: values.title.trim(),
            slug: values.slug?.trim() || undefined,
            description: values.description?.trim() || '',
            url: values.url?.trim() || '',
            type: 'page',
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
        <FormTextField control={control} name="slug" label="Slug" />
        <FormTextField control={control} name="url" label="URL" />
        <FormTextareaField control={control} name="description" label="Description" />
      </EntityFormDialog>
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete page?"
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
