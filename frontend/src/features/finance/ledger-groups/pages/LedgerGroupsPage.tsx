import { useState } from 'react';
import { Plus } from 'lucide-react';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { Button } from '@components/ui/button';
import { ModuleListPack } from '@workflow-packs';
import { LedgerGroupsTable } from '../components/LedgerGroupsTable';
import { LedgerGroupCreateDialog } from '../components/LedgerGroupCreateDialog';
import { LedgerGroupUpdateDialog } from '../components/LedgerGroupUpdateDialog';
import { useLedgerGroupsList, useDeleteLedgerGroup } from '@hooks/useLedgerGroups';
import type { LedgerGroup } from '@app-types/finance';

export function LedgerGroupsPage() {
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editGroup, setEditGroup] = useState<LedgerGroup | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LedgerGroup | null>(null);

  const { data, isLoading, isError, error, refetch } = useLedgerGroupsList(page);
  const deleteMutation = useDeleteLedgerGroup();

  const groups = data?.results || [];
  const count = data?.count || 0;

  const addGroupAction = (
    <Button onClick={() => setIsCreateOpen(true)} className="gap-1">
      <Plus className="h-4 w-4" aria-hidden="true" />
      Add group
    </Button>
  );

  return (
    <ModuleListPack
      title="Ledger Groups"
      description="Account hierarchy parents for the chart of accounts."
      actions={addGroupAction}
      isLoading={isLoading}
      loadingMessage="Loading ledger groups..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && groups.length === 0}
      emptyTitle="No ledger groups"
      emptyDescription="Add groups (Assets, Liabilities, Income, …) before creating ledgers."
      emptyAction={addGroupAction}
      footer={
        <>
          <LedgerGroupCreateDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
          {editGroup && (
            <LedgerGroupUpdateDialog
              group={editGroup}
              open={!!editGroup}
              onOpenChange={(open) => !open && setEditGroup(null)}
            />
          )}
          <ConfirmDialog
            open={Boolean(deleteTarget)}
            onOpenChange={(open) => {
              if (!open) setDeleteTarget(null);
            }}
            title="Delete ledger group?"
            description={
              deleteTarget
                ? `Remove “${deleteTarget.name}”? Child ledgers must be moved or deleted first.`
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
      <LedgerGroupsTable
        groups={groups}
        pagination={{
          page,
          pageSize: 10,
          totalCount: count,
          onPageChange: setPage,
        }}
        onEdit={setEditGroup}
        onDelete={(id) => setDeleteTarget(groups.find((g) => g.id === id) ?? null)}
      />
    </ModuleListPack>
  );
}
