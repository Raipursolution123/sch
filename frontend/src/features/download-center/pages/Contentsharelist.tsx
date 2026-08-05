import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2 } from 'lucide-react';
import { z } from 'zod';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormSelectField, FormTextField, FormTextareaField } from '@components/forms/fields';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { Checkbox } from '@components/ui/checkbox';
import {
  useShareContents,
  useCreateShareContent,
  useDeleteShareContent,
  useUploadContents,
} from '@hooks/useDownloadCenter';
import { useClassSections } from '@hooks/useClassSections';
import type { ShareContent } from '@app-types/download-center';
import { ModuleListPack } from '@workflow-packs';

const schema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  description: z.string().trim().optional(),
  send_to: z.enum(['group', 'class']),
  share_date: z.string().min(1, 'Share date is required'),
  valid_upto: z.string().optional().nullable(),
  group_id: z.string().optional().nullable(),
});
type FormValues = z.infer<typeof schema>;

export default function ContentShareList() {
  const { data: sharesData, isLoading, isError, error, refetch } = useShareContents();
  const shares = useMemo(() => sharesData || [], [sharesData]);
  const { data: uploadsData } = useUploadContents();
  const uploads = useMemo(() => uploadsData || [], [uploadsData]);
  const { data: classSectionsData } = useClassSections();
  const classSections = useMemo(() => classSectionsData?.results || [], [classSectionsData]);

  const createMutation = useCreateShareContent();
  const deleteMutation = useDeleteShareContent();

  const [open, setOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ShareContent | null>(null);
  const [selectedUploadIds, setSelectedUploadIds] = useState<number[]>([]);
  const [selectedClassSectionIds, setSelectedClassSectionIds] = useState<number[]>([]);

  const { control, handleSubmit, reset, watch, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      send_to: 'group',
      share_date: new Date().toISOString().split('T')[0],
      valid_upto: '',
      group_id: 'student',
    },
  });

  const sendToValue = watch('send_to');

  useEffect(() => {
    if (!open) return;
    reset({
      title: '',
      description: '',
      send_to: 'group',
      share_date: new Date().toISOString().split('T')[0],
      valid_upto: '',
      group_id: 'student',
    });
    setSelectedUploadIds([]);
    setSelectedClassSectionIds([]);
  }, [open, reset]);

  const activeClassSections = useMemo(
    () =>
      classSections
        .filter((cs) => cs.is_active === 'yes')
        .sort((a, b) =>
          `${a.class_name} ${a.section_name}`.localeCompare(`${b.class_name} ${b.section_name}`),
        ),
    [classSections],
  );

  const uploadMap = useMemo(() => new Map(uploads.map((u) => [u.id, u.real_name])), [uploads]);
  const classSectionMap = useMemo(
    () => new Map(classSections.map((cs) => [cs.id, `${cs.class_name} (${cs.section_name})`])),
    [classSections],
  );

  const columns: DataTableColumn<ShareContent>[] = useMemo(
    () => [
      {
        id: 'title',
        header: 'Title',
        cellClassName: 'font-medium',
        cell: (r) => r.title,
      },
      {
        id: 'description',
        header: 'Description',
        cell: (r) => r.description || '—',
      },
      {
        id: 'send_to',
        header: 'Shared With',
        cell: (r) => {
          if (r.send_to === 'group') {
            return `Group: ${r.group_id || '—'}`;
          }
          if (r.send_to === 'class') {
            const classNames = r.class_section_ids
              .map((id) => classSectionMap.get(id) || String(id))
              .join(', ');
            return `Class: ${classNames || '—'}`;
          }
          return r.send_to;
        },
      },
      {
        id: 'files',
        header: 'Shared Files',
        cell: (r) => {
          const fileNames = r.upload_content_ids
            .map((id) => uploadMap.get(id) || String(id))
            .join(', ');
          return fileNames || '—';
        },
      },
      {
        id: 'share_date',
        header: 'Share Date',
        cell: (r) => r.share_date || '—',
      },
      {
        id: 'valid_upto',
        header: 'Expiry Date',
        cell: (r) => r.valid_upto || '—',
      },
    ],
    [classSectionMap, uploadMap],
  );

  const onFormSubmit = async (values: FormValues) => {
    await createMutation.mutateAsync({
      ...values,
      upload_content_ids: selectedUploadIds,
      class_section_ids: values.send_to === 'class' ? selectedClassSectionIds : [],
      group_id: values.send_to === 'group' ? values.group_id : null,
    });
    setOpen(false);
  };

  const addAction = (
    <PermissionButton
      permission="downloadcenter.share.create"
      onClick={() => setOpen(true)}
      className="gap-1"
    >
      <Plus className="h-4 w-4" /> Share Content
    </PermissionButton>
  );

  return (
    <>
      <ModuleListPack
        title="Shared Content"
        description="List and manage shared contents with groups or classes."
        actions={addAction}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={() => void refetch()}
        isEmpty={!isLoading && !isError && shares.length === 0}
        emptyTitle="No shared content"
        emptyDescription="Create a shared entry to share content with students, parents or staff."
        emptyAction={addAction}
      >
        <DataTable
          columns={columns}
          data={shares}
          getRowKey={(r) => r.id}
          actions={(row) => (
            <div className="flex items-center gap-2">
              <PermissionButton
                permission="downloadcenter.share.delete"
                variant="ghost"
                size="icon"
                onClick={() => setDeleteTarget(row)}
                className="text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </PermissionButton>
            </div>
          )}
        />
      </ModuleListPack>

      <EntityFormDialog
        title="Share Content"
        open={open}
        onOpenChange={setOpen}
        onSubmit={handleSubmit(onFormSubmit)}
        isLoading={createMutation.isPending}
      >
        <FormErrorSummary errors={formState.errors} />
        <div className="space-y-4">
          <FormTextField
            control={control}
            name="title"
            label="Title *"
            placeholder="e.g. Syllabus Guide"
          />
          <FormTextareaField
            control={control}
            name="description"
            label="Description / Remarks"
            placeholder="Provide comments or details about shared content"
          />

          <div className="grid grid-cols-2 gap-4">
            <FormTextField control={control} name="share_date" label="Share Date *" type="date" />
            <FormTextField control={control} name="valid_upto" label="Expiry Date" type="date" />
          </div>

          <FormSelectField
            control={control}
            name="send_to"
            label="Send To *"
            options={[
              { value: 'group', label: 'Group' },
              { value: 'class', label: 'Class' },
            ]}
          />

          {sendToValue === 'group' && (
            <FormSelectField
              control={control}
              name="group_id"
              label="Group / Role *"
              options={[
                { value: 'student', label: 'Student' },
                { value: 'parent', label: 'Parent' },
                { value: 'staff', label: 'Staff' },
              ]}
            />
          )}

          {sendToValue === 'class' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Select Class Sections *</label>
              <div className="max-h-40 space-y-2 overflow-y-auto rounded-md border bg-background p-3">
                {activeClassSections.map((cs) => (
                  <div key={cs.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`class-sec-${cs.id}`}
                      checked={selectedClassSectionIds.includes(cs.id)}
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        if (isChecked) {
                          setSelectedClassSectionIds((prev) => [...prev, cs.id]);
                        } else {
                          setSelectedClassSectionIds((prev) => prev.filter((id) => id !== cs.id));
                        }
                      }}
                    />
                    <label
                      htmlFor={`class-sec-${cs.id}`}
                      className="cursor-pointer select-none text-sm"
                    >
                      {cs.class_name} - {cs.section_name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Select Files to Share</label>
            <div className="max-h-40 space-y-2 overflow-y-auto rounded-md border bg-background p-3">
              {uploads.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No files available to select. Please upload files in Upload Content first.
                </p>
              ) : (
                uploads.map((u) => (
                  <div key={u.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`upload-${u.id}`}
                      checked={selectedUploadIds.includes(u.id)}
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        if (isChecked) {
                          setSelectedUploadIds((prev) => [...prev, u.id]);
                        } else {
                          setSelectedUploadIds((prev) => prev.filter((id) => id !== u.id));
                        }
                      }}
                    />
                    <label
                      htmlFor={`upload-${u.id}`}
                      className="cursor-pointer select-none text-sm"
                    >
                      {u.real_name} ({u.file_type})
                    </label>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </EntityFormDialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Remove Shared Content?"
        description={`Are you sure you want to remove the share for "${deleteTarget?.title}"? This cannot be undone.`}
        onConfirm={async () => {
          if (deleteTarget) {
            await deleteMutation.mutateAsync(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}
