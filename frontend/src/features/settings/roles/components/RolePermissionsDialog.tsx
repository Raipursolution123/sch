import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
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

  const columns: DataTableColumn<RolePermissionCategory>[] = useMemo(
    () => [
      {
        id: 'category',
        header: 'Category',
        cell: (cat) => (
          <div>
            <div className="font-medium">{cat.name}</div>
            <div className="font-mono text-xs text-muted-foreground">{cat.short_code}</div>
          </div>
        ),
      },
      ...FLAGS.map((f) => ({
        id: f.key,
        header: f.label,
        cellClassName: 'text-center',
        cell: (cat: RolePermissionCategory) => {
          const row = draft[cat.id] ?? categoryToItem(cat);
          return (
            <Checkbox
              aria-label={`${cat.name} ${f.label}`}
              checked={row[f.key]}
              onChange={(e) => toggle(cat, f.key, e.target.checked)}
              disabled={role?.is_superadmin}
            />
          );
        },
      })),
    ],
    // draft + role flags drive checkbox state; toggle is stable enough for render
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [draft, role?.is_superadmin],
  );

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
            <DataTable data={group.categories} columns={columns} getRowKey={(cat) => cat.id} />
          </section>
        ))}
      </div>
    </EntityFormDialog>
  );
}
