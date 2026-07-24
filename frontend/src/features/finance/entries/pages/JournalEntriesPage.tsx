import { useState } from 'react';
import { Plus } from 'lucide-react';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { JournalEntriesTable } from '@features/finance/entries/components/JournalEntriesTable';
import { JournalEntryDetailDialog } from '@features/finance/entries/components/JournalEntryDetailDialog';
import { JournalEntryFormDialog } from '@features/finance/entries/components/JournalEntryFormDialog';
import {
  useCreateJournalEntry,
  useDeleteJournalEntry,
  useEntryTypes,
  useJournalEntries,
} from '@hooks/useJournalEntries';
import { useLedgersList } from '@hooks/useLedgers';
import type { JournalEntry, JournalEntryCreatePayload } from '@app-types/finance';
import { ModuleListPack } from '@workflow-packs';

export function JournalEntriesPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error, refetch } = useJournalEntries(page);
  const { data: entryTypes = [] } = useEntryTypes();
  const { data: ledgersData } = useLedgersList(1, 100);
  const ledgers = ledgersData?.results ?? [];

  const createMutation = useCreateJournalEntry();
  const deleteMutation = useDeleteJournalEntry();

  const [createOpen, setCreateOpen] = useState(false);
  const [viewTarget, setViewTarget] = useState<JournalEntry | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<JournalEntry | null>(null);

  const entries = data?.results ?? [];
  const totalCount = data?.count ?? 0;

  const handleCreate = (payload: JournalEntryCreatePayload) => {
    createMutation.mutate(payload, { onSuccess: () => setCreateOpen(false) });
  };

  const addAction = (
    <PermissionButton
      permission="finance.entries.create"
      onClick={() => setCreateOpen(true)}
      className="gap-1"
    >
      <Plus className="h-4 w-4" aria-hidden="true" />
      New entry
    </PermissionButton>
  );

  return (
    <ModuleListPack
      title="Journal Entries"
      description="Post balanced debit/credit journal entries to the accounting ledgers."
      actions={addAction}
      isLoading={isLoading}
      loadingMessage="Loading journal entries..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && entries.length === 0}
      emptyTitle="No journal entries"
      emptyDescription="Create your first balanced journal entry."
      emptyAction={addAction}
      footer={
        <>
          <JournalEntryFormDialog
            open={createOpen}
            onOpenChange={setCreateOpen}
            entryTypes={entryTypes}
            ledgers={ledgers}
            onSubmit={handleCreate}
            isLoading={createMutation.isPending}
          />
          <JournalEntryDetailDialog
            open={Boolean(viewTarget)}
            onOpenChange={(open) => {
              if (!open) setViewTarget(null);
            }}
            entry={viewTarget}
            entryTypes={entryTypes}
            ledgers={ledgers}
          />
          <ConfirmDialog
            open={Boolean(deleteTarget)}
            onOpenChange={(open) => {
              if (!open) setDeleteTarget(null);
            }}
            title="Delete journal entry?"
            description={
              deleteTarget
                ? `Permanently delete entry #${deleteTarget.id} dated ${deleteTarget.date}? Line items will also be removed.`
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
      <JournalEntriesTable
        entries={entries}
        entryTypes={entryTypes}
        totalCount={totalCount}
        page={page}
        onPageChange={setPage}
        onView={setViewTarget}
        onDelete={setDeleteTarget}
      />
    </ModuleListPack>
  );
}
