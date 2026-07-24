import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ListTree, Pencil } from 'lucide-react';
import { PageHeader } from '@components/layout/PageHeader';
import { ErrorState } from '@components/feedback/ErrorState';
import { LoadingState } from '@components/feedback/LoadingState';
import { SettingsCard } from '@components/forms/SettingsCard';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormNumberField } from '@components/forms/fields';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { Button } from '@components/ui';
import { Switch } from '@components/ui/switch';
import { usePermissions } from '@hooks/usePermissions';
import {
  useSidebarMenus,
  useSidebarSubmenus,
  useUpdateSidebarMenu,
  useUpdateSidebarSubmenu,
} from '@hooks/useAdvancedSettings';
import type { SidebarMenu, SidebarSubMenu } from '@app-types/settings/advanced-settings';
import { getApiErrorMessage } from '@utils/error-message';

const levelSchema = z.object({
  level: z.number({ error: 'Level is required' }).int(),
});

type LevelFormValues = z.infer<typeof levelSchema>;

type LevelEditTarget =
  | { kind: 'menu'; id: number; label: string; level: number }
  | { kind: 'submenu'; id: number; label: string; level: number };

export function SidebarMenuPage() {
  const { can } = usePermissions();
  const canManage = can('settings.manage');

  const [menuPage, setMenuPage] = useState(1);
  const { data: menuData, isLoading, isError, error, refetch } = useSidebarMenus(menuPage);
  const menus = menuData?.results ?? [];
  const menuCount = menuData?.count ?? 0;
  const updateMenuMutation = useUpdateSidebarMenu();

  const [selectedMenu, setSelectedMenu] = useState<SidebarMenu | null>(null);
  const [submenuPage, setSubmenuPage] = useState(1);
  const { data: submenuData, isLoading: submenusLoading } = useSidebarSubmenus(
    submenuPage,
    selectedMenu?.id ?? null,
  );
  const submenus = submenuData?.results ?? [];
  const submenuCount = submenuData?.count ?? 0;
  const updateSubmenuMutation = useUpdateSidebarSubmenu();

  const [levelTarget, setLevelTarget] = useState<LevelEditTarget | null>(null);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LevelFormValues>({ resolver: zodResolver(levelSchema), defaultValues: { level: 0 } });

  useEffect(() => {
    if (levelTarget) reset({ level: levelTarget.level });
  }, [levelTarget, reset]);

  const onSaveLevel = (values: LevelFormValues) => {
    if (!levelTarget) return;
    if (levelTarget.kind === 'menu') {
      updateMenuMutation.mutate(
        { id: levelTarget.id, payload: { level: values.level } },
        { onSuccess: () => setLevelTarget(null) },
      );
    } else {
      updateSubmenuMutation.mutate(
        { id: levelTarget.id, payload: { level: values.level } },
        { onSuccess: () => setLevelTarget(null) },
      );
    }
  };

  const menuColumns: DataTableColumn<SidebarMenu>[] = [
    { id: 'menu', header: 'Menu', cellClassName: 'font-medium', cell: (r) => r.menu || '—' },
    {
      id: 'icon',
      header: 'Icon',
      cell: (r) => <code className="text-xs text-muted-foreground">{r.icon || '—'}</code>,
    },
    { id: 'level', header: 'Level', cell: (r) => r.level ?? '—' },
    {
      id: 'sidebar_display',
      header: 'Show in Sidebar',
      cell: (r) => (
        <Switch
          checked={r.sidebar_display}
          disabled={!canManage}
          aria-label={`Toggle sidebar display for ${r.menu}`}
          onCheckedChange={(checked) =>
            updateMenuMutation.mutate({ id: r.id, payload: { sidebar_display: checked } })
          }
        />
      ),
    },
    {
      id: 'is_active',
      header: 'Active',
      cell: (r) => (
        <Switch
          checked={r.is_active}
          disabled={!canManage}
          aria-label={`Toggle active for ${r.menu}`}
          onCheckedChange={(checked) =>
            updateMenuMutation.mutate({ id: r.id, payload: { is_active: checked } })
          }
        />
      ),
    },
  ];

  const submenuColumns: DataTableColumn<SidebarSubMenu>[] = [
    { id: 'menu', header: 'Submenu', cellClassName: 'font-medium', cell: (r) => r.menu || '—' },
    { id: 'key', header: 'Key', cell: (r) => r.key || '—' },
    {
      id: 'url',
      header: 'URL',
      cell: (r) => <code className="text-xs text-muted-foreground">{r.url || '—'}</code>,
    },
    { id: 'level', header: 'Level', cell: (r) => r.level ?? '—' },
    {
      id: 'is_active',
      header: 'Active',
      cell: (r) => (
        <Switch
          checked={r.is_active}
          disabled={!canManage}
          aria-label={`Toggle active for ${r.menu}`}
          onCheckedChange={(checked) =>
            updateSubmenuMutation.mutate({ id: r.id, payload: { is_active: checked } })
          }
        />
      ),
    },
  ];

  if (isLoading) {
    return <LoadingState message="Loading sidebar menus..." />;
  }

  if (isError) {
    return (
      <ErrorState
        message={getApiErrorMessage(error, 'Could not load sidebar menus')}
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sidebar Menu"
        description="Control which menus and submenus appear in the admin sidebar, their order, and visibility."
      />

      <SettingsCard title="Menus" description="Top-level navigation menus.">
        <DataTable
          data={menus}
          columns={menuColumns}
          getRowKey={(row) => row.id}
          pagination={{
            page: menuPage,
            totalCount: menuCount,
            pageSize: 20,
            onPageChange: setMenuPage,
          }}
          actions={(row) => (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setLevelTarget({
                    kind: 'menu',
                    id: row.id,
                    label: row.menu || row.icon,
                    level: row.level ?? 0,
                  })
                }
                aria-label={`Edit level for ${row.menu}`}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedMenu(row);
                  setSubmenuPage(1);
                }}
                aria-label={`View submenus for ${row.menu}`}
              >
                <ListTree className="h-4 w-4" />
              </Button>
            </>
          )}
        />
      </SettingsCard>

      <SettingsCard
        title={selectedMenu ? `Submenus — ${selectedMenu.menu}` : 'Submenus — All Menus'}
        description="Submenus for the selected menu. Select a menu above to filter this list."
        action={
          selectedMenu ? (
            <Button variant="outline" size="sm" onClick={() => setSelectedMenu(null)}>
              Show all submenus
            </Button>
          ) : undefined
        }
      >
        <DataTable
          data={submenus}
          columns={submenuColumns}
          getRowKey={(row) => row.id}
          isLoading={submenusLoading}
          pagination={{
            page: submenuPage,
            totalCount: submenuCount,
            pageSize: 20,
            onPageChange: setSubmenuPage,
          }}
          emptyMessage="No submenus found."
          actions={(row) => (
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setLevelTarget({
                  kind: 'submenu',
                  id: row.id,
                  label: row.menu,
                  level: row.level ?? 0,
                })
              }
              aria-label={`Edit level for ${row.menu}`}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
        />
      </SettingsCard>

      <EntityFormDialog
        open={Boolean(levelTarget)}
        onOpenChange={(open) => {
          if (!open) setLevelTarget(null);
        }}
        title={`Edit level — ${levelTarget?.label ?? ''}`}
        description="Controls the display order within the sidebar."
        submitLabel="Save changes"
        isLoading={updateMenuMutation.isPending || updateSubmenuMutation.isPending}
        onSubmit={handleSubmit(onSaveLevel)}
        size="sm"
      >
        <FormErrorSummary errors={errors} />
        <FormNumberField control={control} name="level" label="Level" required />
      </EntityFormDialog>
    </div>
  );
}
