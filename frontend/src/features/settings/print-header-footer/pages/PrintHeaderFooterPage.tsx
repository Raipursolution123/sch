import { useState } from 'react';
import { Plus } from 'lucide-react';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { PrintHeaderFooterTable } from '../components/PrintHeaderFooterTable';
import { PrintHeaderFooterFormDialog } from '../components/PrintHeaderFooterFormDialog';
import {
  usePrintHeaderFooterList,
  useCreatePrintHeaderFooter,
  useUpdatePrintHeaderFooter,
  useDeletePrintHeaderFooter,
} from '@/hooks/usePrintHeaderFooter';
import type { PrintHeaderFooter } from '@/types/settings/print-header-footer';
import { ModuleListPack } from '@workflow-packs';

type DialogMode = 'create' | 'edit' | null;

export function PrintHeaderFooterPage() {
  const { data: templates, isLoading, isError, error, refetch } = usePrintHeaderFooterList();
  const createMutation = useCreatePrintHeaderFooter();
  const updateMutation = useUpdatePrintHeaderFooter();
  const deleteMutation = useDeletePrintHeaderFooter();

  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<PrintHeaderFooter | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PrintHeaderFooter | null>(null);

  const closeFormDialog = () => {
    setDialogMode(null);
    setSelectedTemplate(null);
  };

  const handleFormSubmit = (values: { print_type: string; header_image: string; footer_content: string }) => {
    if (dialogMode === 'edit' && selectedTemplate) {
      updateMutation.mutate(
        { id: selectedTemplate.id, data: values },
        { onSuccess: closeFormDialog },
      );
      return;
    }
    createMutation.mutate(values, { onSuccess: closeFormDialog });
  };

  const isFormLoading = createMutation.isPending || updateMutation.isPending;

  const addTemplateAction = (
    <PermissionButton
      permission="settings.manage"
      onClick={() => setDialogMode('create')}
      className="gap-1"
    >
      <Plus className="h-4 w-4" aria-hidden="true" />
      Add Template
    </PermissionButton>
  );

  return (
    <ModuleListPack
      title="Print Header/Footer Settings"
      description="Configure branding headers and footers for system prints (Receipts, Payslips, etc.)."
      actions={addTemplateAction}
      isLoading={isLoading}
      loadingMessage="Loading print templates..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && templates?.length === 0}
      emptyTitle="No templates configured"
      emptyDescription="Create your first print template with a branding header banner and footer."
      emptyAction={addTemplateAction}
      footer={
        <>
          <PrintHeaderFooterFormDialog
            open={dialogMode !== null}
            onOpenChange={(open) => {
              if (!open) closeFormDialog();
            }}
            template={dialogMode === 'edit' ? selectedTemplate : null}
            onSubmit={handleFormSubmit}
            isLoading={isFormLoading}
          />

          <ConfirmDialog
            open={Boolean(deleteTarget)}
            onOpenChange={(open) => {
              if (!open) setDeleteTarget(null);
            }}
            title="Delete print template?"
            description={
              deleteTarget
                ? `Permanently delete the print template "${deleteTarget.print_type}"? This cannot be undone.`
                : ''
            }
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
      <PrintHeaderFooterTable
        templates={templates ?? []}
        onEdit={(template) => {
          setSelectedTemplate(template);
          setDialogMode('edit');
        }}
        onDelete={setDeleteTarget}
      />
    </ModuleListPack>
  );
}
export default PrintHeaderFooterPage;
