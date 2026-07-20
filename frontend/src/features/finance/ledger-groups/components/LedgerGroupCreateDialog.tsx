import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { useCreateLedgerGroup, useLedgerGroups } from '@/hooks/useLedgerGroups';
import type { LedgerGroupCreatePayload, LedgerGroup } from '@/types/finance';

interface LedgerGroupCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LedgerGroupCreateDialog = ({ open, onOpenChange }: LedgerGroupCreateDialogProps) => {
  const { mutate: createGroup, isPending } = useCreateLedgerGroup();
  const { data: ledgerGroupsData } = useLedgerGroups();

  const [name, setName] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [parentId, setParentId] = useState<string>('');
  const [affectsGross, setAffectsGross] = useState<string>('0');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: LedgerGroupCreatePayload = {
      name,
      code,
      parent_id: parentId ? parseInt(parentId) : null,
      affects_gross: parseInt(affectsGross),
    };

    createGroup(payload, {
      onSuccess: () => {
        onOpenChange(false);
        setName('');
        setCode('');
        setParentId('');
        setAffectsGross('0');
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Create Ledger Group</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter group name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Code</Label>
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter group code"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="parent_id">Parent Group</Label>
              <Select
                id="parent_id"
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                options={[
                  { value: '', label: 'None (Top Level)' },
                  ...(ledgerGroupsData?.map((g: LedgerGroup) => ({
                    value: String(g.id),
                    label: g.name,
                  })) || []),
                ]}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="affects_gross">Affects Gross? *</Label>
              <Select
                id="affects_gross"
                value={affectsGross}
                onChange={(e) => setAffectsGross(e.target.value)}
                options={[
                  { value: '0', label: 'No (Indirect)' },
                  { value: '1', label: 'Yes (Direct)' },
                ]}
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Creating...' : 'Create Ledger Group'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
