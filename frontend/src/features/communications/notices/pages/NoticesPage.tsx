import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormSwitchField, FormTextField, FormTextareaField } from '@components/forms/fields';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { StatusBadge } from '@components/feedback/StatusBadge';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { useCreateNotice, useDeleteNotice, useNotices, useUpdateNotice } from '@hooks/useNotices';
import type { Notice } from '@app-types/communications/notice';
import { ModuleListPack } from '@workflow-packs';

const schema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  message: z.string().optional(),
  publish_date: z.string().optional(),
  visible_student: z.boolean(),
  visible_staff: z.boolean(),
  visible_parent: z.boolean(),
  is_active: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

const columns: DataTableColumn<Notice>[] = [
  { id: 'title', header: 'Title', cellClassName: 'font-medium', cell: (r) => r.title ?? '—' },
  {
    id: 'publish_date',
    header: 'Publish date',
    cell: (r) => r.publish_date ?? '—',
  },
  {
    id: 'audience',
    header: 'Visible to',
    cell: (r) =>
      [
        r.visible_student === 'yes' ? 'Students' : null,
        r.visible_staff === 'yes' ? 'Staff' : null,
        r.visible_parent === 'yes' ? 'Parents' : null,
      ]
        .filter(Boolean)
        .join(', ') || '—',
  },
  {
    id: 'status',
    header: 'Status',
    cell: (r) => <StatusBadge isActive={r.is_active === 'yes' ? 'yes' : 'no'} />,
  },
];

export function NoticesPage() {
  const { data, isLoading, isError, error, refetch } = useNotices();
  const createMutation = useCreateNotice();
  const updateMutation = useUpdateNotice();
  const deleteMutation = useDeleteNotice();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<Notice | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Notice | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      message: '',
      publish_date: '',
      visible_student: true,
      visible_staff: true,
      visible_parent: false,
      is_active: true,
    },
  });

  const openCreate = () => {
    setSelected(null);
    reset({
      title: '',
      message: '',
      publish_date: '',
      visible_student: true,
      visible_staff: true,
      visible_parent: false,
      is_active: true,
    });
    setDialogOpen(true);
  };

  const openEdit = (notice: Notice) => {
    setSelected(notice);
    reset({
      title: notice.title ?? '',
      message: notice.message ?? '',
      publish_date: notice.publish_date ?? '',
      visible_student: notice.visible_student === 'yes',
      visible_staff: notice.visible_staff === 'yes',
      visible_parent: notice.visible_parent === 'yes',
      is_active: notice.is_active === 'yes',
    });
    setDialogOpen(true);
  };

  const onSubmit = (values: FormValues) => {
    const payload = {
      title: values.title,
      message: values.message || null,
      publish_date: values.publish_date || null,
      visible_student: values.visible_student,
      visible_staff: values.visible_staff,
      visible_parent: values.visible_parent,
      is_active: values.is_active,
    };
    if (selected) {
      updateMutation.mutate(
        { id: selected.id, payload },
        { onSuccess: () => setDialogOpen(false) },
      );
      return;
    }
    createMutation.mutate(payload, { onSuccess: () => setDialogOpen(false) });
  };

  const addAction = (
    <PermissionButton permission="notifications.view" onClick={openCreate} className="gap-1">
      <Plus className="h-4 w-4" aria-hidden="true" />
      Add Notice
    </PermissionButton>
  );

  return (
    <ModuleListPack
      title="Notice Board"
      description="Publish notices for students, staff, and parents."
      actions={addAction}
      isLoading={isLoading}
      loadingMessage="Loading notices..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && (data?.length ?? 0) === 0}
      emptyTitle="No notices"
      emptyDescription="Create a notice to communicate with the school community."
      emptyAction={addAction}
      footer={
        <>
          <EntityFormDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            title={selected ? 'Edit notice' : 'Add notice'}
            onSubmit={handleSubmit(onSubmit)}
            isLoading={createMutation.isPending || updateMutation.isPending}
            submitLabel={selected ? 'Save' : 'Create'}
          >
            <FormErrorSummary errors={errors} />
            <FormTextField control={control} name="title" label="Title" />
            <FormTextField
              control={control}
              name="publish_date"
              label="Publish date (YYYY-MM-DD)"
              optional
            />
            <FormTextareaField control={control} name="message" label="Message" optional />
            <FormSwitchField control={control} name="visible_student" label="Visible to students" />
            <FormSwitchField control={control} name="visible_staff" label="Visible to staff" />
            <FormSwitchField control={control} name="visible_parent" label="Visible to parents" />
            <FormSwitchField control={control} name="is_active" label="Active" />
          </EntityFormDialog>
          <ConfirmDialog
            open={deleteTarget !== null}
            onOpenChange={(open) => {
              if (!open) setDeleteTarget(null);
            }}
            title="Delete notice"
            description={
              deleteTarget ? `Delete "${deleteTarget.title}"? This cannot be undone.` : ''
            }
            confirmLabel="Delete"
            destructive
            isLoading={deleteMutation.isPending}
            onConfirm={() => {
              if (!deleteTarget) return;
              deleteMutation.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
            }}
          />
        </>
      }
    >
      <DataTable
        data={data ?? []}
        columns={columns}
        getRowKey={(row) => row.id}
        actions={(row) => (
          <>
            <PermissionButton
              permission="notifications.view"
              variant="ghost"
              size="sm"
              onClick={() => openEdit(row)}
              aria-label="Edit"
            >
              <Pencil className="h-4 w-4" />
            </PermissionButton>
            <PermissionButton
              permission="notifications.view"
              variant="ghost"
              size="sm"
              onClick={() => setDeleteTarget(row)}
              aria-label="Delete"
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </PermissionButton>
          </>
        )}
      />
    </ModuleListPack>
  );
}
