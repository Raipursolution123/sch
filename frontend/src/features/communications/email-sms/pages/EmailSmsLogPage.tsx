import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { communicationsService, type MessageLog } from '@services/api/communications.service';
import { ModuleListPack } from '@workflow-packs';
import { formatDate } from '@utils/format';
import { toast } from 'sonner';
import { Badge } from '@components/ui/badge';

export function EmailSmsLogPage() {
  const qc = useQueryClient();
  const {
    data = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['message-logs', 0],
    queryFn: () => communicationsService.getMessages(0),
  });

  const deleteMutation = useMutation({
    mutationFn: communicationsService.deleteMessage,
    onSuccess: () => {
      toast.success('Log deleted successfully');
      void qc.invalidateQueries({ queryKey: ['message-logs', 0] });
      setDeleteTarget(null);
    },
    onError: () => {
      toast.error('Failed to delete log');
    },
  });

  const [deleteTarget, setDeleteTarget] = useState<MessageLog | null>(null);

  const columns: DataTableColumn<MessageLog>[] = [
    { id: 'title', header: 'Title', cellClassName: 'font-medium', cell: (r) => r.title },
    {
      id: 'message',
      header: 'Message',
      cellClassName: 'text-muted-foreground line-clamp-1',
      cell: (r) => r.message,
    },
    {
      id: 'send_through',
      header: 'Type',
      cell: (r) => (
        <Badge variant="muted" className="capitalize">
          {r.send_through}
        </Badge>
      ),
    },
    {
      id: 'audience',
      header: 'Audience',
      cell: (r) => {
        if (r.is_group) return 'Group';
        if (r.is_individual) return 'Individual';
        if (r.is_class) return 'Class';
        return '—';
      },
    },
    { id: 'created_at', header: 'Sent At', cell: (r) => formatDate(r.created_at) },
  ];

  return (
    <ModuleListPack
      title="Email / SMS Log"
      description="View the history of sent emails and SMS messages."
      isLoading={isLoading}
      loadingMessage="Loading logs..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && data.length === 0}
      emptyTitle="No logs found"
      emptyDescription="No messages have been sent yet."
      footer={
        <ConfirmDialog
          open={deleteTarget !== null}
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(null);
          }}
          title="Delete log entry"
          description={
            deleteTarget
              ? `Delete log entry for "${deleteTarget.title}"? This cannot be undone.`
              : ''
          }
          confirmLabel="Delete"
          destructive
          isLoading={deleteMutation.isPending}
          onConfirm={() => {
            if (!deleteTarget) return;
            deleteMutation.mutate(deleteTarget.id);
          }}
        />
      }
    >
      <DataTable
        data={data}
        columns={columns}
        getRowKey={(row) => row.id}
        actions={(row) => (
          <PermissionButton
            permission="communicate.messages.view"
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => setDeleteTarget(row)}
          >
            <Trash2 className="h-4 w-4" />
          </PermissionButton>
        )}
      />
    </ModuleListPack>
  );
}
