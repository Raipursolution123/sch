import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { Checkbox } from '@components/ui/checkbox';
import { useRoleDetail, useUpdateRolePermissions } from '@hooks/useRoles';
import type {
  RolePermissionCategory,
  RolePermissionUpdateItem,
  RoleSummary,
} from '@app-types/settings/roles';

interface RolePermissionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: RoleSummary | null;
}

type PermFlag = 'can_view' | 'can_add' | 'can_edit' | 'can_delete';

const FLAGS: { key: PermFlag; label: string }[] = [
  { key: 'can_view', label: 'View' },
  { key: 'can_add', label: 'Add' },
  { key: 'can_edit', label: 'Edit' },
  { key: 'can_delete', label: 'Delete' },
];

function categoryToItem(cat: RolePermissionCategory): RolePermissionUpdateItem {
  return {
    perm_cat_id: cat.id,
    can_view: cat.can_view,
    can_add: cat.can_add,
    can_edit: cat.can_edit,
    can_delete: cat.can_delete,
  };
}

export function RolePermissionsDialog({ open, onOpenChange, role }: RolePermissionsDialogProps) {
  const roleId = role?.id ?? null;
  const { data, isLoading, isError, error } = useRoleDetail(open ? roleId : null);
  const updateMutation = useUpdateRolePermissions();
  const [draft, setDraft] = useState<Record<number, RolePermissionUpdateItem>>({});

  useEffect(() => {
    if (!data) {
      setDraft({});
      return;
    }
    const next: Record<number, RolePermissionUpdateItem> = {};
    for (const group of data.permission_groups) {
      for (const cat of group.categories) {
        next[cat.id] = categoryToItem(cat);
      }
    }
    setDraft(next);
  }, [data]);

  const groups = data?.permission_groups ?? [];

  const toggle = (cat: RolePermissionCategory, flag: PermFlag, checked: boolean) => {
    setDraft((prev) => {
      const current = prev[cat.id] ?? categoryToItem(cat);
      return {
        ...prev,
        [cat.id]: { ...current, [flag]: checked },
      };
    });
  };

  const payload = useMemo(() => ({ permissions: Object.values(draft) }), [draft]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!roleId) return;
    updateMutation.mutate({ id: roleId, payload }, { onSuccess: () => onOpenChange(false) });
  };

  return (
    <EntityFormDialog
      open={open}
      onOpenChange={onOpenChange}
      isEdit
      isLoading={updateMutation.isPending}
      submitDisabled={isLoading || isError || role?.is_superadmin}
      title={role ? `Permissions — ${role.name}` : 'Role permissions'}
      description="Toggle view / add / edit / delete for each permission category. Changes apply to all staff assigned to this role."
      submitLabel="Save permissions"
      onSubmit={handleSubmit}
      size="lg"
      scrollable
      className="sm:max-w-4xl"
    >
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading permission matrix…</p>
      ) : null}
      {isError ? (
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : 'Failed to load role permissions.'}
        </p>
      ) : null}
      {!isLoading && !isError && groups.length === 0 ? (
        <p className="text-sm text-muted-foreground">No permission categories found.</p>
      ) : null}

      <div className="space-y-6">
        {groups.map((group) => (
          <section key={group.id} className="space-y-2">
            <h3 className="text-sm font-semibold tracking-tight">{group.name}</h3>
            <div className="overflow-x-auto rounded-md border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 font-medium">Category</th>
                    {FLAGS.map((f) => (
                      <th key={f.key} className="px-2 py-2 text-center font-medium">
                        {f.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {group.categories.map((cat) => {
                    const row = draft[cat.id] ?? categoryToItem(cat);
                    return (
                      <tr key={cat.id} className="border-t">
                        <td className="px-3 py-2">
                          <div className="font-medium">{cat.name}</div>
                          <div className="font-mono text-xs text-muted-foreground">
                            {cat.short_code}
                          </div>
                        </td>
                        {FLAGS.map((f) => (
                          <td key={f.key} className="px-2 py-2 text-center">
                            <Checkbox
                              aria-label={`${cat.name} ${f.label}`}
                              checked={row[f.key]}
                              onChange={(e) => toggle(cat, f.key, e.target.checked)}
                              disabled={role?.is_superadmin}
                            />
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>
    </EntityFormDialog>
  );
}
