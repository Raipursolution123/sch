import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormTextField, FormTextareaField } from '@components/forms/fields';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { communicationsService, type Template } from '@services/api/communications.service';
import { ModuleListPack } from '@workflow-packs';
import { formatDate } from '@utils/format';
import { toast } from 'sonner';

const schema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  message: z.string().trim().min(1, 'Message body is required'),
});

type FormValues = z.infer<typeof schema>;

export function EmailTemplatesPage() {
  const qc = useQueryClient();
  const {
    data = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['email-templates'],
    queryFn: communicationsService.getEmailTemplates,
  });

  const createMutation = useMutation({
    mutationFn: communicationsService.createEmailTemplate,
    onSuccess: () => {
      toast.success('Email template created successfully');
      void qc.invalidateQueries({ queryKey: ['email-templates'] });
      setDialogOpen(false);
    },
    onError: () => {
      toast.error('Failed to create email template');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: FormValues }) =>
      communicationsService.updateEmailTemplate(id, payload),
    onSuccess: () => {
      toast.success('Email template updated successfully');
      void qc.invalidateQueries({ queryKey: ['email-templates'] });
      setDialogOpen(false);
    },
    onError: () => {
      toast.error('Failed to update email template');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: communicationsService.deleteEmailTemplate,
    onSuccess: () => {
      toast.success('Email template deleted successfully');
      void qc.invalidateQueries({ queryKey: ['email-templates'] });
      setDeleteTarget(null);
    },
    onError: () => {
      toast.error('Failed to delete email template');
    },
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<Template | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Template | null>(null);

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
    },
  });

  const openCreate = () => {
    setSelected(null);
    reset({
      title: '',
      message: '',
    });
    setDialogOpen(true);
  };

  const openEdit = (tpl: Template) => {
    setSelected(tpl);
    reset({
      title: tpl.title,
      message: tpl.message,
    });
    setDialogOpen(true);
  };

  const onSubmit = (values: FormValues) => {
    if (selected) {
      updateMutation.mutate({ id: selected.id, payload: values });
      return;
    }
    createMutation.mutate(values);
  };

  const columns: DataTableColumn<Template>[] = [
    { id: 'title', header: 'Title', cellClassName: 'font-medium', cell: (r) => r.title },
    {
      id: 'message',
      header: 'Message Body',
      cellClassName: 'text-muted-foreground line-clamp-1',
      cell: (r) => r.message,
    },
    { id: 'created_at', header: 'Created At', cell: (r) => formatDate(r.created_at) },
  ];

  const addAction = (
    <PermissionButton permission="notifications.view" onClick={openCreate} className="gap-1">
      <Plus className="h-4 w-4" aria-hidden="true" />
      Add Email Template
    </PermissionButton>
  );

  return (
    <ModuleListPack
      title="Email Templates"
      description="Manage re-usable templates for composing emails."
      actions={addAction}
      isLoading={isLoading}
      loadingMessage="Loading email templates..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && data.length === 0}
      emptyTitle="No email templates"
      emptyDescription="Create an email template to use when composing messages."
      emptyAction={addAction}
      footer={
        <>
          <EntityFormDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            title={selected ? 'Edit email template' : 'Add email template'}
            onSubmit={handleSubmit(onSubmit)}
            isLoading={createMutation.isPending || updateMutation.isPending}
            submitLabel={selected ? 'Save' : 'Create'}
          >
            <FormErrorSummary errors={errors} />
            <FormTextField control={control} name="title" label="Title" />
            <FormTextareaField control={control} name="message" label="Message body" />
          </EntityFormDialog>
          <ConfirmDialog
            open={deleteTarget !== null}
            onOpenChange={(open) => {
              if (!open) setDeleteTarget(null);
            }}
            title="Delete email template"
            description={
              deleteTarget ? `Delete template "${deleteTarget.title}"? This cannot be undone.` : ''
            }
            confirmLabel="Delete"
            destructive
            isLoading={deleteMutation.isPending}
            onConfirm={() => {
              if (!deleteTarget) return;
              deleteMutation.mutate(deleteTarget.id);
            }}
          />
        </>
      }
    >
      <DataTable
        data={data}
        columns={columns}
        getRowKey={(row) => row.id}
        actions={(row) => (
          <>
            <PermissionButton
              permission="notifications.view"
              variant="ghost"
              size="sm"
              onClick={() => openEdit(row)}
            >
              <Pencil className="h-4 w-4" />
            </PermissionButton>
            <PermissionButton
              permission="notifications.view"
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
  );
}
