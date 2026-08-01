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

export function ScheduleLogPage() {
  const qc = useQueryClient();
  const {
    data = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['message-logs', 1],
    queryFn: () => communicationsService.getMessages(1),
  });

  const deleteMutation = useMutation({
    mutationFn: communicationsService.deleteMessage,
    onSuccess: () => {
      toast.success('Scheduled log deleted successfully');
      void qc.invalidateQueries({ queryKey: ['message-logs', 1] });
      setDeleteTarget(null);
    },
    onError: () => {
      toast.error('Failed to delete scheduled log');
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
      id: 'schedule_date_time',
      header: 'Scheduled Date/Time',
      cell: (r) => (r.schedule_date_time ? formatDate(r.schedule_date_time) : '—'),
    },
    {
      id: 'status',
      header: 'Status',
      cell: (r) => (
        <Badge variant={r.sent === 1 ? 'success' : 'warning'}>
          {r.sent === 1 ? 'Sent' : 'Pending'}
        </Badge>
      ),
    },
  ];

  return (
    <ModuleListPack
      title="Schedule Email / SMS Log"
      description="View and manage scheduled emails and SMS messages."
      isLoading={isLoading}
      loadingMessage="Loading scheduled logs..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && data.length === 0}
      emptyTitle="No scheduled logs"
      emptyDescription="No scheduled messages found."
      footer={
        <ConfirmDialog
          open={deleteTarget !== null}
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(null);
          }}
          title="Delete scheduled log"
          description={
            deleteTarget ? `Cancel and delete scheduled log for "${deleteTarget.title}"?` : ''
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
