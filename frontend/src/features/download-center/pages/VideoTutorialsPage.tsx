import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { z } from 'zod';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormField } from '@components/forms/FormField';
import { FormTextField, FormTextareaField } from '@components/forms/fields';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { Checkbox } from '@components/ui/checkbox';
import {
  useCreateVideoTutorial,
  useDeleteVideoTutorial,
  useUpdateVideoTutorial,
  useVideoTutorials,
} from '@hooks/useDownloadCenter';
import { useClassSections } from '@hooks/useClassSections';
import type { VideoTutorial } from '@app-types/download-center';
import { ModuleListPack } from '@workflow-packs';

const schema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  description: z.string().trim().min(1, 'Description is required'),
  video_link: z.string().trim().min(1, 'Video link is required'),
  vid_title: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

const columns: DataTableColumn<VideoTutorial>[] = [
  { id: 'title', header: 'Title', cellClassName: 'font-medium', cell: (r) => r.title },
  {
    id: 'vid_title',
    header: 'Video title',
    cell: (r) => r.vid_title || '—',
  },
  {
    id: 'link',
    header: 'Link',
    cell: (r) => r.video_link,
  },
  {
    id: 'classes',
    header: 'Class sections',
    cell: (r) => (r.class_section_ids?.length ? String(r.class_section_ids.length) : '0'),
  },
];

export function VideoTutorialsPage() {
  const { data = [], isLoading, isError, error, refetch } = useVideoTutorials();
  const { data: classSectionsData } = useClassSections();
  const classSections = classSectionsData?.results || [];
  const createMutation = useCreateVideoTutorial();
  const updateMutation = useUpdateVideoTutorial();
  const deleteMutation = useDeleteVideoTutorial();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<VideoTutorial | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<VideoTutorial | null>(null);
  const [classSectionIds, setClassSectionIds] = useState<number[]>([]);
  const { control, handleSubmit, reset, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', description: '', video_link: '', vid_title: '' },
  });

  const activeClassSections = useMemo(
    () =>
      classSections
        .filter((cs) => cs.is_active === 'yes')
        .sort((a, b) =>
          `${a.class_name} ${a.section_name}`.localeCompare(`${b.class_name} ${b.section_name}`),
        ),
    [classSections],
  );

  useEffect(() => {
    if (!open) return;
    reset(
      selected
        ? {
            title: selected.title || '',
            description: selected.description || '',
            video_link: selected.video_link || '',
            vid_title: selected.vid_title || '',
          }
        : { title: '', description: '', video_link: '', vid_title: '' },
    );
    setClassSectionIds(selected?.class_section_ids ?? []);
  }, [open, selected, reset]);

  const addAction = (
    <PermissionButton
      permission="downloadcenter.video.create"
      onClick={() => {
        setSelected(null);
        setOpen(true);
      }}
      className="gap-1"
    >
      <Plus className="h-4 w-4" />
      Add Video
    </PermissionButton>
  );

  return (
    <>
      <ModuleListPack
        title="Video Tutorials"
        description="Share instructional videos with class sections."
        actions={addAction}
        isLoading={isLoading}
        loadingMessage="Loading video tutorials..."
        isError={isError}
        error={error}
        onRetry={() => void refetch()}
        isEmpty={!isLoading && !isError && data.length === 0}
        emptyTitle="No video tutorials"
        emptyDescription="Add a video link and assign it to class sections."
        emptyAction={addAction}
      >
        <DataTable
          data={data}
          columns={columns}
          getRowKey={(r) => r.id}
          actions={(row) => (
            <>
              <PermissionButton
                permission="downloadcenter.video.edit"
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
                permission="downloadcenter.video.delete"
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
        title={selected ? 'Edit Video Tutorial' : 'Add Video Tutorial'}
        scrollable
        onSubmit={handleSubmit((values) => {
          const payload = {
            title: values.title,
            description: values.description,
            video_link: values.video_link,
            vid_title: values.vid_title || '',
            class_section_ids: classSectionIds,
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
        <FormTextareaField control={control} name="description" label="Description" required />
        <FormTextField control={control} name="video_link" label="Video link" required />
        <FormTextField control={control} name="vid_title" label="Video title (optional)" />
        <FormField
          label="Class sections"
          hint="Select class–section combinations that can view this video."
        >
          {activeClassSections.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active class sections available.</p>
          ) : (
            <div className="max-h-48 space-y-2 overflow-y-auto rounded-md border p-3">
              {activeClassSections.map((cs) => {
                const checked = classSectionIds.includes(cs.id);
                return (
                  <label key={cs.id} className="flex cursor-pointer items-center gap-2 text-sm">
                    <Checkbox
                      checked={checked}
                      onChange={(e) =>
                        setClassSectionIds((prev) =>
                          e.target.checked
                            ? [...new Set([...prev, cs.id])]
                            : prev.filter((id) => id !== cs.id),
                        )
                      }
                    />
                    <span>
                      {cs.class_name} — {cs.section_name}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </FormField>
      </EntityFormDialog>
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete video tutorial?"
        description={`Remove “${deleteTarget?.title ?? ''}”.`}
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
