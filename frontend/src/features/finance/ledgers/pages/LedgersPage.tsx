import { useState } from 'react';
import { ModuleListPack } from '@workflow-packs';
import { Plus } from 'lucide-react';
import { Button } from '@components/ui/button';

import { useLedgersList, useDeleteLedger } from '@hooks/useLedgers';
import { LedgersTable } from '../components/LedgersTable';
import { LedgerCreateDialog } from '../components/LedgerCreateDialog';
import { LedgerUpdateDialog } from '../components/LedgerUpdateDialog';
import type { Ledger } from '@app-types/finance';

export const LedgersPage = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useLedgersList(page);
  const { mutate: deleteLedger } = useDeleteLedger();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [ledgerToEdit, setLedgerToEdit] = useState<Ledger | null>(null);

  const ledgers = data?.results || [];
  const count = data?.count || 0;

  const handleDelete = (id: number) => {
    deleteLedger(id);
  };

  const addLedgerAction = (
    <Button
      onClick={() => setIsCreateOpen(true)}
      className="gap-1 bg-green-500 text-white hover:bg-green-600"
    >
      <Plus className="h-4 w-4" aria-hidden="true" />
      Add Ledger
    </Button>
  );

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Ledger</h1>
          <p className="text-sm text-muted-foreground">
            Manage your ledgers for financial accounting.
          </p>
        </div>
      </div>

      <ModuleListPack
        title=""
        description=""
        actions={addLedgerAction}
        isLoading={isLoading}
        loadingMessage="Loading ledgers..."
        isError={isError}
        error={isError ? new Error('Failed to load ledgers. Please try again later.') : undefined}
        isEmpty={!isLoading && !isError && ledgers.length === 0}
        emptyTitle="No ledgers found"
        emptyDescription="No ledgers have been created yet."
        emptyAction={addLedgerAction}
        footer={
          <>
            <LedgerCreateDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
            <LedgerUpdateDialog
              ledger={ledgerToEdit}
              open={!!ledgerToEdit}
              onOpenChange={(open) => !open && setLedgerToEdit(null)}
            />
          </>
        }
      >
        <LedgersTable
          ledgers={ledgers}
          pagination={{
            page: page,
            pageSize: 10,
            totalCount: count,
            onPageChange: setPage,
          }}
          onEdit={setLedgerToEdit}
          onDelete={handleDelete}
        />
      </ModuleListPack>
    </div>
  );
};
