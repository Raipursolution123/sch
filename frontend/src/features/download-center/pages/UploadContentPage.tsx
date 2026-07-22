import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2 } from 'lucide-react';
import { z } from 'zod';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormSelectField, FormTextField } from '@components/forms/fields';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { PermissionButton } from '@components/rbac/PermissionButton';
import {
  useContentTypes,
  useCreateUploadContent,
  useDeleteUploadContent,
  useUploadContents,
} from '@hooks/useDownloadCenter';
import type { UploadContent } from '@app-types/download-center';
import { ModuleListPack } from '@workflow-packs';

const schema = z.object({
  content_type_id: z.string().min(1, 'Content type is required'),
  real_name: z.string().trim().min(1, 'File / display name is required'),
  dir_path: z.string().optional(),
  file_type: z.string().optional(),
  mime_type: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export function UploadContentPage() {
  const { data = [], isLoading, isError, error, refetch } = useUploadContents();
  const { data: types = [] } = useContentTypes();
  const createMutation = useCreateUploadContent();
  const deleteMutation = useDeleteUploadContent();
  const [open, setOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<UploadContent | null>(null);
  const { control, handleSubmit, reset, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      content_type_id: '',
      real_name: '',
      dir_path: '',
      file_type: 'file',
      mime_type: 'application/octet-stream',
    },
  });

  const typeLabel = useMemo(() => {
    const map = new Map(types.map((t) => [t.id, t.name]));
    return (id: number) => map.get(id) || String(id);
  }, [types]);

  const typeOptions = useMemo(
    () => types.map((t) => ({ value: String(t.id), label: t.name })),
    [types],
  );

  const columns: DataTableColumn<UploadContent>[] = useMemo(
    () => [
      {
        id: 'name',
        header: 'Name',
        cellClassName: 'font-medium',
        cell: (r) => r.real_name,
      },
      {
        id: 'type',
        header: 'Type',
        cell: (r) => typeLabel(r.content_type_id),
      },
      {
        id: 'path',
        header: 'Path / URL',
        cell: (r) => r.dir_path || r.vid_url || '—',
      },
      {
        id: 'file_type',
        header: 'File type',
        cell: (r) => r.file_type,
      },
    ],
    [typeLabel],
  );

  useEffect(() => {
    if (!open) return;
    reset({
      content_type_id: typeOptions[0]?.value || '',
      real_name: '',
      dir_path: '',
      file_type: 'file',
      mime_type: 'application/octet-stream',
    });
  }, [open, reset, typeOptions]);

  const addAction = (
    <PermissionButton
      permission="downloadcenter.content.create"
      onClick={() => setOpen(true)}
      className="gap-1"
    >
      <Plus className="h-4 w-4" />
      Add Content
    </PermissionButton>
  );

  return (
    <ModuleListPack
      title="Upload Content"
      description="Register downloadable files by path or URL (binary upload can follow later)."
      actions={addAction}
      isLoading={isLoading}
      loadingMessage="Loading content..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && data.length === 0}
      emptyTitle="No uploaded content"
      emptyDescription="Add a file path or link under a content type."
      emptyAction={addAction}
    >
      <DataTable
        data={data}
        columns={columns}
        getRowKey={(r) => r.id}
        actions={(row) => (
          <PermissionButton
            permission="downloadcenter.content.delete"
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => setDeleteTarget(row)}
          >
            <Trash2 className="h-4 w-4" />
          </PermissionButton>
        )}
      />
      <EntityFormDialog
        open={open}
        onOpenChange={setOpen}
        title="Add Content"
        onSubmit={handleSubmit((values) => {
          createMutation.mutate(
            {
              content_type_id: Number(values.content_type_id),
              real_name: values.real_name,
              dir_path: values.dir_path || '',
              file_type: values.file_type || 'file',
              mime_type: values.mime_type || 'application/octet-stream',
            },
            { onSuccess: () => setOpen(false) },
          );
        })}
        isLoading={createMutation.isPending}
      >
        <FormErrorSummary errors={formState.errors} />
        <FormSelectField
          control={control}
          name="content_type_id"
          label="Content type"
          options={typeOptions}
          required
        />
        <FormTextField control={control} name="real_name" label="Display name" required />
        <FormTextField control={control} name="dir_path" label="File path or URL" />
        <FormTextField control={control} name="file_type" label="File type" />
        <FormTextField control={control} name="mime_type" label="MIME type" />
      </EntityFormDialog>
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete content?"
        description={`Remove “${deleteTarget?.real_name ?? ''}”.`}
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
