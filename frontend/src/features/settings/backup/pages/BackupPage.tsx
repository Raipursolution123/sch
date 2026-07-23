import { useState } from 'react';
import { DatabaseBackup, Download, RotateCcw, Trash2 } from 'lucide-react';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { Alert, AlertDescription, AlertTitle } from '@components/ui/alert';
import { Button } from '@components/ui';
import {
  useBackups,
  useCreateBackup,
  useDeleteBackup,
  useDownloadBackup,
  useRestoreBackup,
} from '@hooks/useAdvancedSettings';
import type { Backup } from '@app-types/settings/advanced-settings';
import { formatDate } from '@utils/format';
import { ModuleListPack } from '@workflow-packs';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function BackupPage() {
  const { data, isLoading, isError, error, refetch } = useBackups();
  const rows = data?.results ?? [];
  const restoreAllowed = data?.restore_allowed ?? false;

  const createMutation = useCreateBackup();
  const downloadMutation = useDownloadBackup();
  const deleteMutation = useDeleteBackup();
  const restoreMutation = useRestoreBackup();

  const [deleteTarget, setDeleteTarget] = useState<Backup | null>(null);
  const [restoreTarget, setRestoreTarget] = useState<Backup | null>(null);

  const columns: DataTableColumn<Backup>[] = [
    { id: 'filename', header: 'Filename', cellClassName: 'font-medium', cell: (r) => r.filename },
    {
      id: 'size',
      header: 'Size',
      cellClassName: 'text-muted-foreground',
      cell: (r) => formatBytes(r.size_bytes),
    },
    {
      id: 'created',
      header: 'Created',
      cellClassName: 'text-muted-foreground',
      cell: (r) => formatDate(r.created_at),
    },
  ];

  const createAction = (
    <PermissionButton
      permission="settings.manage"
      onClick={() => createMutation.mutate()}
      isLoading={createMutation.isPending}
      className="gap-1"
    >
      <DatabaseBackup className="h-4 w-4" aria-hidden="true" />
      Create Backup
    </PermissionButton>
  );

  return (
    <ModuleListPack
      title="Backup & Restore"
      description="Create database backups, download them for safekeeping, or restore the database from a backup file."
      actions={createAction}
      prerequisiteHint={
        !restoreAllowed ? (
          <Alert variant="warning">
            <AlertTitle>Database restore is disabled</AlertTitle>
            <AlertDescription>
              Restoring backups is turned off on this server. Ask your system administrator to
              enable <code>ALLOW_DATABASE_RESTORE</code> to allow restoring from a backup file.
            </AlertDescription>
          </Alert>
        ) : undefined
      }
      isLoading={isLoading}
      loadingMessage="Loading backups..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && rows.length === 0}
      emptyTitle="No backups yet"
      emptyDescription="Create your first database backup to protect against data loss."
      emptyAction={createAction}
      footer={
        <>
          <ConfirmDialog
            open={Boolean(deleteTarget)}
            onOpenChange={(open) => {
              if (!open) setDeleteTarget(null);
            }}
            title="Delete backup?"
            description={
              deleteTarget
                ? `Permanently delete "${deleteTarget.filename}"? This cannot be undone.`
                : ''
            }
            confirmLabel="Delete"
            destructive
            onConfirm={() => {
              if (!deleteTarget) return;
              deleteMutation.mutate(deleteTarget.filename, {
                onSuccess: () => setDeleteTarget(null),
              });
            }}
            isLoading={deleteMutation.isPending}
          />

          <ConfirmDialog
            open={Boolean(restoreTarget)}
            onOpenChange={(open) => {
              if (!open) setRestoreTarget(null);
            }}
            title="Restore database?"
            description={
              restoreTarget
                ? `Restoring "${restoreTarget.filename}" will overwrite all current data in the database. This action cannot be undone.`
                : ''
            }
            confirmLabel="Restore"
            destructive
            onConfirm={() => {
              if (!restoreTarget) return;
              restoreMutation.mutate(restoreTarget.filename, {
                onSuccess: () => setRestoreTarget(null),
              });
            }}
            isLoading={restoreMutation.isPending}
          />
        </>
      }
    >
      <DataTable
        data={rows}
        columns={columns}
        getRowKey={(row) => row.filename}
        actions={(row) => (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => downloadMutation.mutate(row.filename)}
              aria-label={`Download ${row.filename}`}
            >
              <Download className="h-4 w-4" />
            </Button>
            <PermissionButton
              permission="settings.manage"
              variant="ghost"
              size="sm"
              disabled={!restoreAllowed}
              title={!restoreAllowed ? 'Database restore is disabled on this server' : undefined}
              onClick={() => setRestoreTarget(row)}
              aria-label={`Restore ${row.filename}`}
            >
              <RotateCcw className="h-4 w-4" />
            </PermissionButton>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleteTarget(row)}
              aria-label={`Delete ${row.filename}`}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
      />
    </ModuleListPack>
  );
}
