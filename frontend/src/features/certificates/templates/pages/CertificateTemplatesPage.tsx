import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { z } from 'zod';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormNumberField, FormTextField, FormTextareaField } from '@components/forms/fields';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { PermissionButton } from '@components/rbac/PermissionButton';
import {
  useCertificateTemplates,
  useCreateCertificateTemplate,
  useDeleteCertificateTemplate,
  useUpdateCertificateTemplate,
} from '@hooks/useCertificates';
import type { CertificateTemplate } from '@app-types/certificates';
import { ModuleListPack } from '@workflow-packs';

const schema = z.object({
  certificate_name: z.string().trim().min(1, 'Name is required'),
  certificate_text: z.string().trim().min(1, 'Body text is required'),
  left_header: z.string().optional(),
  center_header: z.string().optional(),
  right_header: z.string().optional(),
  left_footer: z.string().optional(),
  center_footer: z.string().optional(),
  right_footer: z.string().optional(),
  header_height: z.number().min(0),
  content_height: z.number().min(0),
  footer_height: z.number().min(0),
  content_width: z.number().min(100),
});
type FormValues = z.infer<typeof schema>;

const columns: DataTableColumn<CertificateTemplate>[] = [
  {
    id: 'name',
    header: 'Template',
    cellClassName: 'font-medium',
    cell: (r) => r.certificate_name,
  },
  {
    id: 'for',
    header: 'For',
    cell: (r) => (r.created_for === 1 ? 'Staff' : 'Students'),
  },
  {
    id: 'status',
    header: 'Status',
    cell: (r) => (r.status === 1 ? 'Active' : 'Inactive'),
  },
];

export function CertificateTemplatesPage() {
  const { data = [], isLoading, isError, error, refetch } = useCertificateTemplates();
  const createMutation = useCreateCertificateTemplate();
  const updateMutation = useUpdateCertificateTemplate();
  const deleteMutation = useDeleteCertificateTemplate();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<CertificateTemplate | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CertificateTemplate | null>(null);
  const { control, handleSubmit, reset, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      certificate_name: '',
      certificate_text:
        'This is to certify that [name], admission no. [admission_no], of class [class]-[section]…',
      left_header: '',
      center_header: '',
      right_header: '',
      left_footer: '',
      center_footer: '',
      right_footer: '',
      header_height: 100,
      content_height: 250,
      footer_height: 100,
      content_width: 800,
    },
  });

  useEffect(() => {
    if (!open) return;
    reset(
      selected
        ? {
            certificate_name: selected.certificate_name,
            certificate_text: selected.certificate_text,
            left_header: selected.left_header || '',
            center_header: selected.center_header || '',
            right_header: selected.right_header || '',
            left_footer: selected.left_footer || '',
            center_footer: selected.center_footer || '',
            right_footer: selected.right_footer || '',
            header_height: selected.header_height,
            content_height: selected.content_height,
            footer_height: selected.footer_height,
            content_width: selected.content_width,
          }
        : {
            certificate_name: '',
            certificate_text:
              'This is to certify that [name], admission no. [admission_no], of class [class]-[section]…',
            left_header: '',
            center_header: '',
            right_header: '',
            left_footer: '',
            center_footer: '',
            right_footer: '',
            header_height: 100,
            content_height: 250,
            footer_height: 100,
            content_width: 800,
          },
    );
  }, [open, selected, reset]);

  const addAction = (
    <PermissionButton
      permission="certificates.template.create"
      onClick={() => {
        setSelected(null);
        setOpen(true);
      }}
      className="gap-1"
    >
      <Plus className="h-4 w-4" />
      Add Template
    </PermissionButton>
  );

  return (
    <ModuleListPack
      title="Certificate Templates"
      description="HTML templates with merge tokens like [name], [admission_no], [class], [section]."
      actions={addAction}
      isLoading={isLoading}
      loadingMessage="Loading templates..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && data.length === 0}
      emptyTitle="No templates yet"
      emptyDescription="Create a student certificate template to start generating."
      emptyAction={addAction}
    >
      <DataTable
        data={data}
        columns={columns}
        getRowKey={(r) => r.id}
        actions={(row) => (
          <>
            <PermissionButton
              permission="certificates.template.edit"
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
              permission="certificates.template.delete"
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
        title={selected ? 'Edit Template' : 'Add Template'}
        size="lg"
        onSubmit={handleSubmit((values) => {
          const payload = {
            ...values,
            created_for: 2,
            status: 1,
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
        <FormTextField control={control} name="certificate_name" label="Name" required />
        <FormTextareaField
          control={control}
          name="certificate_text"
          label="Body (HTML allowed)"
          required
        />
        <FormTextField control={control} name="left_header" label="Left header" />
        <FormTextField control={control} name="center_header" label="Center header" />
        <FormTextField control={control} name="right_header" label="Right header" />
        <FormTextField control={control} name="left_footer" label="Left footer" />
        <FormTextField control={control} name="center_footer" label="Center footer" />
        <FormTextField control={control} name="right_footer" label="Right footer" />
        <FormNumberField control={control} name="header_height" label="Header height" />
        <FormNumberField control={control} name="content_height" label="Content height" />
        <FormNumberField control={control} name="footer_height" label="Footer height" />
        <FormNumberField control={control} name="content_width" label="Content width" />
      </EntityFormDialog>
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete template?"
        description={`Remove “${deleteTarget?.certificate_name ?? ''}”.`}
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
