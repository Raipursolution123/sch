import { useState } from 'react';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { Switch } from '@components/ui/switch';
import { usePermissions } from '@hooks/usePermissions';
import { useCaptchaSettings, useUpdateCaptcha } from '@hooks/useAdvancedSettings';
import type { Captcha } from '@app-types/settings/advanced-settings';
import { formatDate } from '@utils/format';
import { ModuleListPack } from '@workflow-packs';

export function CaptchaPage() {
  const [page, setPage] = useState(1);
  const { can } = usePermissions();
  const { data, isLoading, isError, error, refetch } = useCaptchaSettings(page);
  const rows = data?.results ?? [];
  const totalCount = data?.count ?? 0;
  const updateMutation = useUpdateCaptcha();
  const canManage = can('settings.manage');

  const columns: DataTableColumn<Captcha>[] = [
    { id: 'name', header: 'Captcha Type', cellClassName: 'font-medium', cell: (r) => r.name },
    {
      id: 'status',
      header: 'Status',
      cell: (r) => (
        <div className="flex items-center gap-2">
          <Switch
            checked={r.status}
            disabled={!canManage}
            aria-label={`Toggle ${r.name}`}
            onCheckedChange={(checked) => updateMutation.mutate({ id: r.id, status: checked })}
          />
          <span className="text-sm text-muted-foreground">{r.status ? 'Enabled' : 'Disabled'}</span>
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
      title="Captcha"
      description="Control which captcha verification methods are enabled for public-facing forms."
      isLoading={isLoading}
      loadingMessage="Loading captcha settings..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && rows.length === 0}
      emptyTitle="No captcha settings found"
    >
      <DataTable
        data={rows}
        columns={columns}
        getRowKey={(row) => row.id}
        pagination={{ page, totalCount, pageSize: 20, onPageChange: setPage }}
      />
    </ModuleListPack>
  );
}
