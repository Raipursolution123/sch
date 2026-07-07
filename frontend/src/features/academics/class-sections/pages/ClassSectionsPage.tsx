import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@components/ui/button';
import { PageHeader } from '@components/layout/PageHeader';
import { EmptyState } from '@components/feedback/EmptyState';
import { LoadingState } from '@components/feedback/LoadingState';
import { ErrorState } from '@components/feedback/ErrorState';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { ClassSectionFormDialog } from '@features/academics/class-sections/components/ClassSectionFormDialog';
import { ClassSectionsTable } from '@features/academics/class-sections/components/ClassSectionsTable';
import { Pagination } from '@components/ui/Pagination';
import type { ClassSectionFormValues } from '@features/academics/class-sections/schemas/class-section.schema';
import {
  useClassSections,
  useCreateClassSection,
  useDeleteClassSection,
  useUpdateClassSection,
} from '@hooks/useClassSections';
import { useClasses } from '@hooks/useClasses';
import { useSections } from '@hooks/useSections';
import type { ClassSection } from '@app-types/academics/class-section';
import type { ActiveFlag } from '@app-types/settings/session';

type DialogMode = 'create' | 'edit' | null;

function toPayload(values: ClassSectionFormValues) {
  return {
    class_id: values.class_id,
    section_id: values.section_id,
    is_active: (values.is_active ? 'yes' : 'no') as ActiveFlag,
  };
}

export function ClassSectionsPage() {
  const [page, setPage] = useState(1);
  const { data: mappingsData, isLoading, isError, error, refetch } = useClassSections(page);
  const mappings = mappingsData?.results;
  const count = mappingsData?.count || 0;
  const totalPages = Math.ceil(count / 10); // StandardResultsSetPagination PAGE_SIZE is 10

  const { data: classesData } = useClasses();
  const classes = classesData?.results || [];

  const { data: sectionsData } = useSections();
  const sections = sectionsData?.results || [];
  const createMutation = useCreateClassSection();
  const updateMutation = useUpdateClassSection();
  const deleteMutation = useDeleteClassSection();

  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [selectedClassSection, setSelectedClassSection] = useState<ClassSection | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ClassSection | null>(null);

  const closeFormDialog = () => {
    setDialogMode(null);
    setSelectedClassSection(null);
  };

  const handleFormSubmit = (values: ClassSectionFormValues) => {
    const payload = toPayload(values);
    if (dialogMode === 'edit' && selectedClassSection) {
      updateMutation.mutate(
        { id: selectedClassSection.id, payload },
        { onSuccess: closeFormDialog },
      );
      return;
    }
    createMutation.mutate(payload, { onSuccess: closeFormDialog });
  };

  const isFormLoading = createMutation.isPending || updateMutation.isPending;
  const canCreate =
    classes.some((c) => c.is_active === 'yes') && sections.some((s) => s.is_active === 'yes');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Class Sections"
        description="Link classes with sections to define teachable groups (e.g. Class 1 — Section A)."
        actions={
          <Button onClick={() => setDialogMode('create')} className="gap-1" disabled={!canCreate}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Class Section
          </Button>
        }
      />

      {!canCreate && !isLoading && (
        <p className="text-sm text-muted-foreground">
          Create active classes and sections first, then link them here.
        </p>
      )}

      {isLoading && <LoadingState message="Loading class sections..." />}

      {isError && (
        <ErrorState
          message={error instanceof Error ? error.message : 'Could not load class sections'}
          onRetry={() => void refetch()}
        />
      )}

      {!isLoading && !isError && mappings?.length === 0 && (
        <EmptyState
          title="No class sections configured"
          description="Link a class with a section to enable student enrollment per group."
          action={
            canCreate ? (
              <Button onClick={() => setDialogMode('create')} className="gap-1">
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add Class Section
              </Button>
            ) : undefined
          }
        />
      )}

      {!isLoading && !isError && mappings && mappings.length > 0 && (
        <div className="space-y-4">
          <ClassSectionsTable
            classSections={mappings}
            onEdit={(classSection) => {
              setSelectedClassSection(classSection);
              setDialogMode('edit');
            }}
            onDelete={setDeleteTarget}
          />
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      <ClassSectionFormDialog
        open={dialogMode !== null}
        onOpenChange={(open) => {
          if (!open) closeFormDialog();
        }}
        classSection={dialogMode === 'edit' ? selectedClassSection : null}
        classes={classes}
        sections={sections}
        onSubmit={handleFormSubmit}
        isLoading={isFormLoading}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete class section?"
        description={
          deleteTarget
            ? `Permanently delete "${deleteTarget.class_name} — ${deleteTarget.section_name}"? This cannot be undone.`
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
