import { useState } from 'react';
import { Plus } from 'lucide-react';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { ClassSectionFormDialog } from '@features/academics/class-sections/components/ClassSectionFormDialog';
import { ClassSectionsTable } from '@features/academics/class-sections/components/ClassSectionsTable';
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
import { ModuleListPack } from '@workflow-packs';

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
    if (dialogMode === 'edit' && selectedClassSection) {
      updateMutation.mutate(
        {
          id: selectedClassSection.id,
          payload: { is_active: (values.is_active ? 'yes' : 'no') as ActiveFlag },
        },
        { onSuccess: closeFormDialog },
      );
      return;
    }
    createMutation.mutate(toPayload(values), { onSuccess: closeFormDialog });
  };

  const isFormLoading = createMutation.isPending || updateMutation.isPending;
  const canCreate =
    classes.some((c) => c.is_active === 'yes') && sections.some((s) => s.is_active === 'yes');

  const addClassSectionAction = (
    <PermissionButton
      permission="classes.create"
      onClick={() => setDialogMode('create')}
      className="gap-1"
      disabled={!canCreate}
      title={canCreate ? undefined : 'Create active classes and sections first'}
    >
      <Plus className="h-4 w-4" aria-hidden="true" />
      Add Class Section
    </PermissionButton>
  );

  return (
    <ModuleListPack
      title="Class Sections"
      description="Link classes with sections to define teachable groups (e.g. Class 1 — Section A)."
      actions={addClassSectionAction}
      prerequisiteHint={
        !canCreate && !isLoading ? (
          <p className="text-sm text-muted-foreground">
            Create active classes and sections first, then link them here.
          </p>
        ) : undefined
      }
      isLoading={isLoading}
      loadingMessage="Loading class sections..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && mappings?.length === 0}
      emptyTitle="No class sections configured"
      emptyDescription="Link a class with a section to enable student enrollment per group."
      emptyAction={canCreate ? addClassSectionAction : undefined}
      footer={
        <>
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
                ? `Delete "${deleteTarget.class_name} — ${deleteTarget.section_name}" permanently? This action cannot be undone.`
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
      <ClassSectionsTable
        classSections={mappings ?? []}
        pagination={{
          page,
          pageSize: 10,
          totalCount: count,
          onPageChange: setPage,
        }}
        onEdit={(classSection) => {
          setSelectedClassSection(classSection);
          setDialogMode('edit');
        }}
        onDelete={setDeleteTarget}
      />
    </ModuleListPack>
  );
}
