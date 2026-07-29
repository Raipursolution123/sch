import { useState } from 'react';
import { Plus, Trash2, Building2, Pencil } from 'lucide-react';
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
  useStaffDepartments,
  useCreateDepartment,
  useUpdateDepartment,
  useDeleteDepartment,
} from '@hooks/useStaff';
import type { StaffDepartment } from '@app-types/staff/staff';
import { ModuleListPack } from '@workflow-packs';

export function DepartmentsPage() {
  const { data: departments = [], isLoading, isError, error, refetch } = useStaffDepartments();
  const createMutation = useCreateDepartment();
  const updateMutation = useUpdateDepartment();
  const deleteMutation = useDeleteDepartment();

  const [formOpen, setFormOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<StaffDepartment | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StaffDepartment | null>(null);
  const [nameInput, setNameInput] = useState('');

  const handleOpenCreate = () => {
    setEditingDept(null);
    setNameInput('');
    setFormOpen(true);
  };

  const handleOpenEdit = (dept: StaffDepartment) => {
    setEditingDept(dept);
    setNameInput(dept.name);
    setFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;

    if (editingDept) {
      updateMutation.mutate(
        { id: editingDept.id, name: nameInput.trim() },
        { onSuccess: () => setFormOpen(false) },
      );
    } else {
      createMutation.mutate(nameInput.trim(), { onSuccess: () => setFormOpen(false) });
    }
  };

  const addDepartmentAction = (
    <PermissionButton permission="staff.create" onClick={handleOpenCreate} className="gap-1">
      <Plus className="h-4 w-4" aria-hidden="true" />
      Add Department
    </PermissionButton>
  );

  return (
    <ModuleListPack
      title="Staff Departments"
      description="Manage organizational departments for school staff allocation."
      actions={addDepartmentAction}
      isLoading={isLoading}
      loadingMessage="Loading departments..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && departments.length === 0}
      emptyTitle="No departments configured"
      emptyDescription="Create your first department to categorize staff members."
      emptyAction={addDepartmentAction}
      footer={
        <>
          <EntityFormDialog
            open={formOpen}
            onOpenChange={setFormOpen}
            title={editingDept ? 'Edit department' : 'Add department'}
            description="Enter the department name below."
            submitLabel={editingDept ? 'Save changes' : 'Add department'}
            onSubmit={handleSubmit}
            isLoading={createMutation.isPending || updateMutation.isPending}
          >
            <FormField label="Department Name" htmlFor="dept_name" required>
              <Input
                id="dept_name"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="e.g. Teaching, Administration, Accounts"
                required
              />
            </FormField>
          </EntityFormDialog>

          <ConfirmDialog
            open={deleteTarget !== null}
            onOpenChange={(open) => {
              if (!open) setDeleteTarget(null);
            }}
            title="Delete department"
            description={
              deleteTarget
                ? `Delete department "${deleteTarget.name}"? This action cannot be undone.`
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
              <TableHead>Department ID</TableHead>
              <TableHead>Department Name</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {departments.map((d) => (
              <TableRow key={d.id}>
                <TableCell className="font-mono text-xs text-muted-foreground">{d.id}</TableCell>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
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
