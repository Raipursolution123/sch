import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { JournalEntriesTable } from '../components/JournalEntriesTable';
import { JournalEntryCreateDialog } from '../components/JournalEntryCreateDialog';

export const JournalEntriesPage = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Journal Entries"
        description="Manage journal entries and view double-entry bookkeeping records."
        actions={
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Entry
          </Button>
        }
      />

      <JournalEntriesTable />

      <JournalEntryCreateDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />
    </div>
  );
};
