import { useState } from 'react';
import { Plus, Trash2, Briefcase, Pencil } from 'lucide-react';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { PermissionButton } from '@components/rbac/PermissionButton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@components/ui/table';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormField } from '@components/forms/FormField';
import { Input } from '@components/ui/input';
import {
  useStaffDesignations,
  useCreateDesignation,
  useUpdateDesignation,
  useDeleteDesignation,
} from '@hooks/useStaff';
import type { StaffDesignation } from '@app-types/staff/staff';
import { ModuleListPack } from '@workflow-packs';

export function DesignationsPage() {
  const { data: designations = [], isLoading, isError, error, refetch } = useStaffDesignations();
  const createMutation = useCreateDesignation();
  const updateMutation = useUpdateDesignation();
  const deleteMutation = useDeleteDesignation();

  const [formOpen, setFormOpen] = useState(false);
  const [editingDesig, setEditingDesig] = useState<StaffDesignation | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StaffDesignation | null>(null);
  const [nameInput, setNameInput] = useState('');

  const handleOpenCreate = () => {
    setEditingDesig(null);
    setNameInput('');
    setFormOpen(true);
  };

  const handleOpenEdit = (desig: StaffDesignation) => {
    setEditingDesig(desig);
    setNameInput(desig.name);
    setFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;

    if (editingDesig) {
      updateMutation.mutate(
        { id: editingDesig.id, name: nameInput.trim() },
        { onSuccess: () => setFormOpen(false) },
      );
    } else {
      createMutation.mutate(nameInput.trim(), { onSuccess: () => setFormOpen(false) });
    }
  };

  const addDesignationAction = (
    <PermissionButton permission="staff.create" onClick={handleOpenCreate} className="gap-1">
      <Plus className="h-4 w-4" aria-hidden="true" />
      Add Designation
    </PermissionButton>
  );

  return (
    <ModuleListPack
      title="Staff Designations"
      description="Manage role designations and job titles assigned to school staff."
      actions={addDesignationAction}
      isLoading={isLoading}
      loadingMessage="Loading designations..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && designations.length === 0}
      emptyTitle="No designations configured"
      emptyDescription="Create your first designation to assign job titles to staff members."
      emptyAction={addDesignationAction}
      footer={
        <>
          <EntityFormDialog
            open={formOpen}
            onOpenChange={setFormOpen}
            title={editingDesig ? 'Edit designation' : 'Add designation'}
            description="Enter the designation title below."
            submitLabel={editingDesig ? 'Save changes' : 'Add designation'}
            onSubmit={handleSubmit}
            isLoading={createMutation.isPending || updateMutation.isPending}
          >
            <FormField label="Designation Name" htmlFor="desig_name" required>
              <Input
                id="desig_name"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="e.g. Principal, Senior Teacher, Accountant"
                required
              />
            </FormField>
          </EntityFormDialog>

          <ConfirmDialog
            open={deleteTarget !== null}
            onOpenChange={(open) => {
              if (!open) setDeleteTarget(null);
            }}
            title="Delete designation"
            description={
              deleteTarget
                ? `Delete designation "${deleteTarget.name}"? This action cannot be undone.`
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
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Designation ID</TableHead>
              <TableHead>Designation Name</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {designations.map((d) => (
              <TableRow key={d.id}>
                <TableCell className="font-mono text-xs text-muted-foreground">{d.id}</TableCell>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span>{d.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <PermissionButton
                      permission="staff.edit"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenEdit(d)}
                    >
                      <Pencil className="h-4 w-4" />
                    </PermissionButton>
                    <PermissionButton
                      permission="staff.delete"
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteTarget(d)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </PermissionButton>
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
