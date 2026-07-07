import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@components/ui/button';
import { PageHeader } from '@components/layout/PageHeader';
import { EmptyState } from '@components/feedback/EmptyState';
import { LoadingState } from '@components/feedback/LoadingState';
import { ErrorState } from '@components/feedback/ErrorState';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { SectionFormDialog } from '@features/academics/sections/components/SectionFormDialog';
import { SectionsTable } from '@features/academics/sections/components/SectionsTable';
import { Pagination } from '@components/ui/Pagination';
import type { SectionFormValues } from '@features/academics/sections/schemas/section.schema';
import {
  useCreateSection,
  useDeleteSection,
  useSections,
  useUpdateSection,
} from '@hooks/useSections';
import type { Section } from '@app-types/academics/section';
import type { ActiveFlag } from '@app-types/settings/session';

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
  const totalPages = Math.ceil(count / 10); // StandardResultsSetPagination PAGE_SIZE is 10

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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sections"
        description="Manage section labels used to divide students within each class."
        actions={
          <Button onClick={() => setDialogMode('create')} className="gap-1">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Section
          </Button>
        }
      />

      {isLoading && <LoadingState message="Loading sections..." />}

      {isError && (
        <ErrorState
          message={error instanceof Error ? error.message : 'Could not load sections'}
          onRetry={() => void refetch()}
        />
      )}

      {!isLoading && !isError && sections?.length === 0 && (
        <EmptyState
          title="No sections configured"
          description="Add your first section to enable class-section assignments."
          action={
            <Button onClick={() => setDialogMode('create')} className="gap-1">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add Section
            </Button>
          }
        />
      )}

      {!isLoading && !isError && sections && sections.length > 0 && (
        <div className="space-y-4">
          <SectionsTable
            sections={sections}
            onEdit={(section) => {
              setSelectedSection(section);
              setDialogMode('edit');
            }}
            onDelete={setDeleteTarget}
          />
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

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
            ? `Permanently delete section "${deleteTarget.section_name}"? This cannot be undone.`
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
    </div>
  );
}
