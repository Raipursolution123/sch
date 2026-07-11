import { useState } from 'react';
import { Plus } from 'lucide-react';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { SectionFormDialog } from '@features/academics/sections/components/SectionFormDialog';
import { SectionsTable } from '@features/academics/sections/components/SectionsTable';
import type { SectionFormValues } from '@features/academics/sections/schemas/section.schema';
import {
  useCreateSection,
  useDeleteSection,
  useSections,
  useUpdateSection,
} from '@hooks/useSections';
import type { Section } from '@app-types/academics/section';
import type { ActiveFlag } from '@app-types/settings/session';
import { ModuleListPack } from '@workflow-packs';

type DialogMode = 'create' | 'edit' | null;

function toPayload(values: SectionFormValues) {
  return {
    section_name: values.section_name,
    is_active: (values.is_active ? 'yes' : 'no') as ActiveFlag,
  };
}

export function SectionsPage() {
  const [page, setPage] = useState(1);
  const { data: sectionsData, isLoading, isError, error, refetch } = useSections(page);
  const sections = sectionsData?.results;
  const count = sectionsData?.count || 0;

  const createMutation = useCreateSection();
  const updateMutation = useUpdateSection();
  const deleteMutation = useDeleteSection();

  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Section | null>(null);

  const closeFormDialog = () => {
    setDialogMode(null);
    setSelectedSection(null);
  };

  const handleFormSubmit = (values: SectionFormValues) => {
    const payload = toPayload(values);
    if (dialogMode === 'edit' && selectedSection) {
      updateMutation.mutate({ id: selectedSection.id, payload }, { onSuccess: closeFormDialog });
      return;
    }
    createMutation.mutate(payload, { onSuccess: closeFormDialog });
  };

  const isFormLoading = createMutation.isPending || updateMutation.isPending;

  const addSectionAction = (
    <PermissionButton
      permission="sections.create"
      onClick={() => setDialogMode('create')}
      className="gap-1"
    >
      <Plus className="h-4 w-4" aria-hidden="true" />
      Add Section
    </PermissionButton>
  );

  return (
    <ModuleListPack
      title="Sections"
      description="Manage section labels used to divide students within each class."
      actions={addSectionAction}
      isLoading={isLoading}
      loadingMessage="Loading sections..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && sections?.length === 0}
      emptyTitle="No sections configured"
      emptyDescription="Add your first section to enable class-section assignments."
      emptyAction={addSectionAction}
      footer={
        <>
          <SectionFormDialog
            open={dialogMode !== null}
            onOpenChange={(open) => {
              if (!open) closeFormDialog();
            }}
            section={dialogMode === 'edit' ? selectedSection : null}
            onSubmit={handleFormSubmit}
            isLoading={isFormLoading}
          />

          <ConfirmDialog
            open={Boolean(deleteTarget)}
            onOpenChange={(open) => {
              if (!open) setDeleteTarget(null);
            }}
            title="Delete section?"
            description={
              deleteTarget
                ? `Delete section "${deleteTarget.section_name}" permanently? This action cannot be undone.`
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
      <SectionsTable
        sections={sections ?? []}
        pagination={{
          page,
          pageSize: 10,
          totalCount: count,
          onPageChange: setPage,
        }}
        onEdit={(section) => {
          setSelectedSection(section);
          setDialogMode('edit');
        }}
        onDelete={setDeleteTarget}
      />
    </ModuleListPack>
  );
}
