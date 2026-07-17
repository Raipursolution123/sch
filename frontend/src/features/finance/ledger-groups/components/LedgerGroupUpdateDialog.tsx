import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { useUpdateLedgerGroup, useLedgerGroups } from '@/hooks/useLedgerGroups';
import type { LedgerGroup, LedgerGroupUpdatePayload } from '@/types/finance';

interface LedgerGroupUpdateDialogProps {
  group: LedgerGroup;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LedgerGroupUpdateDialog = ({
  group,
  open,
  onOpenChange,
}: LedgerGroupUpdateDialogProps) => {
  const { mutate: updateGroup, isPending } = useUpdateLedgerGroup();
  const { data: ledgerGroupsData } = useLedgerGroups();

  const [name, setName] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [parentId, setParentId] = useState<string>('');
  const [affectsGross, setAffectsGross] = useState<string>('0');

  useEffect(() => {
    if (group) {
      setName(group.name || '');
      setCode(group.code || '');
      setParentId(group.parent_id ? String(group.parent_id) : '');
      setAffectsGross(group.affects_gross !== undefined ? String(group.affects_gross) : '0');
    }
  }, [group]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: LedgerGroupUpdatePayload = {
      name,
      code,
      parent_id: parentId ? parseInt(parentId) : null,
      affects_gross: parseInt(affectsGross),
    };

    updateGroup(
      { id: group.id, data: payload },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      },
    );
  };

  // Prevent selecting itself as a parent
  const parentOptions = [
    { value: '', label: 'None (Top Level)' },
    ...(ledgerGroupsData
      ?.filter((g: any) => g.id !== group?.id) // Can't be its own parent
      ?.map((g: any) => ({ value: String(g.id), label: g.name })) || []),
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Update Ledger Group</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="update_name">Name *</Label>
              <Input
                id="update_name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter group name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="update_code">Code</Label>
              <Input
                id="update_code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter group code"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="update_parent_id">Parent Group</Label>
              <Select
                id="update_parent_id"
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                options={parentOptions}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="update_affects_gross">Affects Gross? *</Label>
              <Select
                id="update_affects_gross"
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
              {isPending ? 'Updating...' : 'Update Ledger Group'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
