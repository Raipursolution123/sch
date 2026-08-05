import { useState } from 'react';
import { Plus } from 'lucide-react';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { Button } from '@components/ui/button';
import { ModuleListPack } from '@workflow-packs';
import { useLedgersList, useDeleteLedger } from '@hooks/useLedgers';
import { LedgersTable } from '../components/LedgersTable';
import { LedgerCreateDialog } from '../components/LedgerCreateDialog';
import { LedgerUpdateDialog } from '../components/LedgerUpdateDialog';
import type { Ledger } from '@app-types/finance';

export function LedgersPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error, refetch } = useLedgersList(page);
  const deleteMutation = useDeleteLedger();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [ledgerToEdit, setLedgerToEdit] = useState<Ledger | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Ledger | null>(null);

  const ledgers = data?.results || [];
  const count = data?.count || 0;

  const addLedgerAction = (
    <Button onClick={() => setIsCreateOpen(true)} className="gap-1">
      <Plus className="h-4 w-4" aria-hidden="true" />
      Add ledger
    </Button>
  );

  return (
    <ModuleListPack
      title="Ledgers"
      description="Chart-of-accounts leaves used in journal entries and fee mapping."
      actions={addLedgerAction}
      isLoading={isLoading}
      loadingMessage="Loading ledgers..."
      isError={isError}
      error={error ?? (isError ? new Error('Failed to load ledgers.') : undefined)}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && ledgers.length === 0}
      emptyTitle="No ledgers yet"
      emptyDescription="Create ledgers under their groups before posting journal entries or mapping fees."
      emptyAction={addLedgerAction}
      footer={
        <>
          <LedgerCreateDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
          <LedgerUpdateDialog
            ledger={ledgerToEdit}
            open={!!ledgerToEdit}
            onOpenChange={(open) => !open && setLedgerToEdit(null)}
          />
          <ConfirmDialog
            open={Boolean(deleteTarget)}
            onOpenChange={(open) => {
              if (!open) setDeleteTarget(null);
            }}
            title="Delete ledger?"
            description={
              deleteTarget
                ? `Remove “${deleteTarget.name}”? This cannot be undone if the ledger has no posted entries.`
                : ''
            }
            confirmLabel="Delete"
            destructive
            isLoading={deleteMutation.isPending}
            onConfirm={() => {
              if (!deleteTarget) return;
              deleteMutation.mutate(deleteTarget.id, {
                onSuccess: () => setDeleteTarget(null),
              });
            }}
          />
        </>
      }
    >
      <LedgersTable
        ledgers={ledgers}
        pagination={{
          page,
          pageSize: 10,
          totalCount: count,
          onPageChange: setPage,
        }}
        onEdit={setLedgerToEdit}
        onDelete={(id) => setDeleteTarget(ledgers.find((l) => l.id === id) ?? null)}
      />
    </ModuleListPack>
  );
}
