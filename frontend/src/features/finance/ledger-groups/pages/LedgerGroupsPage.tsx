import { useState } from 'react';
import { Button } from '@components/ui/button';
import { Plus } from 'lucide-react';
import { PageHeader } from '@components/layout/PageHeader';
import { LedgerGroupsTable } from '../components/LedgerGroupsTable';
import { LedgerGroupCreateDialog } from '../components/LedgerGroupCreateDialog';
import { LedgerGroupUpdateDialog } from '../components/LedgerGroupUpdateDialog';
import { useLedgerGroupsList, useDeleteLedgerGroup } from '@hooks/useLedgerGroups';
import type { LedgerGroup } from '@app-types/finance';

export const LedgerGroupsPage = () => {
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editGroup, setEditGroup] = useState<LedgerGroup | null>(null);

  const { data, isLoading } = useLedgerGroupsList(page);
  const { mutate: deleteGroup } = useDeleteLedgerGroup();

  const handleEdit = (group: LedgerGroup) => {
    setEditGroup(group);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this ledger group?')) {
      deleteGroup(id);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Ledger Groups"
          description="Manage your account hierarchy and financial groups"
        />
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Group
        </Button>
      </div>

      <div className="rounded-md border bg-card">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading...</div>
        ) : (
          <LedgerGroupsTable
            groups={data?.results || []}
            pagination={{
              page,
              pageSize: 10,
              totalCount: data?.count || 0,
              onPageChange: setPage,
            }}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>

      <LedgerGroupCreateDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />

      {editGroup && (
        <LedgerGroupUpdateDialog
          group={editGroup}
          open={!!editGroup}
          onOpenChange={(open) => !open && setEditGroup(null)}
        />
      )}
    </div>
  );
};
