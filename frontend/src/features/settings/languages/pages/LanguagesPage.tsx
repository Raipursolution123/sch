import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@components/ui/button';
import { PageHeader } from '@components/layout/PageHeader';
import { EmptyState } from '@components/feedback/EmptyState';
import { LoadingState } from '@components/feedback/LoadingState';
import { ErrorState } from '@components/feedback/ErrorState';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { LanguageFormDialog } from '@features/settings/languages/components/LanguageFormDialog';
import { LanguagesTable } from '@features/settings/languages/components/LanguagesTable';
import type { LanguageFormValues } from '@features/settings/languages/schemas/language.schema';
import {
  useCreateLanguage,
  useDeleteLanguage,
  useLanguages,
  useUpdateLanguage,
} from '@hooks/useLanguages';
import type { Language } from '@app-types/settings/language';
import type { ActiveFlag } from '@app-types/settings/session';

type DialogMode = 'create' | 'edit' | null;

function toPayload(values: LanguageFormValues) {
  return {
    language: values.language,
    short_code: values.short_code,
    country_code: values.country_code,
    is_rtl: values.is_rtl,
    is_active: (values.is_active ? 'yes' : 'no') as ActiveFlag,
  };
}

export function LanguagesPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error, refetch } = useLanguages(page);
  const languages = data?.results;
  const totalCount = data?.count || 0;
  const createMutation = useCreateLanguage();
  const updateMutation = useUpdateLanguage();
  const deleteMutation = useDeleteLanguage();

  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Language | null>(null);

  const closeFormDialog = () => {
    setDialogMode(null);
    setSelectedLanguage(null);
  };

  const handleFormSubmit = (values: LanguageFormValues) => {
    const payload = toPayload(values);
    if (dialogMode === 'edit' && selectedLanguage) {
      updateMutation.mutate({ id: selectedLanguage.id, payload }, { onSuccess: closeFormDialog });
      return;
    }
    createMutation.mutate(payload, { onSuccess: closeFormDialog });
  };

  const isFormLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Languages"
        description="Manage supported languages and locale codes for the application."
        actions={
          <Button onClick={() => setDialogMode('create')} className="gap-1">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Language
          </Button>
        }
      />

      {isLoading && <LoadingState message="Loading languages..." />}

      {isError && (
        <ErrorState
          message={error instanceof Error ? error.message : 'Could not load languages'}
          onRetry={() => void refetch()}
        />
      )}

      {!isLoading && !isError && languages?.length === 0 && (
        <EmptyState
          title="No languages configured"
          description="Add your first language to enable multilingual support."
          action={
            <Button onClick={() => setDialogMode('create')} className="gap-1">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add Language
            </Button>
          }
        />
      )}

      {!isLoading && !isError && languages && languages.length > 0 && (
        <LanguagesTable
          languages={languages}
          totalCount={totalCount}
          page={page}
          onPageChange={setPage}
          onEdit={(language) => {
            setSelectedLanguage(language);
            setDialogMode('edit');
          }}
          onDelete={setDeleteTarget}
        />
      )}

      <LanguageFormDialog
        open={dialogMode !== null}
        onOpenChange={(open) => {
          if (!open) closeFormDialog();
        }}
        language={dialogMode === 'edit' ? selectedLanguage : null}
        onSubmit={handleFormSubmit}
        isLoading={isFormLoading}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete language?"
        description={
          deleteTarget
            ? `Permanently delete "${deleteTarget.language}" (${deleteTarget.short_code}-${deleteTarget.country_code})? This cannot be undone.`
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
