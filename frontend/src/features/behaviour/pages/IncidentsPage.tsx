import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useIncidents } from '@hooks/useBehaviour';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { ModuleListPack } from '@workflow-packs';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@components/ui/dialog';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';
import { Checkbox } from '@components/ui/checkbox';
import type { Incident } from '@app-types/index';

interface FormValues {
  title: string;
  point: number;
  description: string;
  isNegative: boolean;
}

export function IncidentsPage() {
  const { data = [], isLoading, isError, error, refetch, createIncident, updateIncident, deleteIncident } = useIncidents();
  const [open, setOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Incident | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Incident | null>(null);

  const { register, handleSubmit, reset, setValue, watch } = useForm<FormValues>();

  const handleOpenCreate = () => {
    setEditTarget(null);
    reset({ title: '', point: 1, description: '', isNegative: false });
    setOpen(true);
  };

  const handleOpenEdit = (incident: Incident) => {
    setEditTarget(incident);
    const absPoint = Math.abs(incident.point);
    const isNegative = incident.point < 0;
    reset({
      title: incident.title,
      point: absPoint,
      description: incident.description,
      isNegative,
    });
    setOpen(true);
  };

  const onSubmit = async (values: FormValues) => {
    const rawPoint = watch('point');
    const finalPoint = watch('isNegative') ? -Math.abs(rawPoint) : Math.abs(rawPoint);
    const payload = {
      title: values.title,
      point: finalPoint,
      description: values.description,
    };

    try {
      if (editTarget) {
        await updateIncident({ id: editTarget.id, payload });
      } else {
        await createIncident(payload);
      }
      setOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async () => {
    if (deleteTarget) {
      try {
        await deleteIncident(deleteTarget.id);
        setDeleteTarget(null);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const columns: DataTableColumn<Incident>[] = [
    { id: 'title', header: 'Title', cell: (row) => row.title },
    {
      id: 'point',
      header: 'Points',
      cell: (row) => (
        <span className={row.point < 0 ? 'text-destructive font-semibold' : 'text-success font-semibold'}>
          {row.point > 0 ? `+${row.point}` : row.point}
        </span>
      ),
    },
    { id: 'description', header: 'Description', cell: (row) => row.description },
  ];

  const actions = (
    <PermissionButton permission="staff.create" onClick={handleOpenCreate} className="gap-1">
      <Plus className="h-4 w-4" />
      Create Incident
    </PermissionButton>
  );

  return (
    <ModuleListPack
      title="Incidents"
      description="Define positive and negative student behavior incidents."
      actions={actions}
      isLoading={isLoading}
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={data.length === 0}
      emptyTitle="No incidents found"
      emptyDescription="Create your first incident record."
      emptyAction={actions}
    >
      <DataTable
        data={data}
        columns={columns}
        getRowKey={(r) => r.id}
        actions={(row) => (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(row)}>
              <Edit2 className="h-4 w-4" />
            </Button>
            <PermissionButton
              permission="staff.delete"
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => setDeleteTarget(row)}
            >
              <Trash2 className="h-4 w-4" />
            </PermissionButton>
          </div>
        )}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editTarget ? 'Edit Incident' : 'Create Incident'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Incident Title</Label>
              <Input id="title" {...register('title', { required: true })} placeholder="e.g. Integrity, Late Submission" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="point">Points</Label>
                <Input id="point" type="number" {...register('point', { required: true, min: 1, valueAsNumber: true })} />
              </div>
              <div className="flex items-end pb-3">
                <Checkbox
                  id="isNegative"
                  label="Negative Incident"
                  checked={!!watch('isNegative')}
                  onChange={(e) => setValue('isNegative', (e.target as HTMLInputElement).checked)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" {...register('description')} placeholder="Detail of behavior incident" />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(op) => !op && setDeleteTarget(null)}
        title="Delete Incident"
        description={`Are you sure you want to delete incident "${deleteTarget?.title}"? All student assignments of this incident will also be deleted.`}
        onConfirm={handleDelete}
      />
    </ModuleListPack>
  );
}
