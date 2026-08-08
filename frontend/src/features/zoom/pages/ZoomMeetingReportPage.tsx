import { useState, useEffect } from 'react';
import { zoomService, type Conference, type ZoomViewerHistory } from '@services/api/zoom.service';
import { ModuleListPack } from '@workflow-packs';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { Button } from '@components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@components/ui/dialog';
import { toast } from 'sonner';
import { Users, Calendar, Clock, Eye } from 'lucide-react';

function formatDateTime(iso: string | null): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function ZoomMeetingReportPage() {
  const [loading, setLoading] = useState(false);
  const [meetings, setMeetings] = useState<Conference[]>([]);

  // Viewers Modal
  const [viewersOpen, setViewersOpen] = useState(false);
  const [viewersLoading, setViewersLoading] = useState(false);
  const [viewers, setViewers] = useState<ZoomViewerHistory[]>([]);
  const [activeMeetingTitle, setActiveMeetingTitle] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await zoomService.getMeetingReport();
      setMeetings(data || []);
    } catch (error) {
      toast.error('Failed to load meeting report.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewViewers = async (m: Conference) => {
    try {
      setViewersOpen(true);
      setViewersLoading(true);
      setActiveMeetingTitle(m.title);
      const data = await zoomService.getMeetingViewers(m.id);
      setViewers(data || []);
    } catch (error) {
      toast.error('Failed to fetch viewers list.');
    } finally {
      setViewersLoading(false);
    }
  };

  const columns: DataTableColumn<Conference>[] = [
    {
      id: 'title',
      header: 'Meeting Title',
      cell: (r) => (
        <div>
          <span className="font-semibold">{r.title}</span>
          {r.description && <p className="text-xs text-muted-foreground">{r.description}</p>}
        </div>
      ),
    },
    {
      id: 'created_by',
      header: 'Created By',
      cell: (r) => `${r.create_by_name || ''} ${r.create_by_surname || ''}`.trim() || '—',
    },
    {
      id: 'date',
      header: 'Date & Time',
      cell: (r) => (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          <span>{formatDateTime(r.date)}</span>
          <Clock className="h-3.5 w-3.5 ml-2" />
          <span>{r.duration} mins</span>
        </div>
      ),
    },
    {
      id: 'total_viewers',
      header: 'Staff Joined Count',
      cell: (r) => (
        <Button variant="outline" size="sm" onClick={() => handleViewViewers(r)} className="h-8 gap-1.5">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span>{r.total_viewers ?? 0}</span>
          <Eye className="h-3.5 w-3.5 ml-1 text-muted-foreground" />
        </Button>
      ),
    },
  ];

  const viewerColumns: DataTableColumn<ZoomViewerHistory>[] = [
    {
      id: 'staff_name',
      header: 'Staff / Invitee Name',
      cell: (r) => `${r.staff_name || ''} ${r.staff_surname || ''}`.trim() || '—',
    },
    {
      id: 'employee_id',
      header: 'Employee ID',
      cell: (r) => r.employee_id || '—',
    },
    {
      id: 'role_name',
      header: 'Role',
      cell: (r) => r.role_name || '—',
    },
    {
      id: 'total_hit',
      header: 'Join Count',
      cellClassName: 'text-center font-semibold',
      cell: (r) => r.total_hit,
    },
    {
      id: 'last_join',
      header: 'Last Joined',
      cell: (r) => formatDateTime(r.created_at),
    },
  ];

  return (
    <ModuleListPack
      title="Meeting Report (Zoom)"
      description="View attendance and statistics for completed Zoom staff meetings."
      isLoading={loading}
      onRetry={fetchData}
      loadingMessage="Loading meeting report..."
      isEmpty={meetings.length === 0}
      emptyTitle="No completed meetings found"
    >
      <DataTable data={meetings} columns={columns} getRowKey={(r) => r.id} />

      <Dialog open={viewersOpen} onOpenChange={setViewersOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Viewers for Meeting: {activeMeetingTitle}</DialogTitle>
          </DialogHeader>

          {viewersLoading ? (
            <div className="py-12 text-center text-muted-foreground">Loading viewers...</div>
          ) : viewers.length > 0 ? (
            <DataTable data={viewers} columns={viewerColumns} getRowKey={(r) => r.id} />
          ) : (
            <div className="py-12 text-center text-muted-foreground">No staff join history recorded for this meeting.</div>
          )}
        </DialogContent>
      </Dialog>
    </ModuleListPack>
  );
}
export default ZoomMeetingReportPage;
