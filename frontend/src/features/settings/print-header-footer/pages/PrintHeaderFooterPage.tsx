import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormTextField, FormTextareaField } from '@components/forms/fields';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { Button, Pagination } from '@components/ui';
import {
  useCreatePrintHeaderFooter,
  useDeletePrintHeaderFooter,
  usePrintHeaderFooter,
  useUpdatePrintHeaderFooter,
} from '@hooks/useSystemConfig';
import type { PrintHeaderFooter } from '@app-types/settings/system-config';
import { ModuleListPack } from '@workflow-packs';

const schema = z.object({
  print_type: z.string().trim().min(1, 'Print type is required').max(255),
  header_image: z.string().trim().min(1, 'Header image path is required').max(255),
  footer_content: z.string().trim(),
});

type FormValues = z.infer<typeof schema>;

const defaults: FormValues = {
  print_type: '',
  header_image: '',
  footer_content: '',
};

function toForm(row: PrintHeaderFooter): FormValues {
  return {
    print_type: row.print_type,
    header_image: row.header_image,
    footer_content: row.footer_content,
  };
}

export function PrintHeaderFooterPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error, refetch } = usePrintHeaderFooter(page);
  const rows = data?.results ?? [];
  const totalCount = data?.count ?? 0;
  const createMutation = useCreatePrintHeaderFooter();
  const updateMutation = useUpdatePrintHeaderFooter();
  const deleteMutation = useDeletePrintHeaderFooter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<PrintHeaderFooter | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PrintHeaderFooter | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: defaults });

  useEffect(() => {
    if (dialogOpen) reset(selected ? toForm(selected) : defaults);
  }, [dialogOpen, selected, reset]);

  const closeDialog = () => {
    setDialogOpen(false);
    setSelected(null);
  };

  const onSubmit = (values: FormValues) => {
    if (selected) {
      updateMutation.mutate({ id: selected.id, payload: values }, { onSuccess: closeDialog });
      return;
    }
    createMutation.mutate(values, { onSuccess: closeDialog });
  };

  const columns: DataTableColumn<PrintHeaderFooter>[] = [
    {
      id: 'type',
      header: 'Print type',
      cellClassName: 'font-medium',
      cell: (r) => r.print_type,
    },
    { id: 'header', header: 'Header image', cell: (r) => r.header_image },
    {
      id: 'footer',
      header: 'Footer',
      cell: (r) => (
        <span className="line-clamp-2 max-w-md text-muted-foreground">
          {r.footer_content || '—'}
        </span>
      ),
    },
  ];

  const addAction = (
    <PermissionButton
      permission="settings.manage"
      onClick={() => {
        setSelected(null);
        setDialogOpen(true);
      }}
      className="gap-1"
    >
      <Plus className="h-4 w-4" aria-hidden="true" />
      Add Print Layout
    </PermissionButton>
  );

  return (
    <ModuleListPack
      title="Print Header & Footer"
      description="Manage header image paths and footer content used on printable documents."
      actions={addAction}
      isLoading={isLoading}
      loadingMessage="Loading print layouts..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && rows.length === 0}
      emptyTitle="No print layouts"
      emptyDescription="Add header/footer layouts for receipts, certificates, and reports."
      emptyAction={addAction}
      footer={
        <>
          <EntityFormDialog
            open={dialogOpen}
            onOpenChange={(open) => {
              if (!open) closeDialog();
              else setDialogOpen(true);
            }}
            isEdit={Boolean(selected)}
            isLoading={createMutation.isPending || updateMutation.isPending}
            title={selected ? 'Edit Print Layout' : 'Add Print Layout'}
            description="Store the header image path and footer HTML/text for a print type."
            submitLabel={selected ? 'Save changes' : 'Create layout'}
            onSubmit={handleSubmit(onSubmit)}
            size="lg"
          >
            <FormErrorSummary errors={errors} />
            <FormTextField
              control={control}
              name="print_type"
              label="Print type"
              placeholder="receipt"
              required
            />
            <FormTextField
              control={control}
              name="header_image"
              label="Header image path"
              placeholder="uploads/print/header.png"
              required
            />
            <FormTextareaField
              control={control}
              name="footer_content"
              label="Footer content"
              rows={4}
            />
          </EntityFormDialog>

          <ConfirmDialog
            open={Boolean(deleteTarget)}
            onOpenChange={(open) => {
              if (!open) setDeleteTarget(null);
            }}
            title="Delete print layout?"
            description={deleteTarget ? `Permanently delete ${deleteTarget.print_type}?` : ''}
            confirmLabel="Delete"
            destructive
            onConfirm={() => {
              if (!deleteTarget) return;
              deleteMutation.mutate(deleteTarget.id, {
                onSuccess: () => setDeleteTarget(null),
              });
            }}
            isLoading={deleteMutation.isPending}
          />
        </>
      }
    >
      <div className="space-y-4">
        <DataTable
          data={rows}
          columns={columns}
          getRowKey={(row) => row.id}
          actions={(row) => (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelected(row);
                  setDialogOpen(true);
                }}
                aria-label={`Edit ${row.print_type}`}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeleteTarget(row)}
                aria-label={`Delete ${row.print_type}`}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        />
        <Pagination
          currentPage={page}
          totalPages={Math.max(1, Math.ceil(totalCount / 20))}
          onPageChange={setPage}
        />
      </div>
    </ModuleListPack>
  );
}
