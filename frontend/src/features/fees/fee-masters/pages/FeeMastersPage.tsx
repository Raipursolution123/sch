import { useState } from 'react';
import { Plus, Edit2, Trash2, Layers } from 'lucide-react';
import { ModuleListPack } from '@workflow-packs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@components/ui/table';
import { Button } from '@components/ui/button';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@components/ui/dialog';
import { FormField } from '@components/forms/FormField';
import { Input } from '@components/ui/input';
import { Select } from '@components/ui/select';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { useFeeGroups } from '@hooks/useFeeGroups';
import { useFeeTypes } from '@hooks/useFeeTypes';
import {
  useFeeMasters,
  useCreateFeeMaster,
  useUpdateFeeMaster,
  useDeleteFeeMaster,
} from '@hooks/useFeeMasters';
import type { FeeMasterItem } from '@services/api/fee-masters.service';

export function FeeMastersPage() {
  const { data: masters, isLoading, isError, error, refetch } = useFeeMasters();
  const { data: feeGroups } = useFeeGroups();
  const { data: feeTypes } = useFeeTypes();

  const createMutation = useCreateFeeMaster();
  const updateMutation = useUpdateFeeMaster();
  const deleteMutation = useDeleteFeeMaster();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<FeeMasterItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FeeMasterItem | null>(null);

  const [feeGroupId, setFeeGroupId] = useState<string>('');
  const [feeTypeId, setFeeTypeId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  const groupOptions = (feeGroups || []).map((g) => ({
    value: String(g.id),
    label: g.name || `Group #${g.id}`,
  }));
  const typeOptions = (feeTypes || []).map((t: any) => ({
    value: String(t.id),
    label: t.type || t.name || t.code || `Type #${t.id}`,
  }));

  const openCreateDialog = () => {
    setSelectedRecord(null);
    setFeeGroupId(groupOptions[0]?.value || '');
    setFeeTypeId(typeOptions[0]?.value || '');
    setAmount('');
    setDescription('');
    setDialogOpen(true);
  };

  const openEditDialog = (item: FeeMasterItem) => {
    setSelectedRecord(item);
    setFeeGroupId(String(item.fee_group_id || ''));
    setFeeTypeId(String(item.fee_type_id || ''));
    setAmount(String(item.amount || ''));
    setDescription(item.description || '');
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      fee_group_id: Number(feeGroupId),
      fee_type_id: Number(feeTypeId),
      amount: Number(amount),
      description,
    };

    if (selectedRecord) {
      updateMutation.mutate(
        { id: selectedRecord.id, payload },
        { onSuccess: () => setDialogOpen(false) },
      );
    } else {
      createMutation.mutate(payload, { onSuccess: () => setDialogOpen(false) });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const masterList = masters || [];

  const addAction = (
    <Button onClick={openCreateDialog} className="gap-1">
      <Plus className="h-4 w-4" />
      Assign Fee Master Rule
    </Button>
  );

  return (
    <ModuleListPack
      title="Fees Master"
      description="Define fee group and fee type mapping rules with specific amounts."
      actions={addAction}
      isLoading={isLoading}
      loadingMessage="Loading fees master records..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && masterList.length === 0}
      emptyTitle="No Fee Master rules configured"
      emptyDescription="Create a fee master rule linking fee groups and fee types with amounts."
      emptyAction={addAction}
      footer={
        <>
          {/* Create/Edit Modal */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {selectedRecord ? 'Edit Fee Master Rule' : 'Assign Fee Master Rule'}
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4 py-2">
                <FormField label="Fee Group" htmlFor="fm_group" required>
                  <Select
                    id="fm_group"
                    options={groupOptions}
                    value={feeGroupId}
                    onChange={(e) => setFeeGroupId(e.target.value)}
                  />
                </FormField>

                <FormField label="Fee Type" htmlFor="fm_type" required>
                  <Select
                    id="fm_type"
                    options={typeOptions}
                    value={feeTypeId}
                    onChange={(e) => setFeeTypeId(e.target.value)}
                  />
                </FormField>

                <FormField label="Amount (₹)" htmlFor="fm_amount" required>
                  <Input
                    id="fm_amount"
                    type="number"
                    placeholder="Enter fee amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </FormField>

                <FormField label="Description (Optional)" htmlFor="fm_desc">
                  <Input
                    id="fm_desc"
                    placeholder="e.g. Annual Tuition Fee Rule"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </FormField>

                <DialogFooter className="gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? 'Saving...' : selectedRecord ? 'Update Rule' : 'Save Rule'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Delete Dialog */}
          <ConfirmDialog
            open={deleteTarget !== null}
            onOpenChange={(open) => {
              if (!open) setDeleteTarget(null);
            }}
            title="Delete Fee Master Rule"
            description={
              deleteTarget
                ? `Delete rule for "${deleteTarget.fee_group_name} - ${deleteTarget.fee_type_name}"?`
                : ''
            }
            confirmLabel="Delete"
            destructive
            isLoading={deleteMutation.isPending}
            onConfirm={() => {
              if (!deleteTarget) return;
              deleteMutation.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
            }}
          />
        </>
      }
    >
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rule ID</TableHead>
              <TableHead>Fee Group</TableHead>
              <TableHead>Fee Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {masterList.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-mono text-xs text-muted-foreground">{item.id}</TableCell>
                <TableCell className="font-semibold text-foreground">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-primary" />
                    <span>{item.fee_group_name}</span>
                  </div>
                </TableCell>
                <TableCell className="font-medium text-foreground">{item.fee_type_name}</TableCell>
                <TableCell className="font-mono font-bold text-emerald-700">
                  ₹{item.amount?.toLocaleString()}
                </TableCell>
                <TableCell className="text-xs">
                  {item.description ? (
                    <span className="inline-block rounded border bg-muted/50 px-2 py-0.5 font-medium text-foreground">
                      {item.description}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(item)}>
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteTarget(item)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </ModuleListPack>
  );
}
