import { useState } from 'react';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { StatusBadge } from '@components/feedback/StatusBadge';
import { Switch } from '@components/ui/switch';
import { Input, Button } from '@components/ui';
import { usePermissions } from '@hooks/usePermissions';
import { useModules, useUpdateModule } from '@hooks/useAdvancedSettings';
import type { ModuleItem } from '@app-types/settings/advanced-settings';
import { formatDate } from '@utils/format';
import { ModuleListPack } from '@workflow-packs';

export function ModulesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const { can } = usePermissions();
  const { data, isLoading, isError, error, refetch } = useModules(page, query);
  const rows = data?.results ?? [];
  const totalCount = data?.count ?? 0;
  const updateMutation = useUpdateModule();

  const canManage = can('settings.manage');

  const columns: DataTableColumn<ModuleItem>[] = [
    { id: 'name', header: 'Module', cellClassName: 'font-medium', cell: (r) => r.name },
    {
      id: 'short_code',
      header: 'Short Code',
      cell: (r) => (
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{r.short_code}</code>
      ),
    },
    {
      id: 'system',
      header: 'System',
      cell: (r) => <StatusBadge isActive={r.system ? 'yes' : 'no'} />,
    },
    {
      id: 'status',
      header: 'Active',
      cell: (r) => (
        <div className="flex items-center gap-2">
          <Switch
            checked={r.is_active}
            disabled={!canManage || (r.system && r.is_active)}
            aria-label={`Toggle ${r.name}`}
            onCheckedChange={(checked) => updateMutation.mutate({ id: r.id, isActive: checked })}
          />
          <span className="text-sm text-muted-foreground">
            {r.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>
      ),
    },
    {
      id: 'created',
      header: 'Created',
      cellClassName: 'text-muted-foreground',
      cell: (r) => formatDate(r.created_at),
    },
  ];

  return (
    <ModuleListPack
      title="Modules"
      description="Enable or disable feature modules for this school. System modules cannot be disabled."
      actions={
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            setQuery(search);
          }}
        >
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search modules…"
            className="w-56"
          />
          <Button type="submit" variant="secondary">
            Search
          </Button>
        </form>
      }
      isLoading={isLoading}
      loadingMessage="Loading modules..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && rows.length === 0}
      emptyTitle="No modules found"
      emptyDescription="Modules are seeded by the system and cannot be created here."
    >
      <div className="space-y-4">
        <DataTable
          data={rows}
          columns={columns}
          getRowKey={(row) => row.id}
          pagination={{
            page,
            totalCount,
            pageSize: 20,
            onPageChange: setPage,
          }}
        />
      </div>
    </ModuleListPack>
  );
}
