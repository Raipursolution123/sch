import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@components/ui/button';
import { PageHeader } from '@components/layout/PageHeader';
import { EmptyState } from '@components/feedback/EmptyState';
import { LoadingState } from '@components/feedback/LoadingState';
import { ErrorState } from '@components/feedback/ErrorState';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { SessionFormDialog } from '@features/settings/sessions/components/SessionFormDialog';
import { SessionsTable } from '@features/settings/sessions/components/SessionsTable';
import {
  useActivateSession,
  useCreateSession,
  useDeleteSession,
  useSessions,
  useUpdateSession,
} from '@hooks/useSessions';
import type { AcademicSession } from '@app-types/settings/session';

type DialogMode = 'create' | 'edit' | null;

export function SessionsPage() {
  const { data: sessions, isLoading, isError, error, refetch } = useSessions();
  const createMutation = useCreateSession();
  const updateMutation = useUpdateSession();
  const activateMutation = useActivateSession();
  const deleteMutation = useDeleteSession();

  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [selectedSession, setSelectedSession] = useState<AcademicSession | null>(null);
  const [activateTarget, setActivateTarget] = useState<AcademicSession | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AcademicSession | null>(null);

  const closeFormDialog = () => {
    setDialogMode(null);
    setSelectedSession(null);
  };

  const handleFormSubmit = (sessionName: string) => {
    if (dialogMode === 'edit' && selectedSession) {
      updateMutation.mutate(
        { id: selectedSession.id, payload: { session: sessionName } },
        { onSuccess: closeFormDialog },
      );
      return;
    }
    createMutation.mutate({ session: sessionName }, { onSuccess: closeFormDialog });
  };

  const isFormLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Academic Session"
        description="Manage academic years. Only one session can be active at a time."
        actions={
          <Button onClick={() => setDialogMode('create')} className="gap-1">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Session
          </Button>
        }
      />

      {isLoading && <LoadingState message="Loading academic sessions..." />}

      {isError && (
        <ErrorState
          message={error instanceof Error ? error.message : 'Could not load sessions'}
          onRetry={() => void refetch()}
        />
      )}

      {!isLoading && !isError && sessions?.length === 0 && (
        <EmptyState
          title="No academic sessions"
          description="Create your first academic session to get started."
          action={
            <Button onClick={() => setDialogMode('create')} className="gap-1">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add Session
            </Button>
          }
        />
      )}

      {!isLoading && !isError && sessions && sessions.length > 0 && (
        <SessionsTable
          sessions={sessions}
          onEdit={(session) => {
            setSelectedSession(session);
            setDialogMode('edit');
          }}
          onActivate={setActivateTarget}
          onDelete={setDeleteTarget}
        />
      )}

      <SessionFormDialog
        open={dialogMode !== null}
        onOpenChange={(open) => {
          if (!open) closeFormDialog();
        }}
        session={dialogMode === 'edit' ? selectedSession : null}
        onSubmit={handleFormSubmit}
        isLoading={isFormLoading}
      />

      <ConfirmDialog
        open={Boolean(activateTarget)}
        onOpenChange={(open) => {
          if (!open) setActivateTarget(null);
        }}
        title="Activate academic session?"
        description={
          activateTarget
            ? `Switch the active session to "${activateTarget.session}"? This affects all session-scoped operations.`
            : ''
        }
        confirmLabel="Activate"
        onConfirm={() => {
          if (!activateTarget) return;
          activateMutation.mutate(activateTarget.id, {
            onSuccess: () => setActivateTarget(null),
          });
        }}
        isLoading={activateMutation.isPending}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete academic session?"
        description={
          deleteTarget ? `Permanently delete "${deleteTarget.session}"? This cannot be undone.` : ''
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
