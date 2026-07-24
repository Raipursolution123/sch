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
  useCmsNotices,
  useCreateCmsNotice,
  useDeleteCmsNotice,
  useUpdateCmsNotice,
} from '@hooks/useCms';
import type { CmsPage } from '@app-types/cms';
import { ModuleListPack } from '@workflow-packs';

const schema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  description: z.string().optional(),
  slug: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

const columns: DataTableColumn<CmsPage>[] = [
  { id: 'title', header: 'Notice', cellClassName: 'font-medium', cell: (r) => r.title },
  { id: 'slug', header: 'Slug', cell: (r) => r.slug || '—' },
  { id: 'publish', header: 'Published', cell: (r) => (r.publish ? 'Yes' : 'No') },
];

export function NoticesPage() {
  const { data = [], isLoading, isError, error, refetch } = useCmsNotices();
  const createMutation = useCreateCmsNotice();
  const updateMutation = useUpdateCmsNotice();
  const deleteMutation = useDeleteCmsNotice();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<CmsPage | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CmsPage | null>(null);
  const { control, handleSubmit, reset, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', description: '', slug: '' },
  });

  useEffect(() => {
    if (!open) return;
    reset(
      selected
        ? {
            title: selected.title,
            description: selected.description || '',
            slug: selected.slug || '',
          }
        : { title: '', description: '', slug: '' },
    );
  }, [open, selected, reset]);

  const addAction = (
    <PermissionButton
      permission="cms.notice.create"
      onClick={() => {
        setSelected(null);
        setOpen(true);
      }}
      className="gap-1"
    >
      <Plus className="h-4 w-4" />
      Add Notice
    </PermissionButton>
  );

  return (
    <ModuleListPack
      title="Notices"
      description="Front CMS notices (pages with type=notice)."
      actions={addAction}
      isLoading={isLoading}
      loadingMessage="Loading notices..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && data.length === 0}
      emptyTitle="No notices"
      emptyDescription="Create a notice for the public website."
      emptyAction={addAction}
    >
      <DataTable
        data={data}
        columns={columns}
        getRowKey={(r) => r.id}
        actions={(row) => (
          <>
            <PermissionButton
              permission="cms.notice.edit"
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
              permission="cms.notice.delete"
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
        title={selected ? 'Edit Notice' : 'Add Notice'}
        onSubmit={handleSubmit((values) => {
          const payload = {
            title: values.title.trim(),
            description: values.description?.trim() || '',
            slug: values.slug?.trim() || undefined,
            type: 'notice',
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
        <FormTextareaField control={control} name="description" label="Description" />
      </EntityFormDialog>
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete notice?"
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
