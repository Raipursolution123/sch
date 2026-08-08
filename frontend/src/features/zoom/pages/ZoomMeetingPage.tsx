import { useState, useEffect } from 'react';
import { zoomService, type Conference } from '@services/api/zoom.service';
import { staffService, sessionsService } from '@services/api';
import { ModuleListPack } from '@workflow-packs';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { Button } from '@components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@components/ui/dialog';
import { Label } from '@components/ui/label';
import { Input } from '@components/ui/input';
import { Textarea } from '@components/ui/textarea';
import { toast } from 'sonner';
import { Calendar, Clock, Video, Trash2, Plus } from 'lucide-react';

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

export function ZoomMeetingPage() {
  const [meetings, setMeetings] = useState<Conference[]>([]);
  const [loading, setLoading] = useState(true);
  const [openAdd, setOpenAdd] = useState(false);
  const [saving, setSaving] = useState(false);

  // References
  const [staffList, setStaffList] = useState<any[]>([]);
  const [activeSession, setActiveSession] = useState<number | null>(null);

  // Form State
  const [form, setForm] = useState({
    title: '',
    date: '',
    duration: 45,
    staff_ids: [] as number[],
    url: '',
    password: '',
    description: '',
  });

  useEffect(() => {
    fetchData();
    fetchRefs();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await zoomService.listMeetings();
      setMeetings(data || []);
    } catch (error) {
      toast.error('Failed to load live meetings.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRefs = async () => {
    try {
      const [staffData, sessData] = await Promise.all([
        staffService.list(1),
        sessionsService.getActive(),
      ]);
      setStaffList(staffData?.results || []);
      setActiveSession(sessData?.id || 1);
    } catch (error) {
      console.error('Failed to load reference data.', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this live meeting?')) return;
    try {
      await zoomService.deleteMeeting(id);
      toast.success('Live meeting deleted.');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete live meeting.');
    }
  };

  const handleJoin = async (m: Conference) => {
    try {
      const url = m.return_response || m.url || '';
      if (!url) {
        toast.error('Meeting URL not defined.');
        return;
      }
      window.open(url, '_blank');
      await zoomService.join(m.id);
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSession) return;
    try {
      setSaving(true);
      const payload = {
        title: form.title,
        date: form.date,
        duration: Number(form.duration),
        url: form.url,
        return_response: form.url,
        password: form.password,
        description: form.description,
        api_type: 'manual',
        staff_ids: form.staff_ids,
        session_id: activeSession,
      };
      await zoomService.createMeeting(payload);
      toast.success('Live meeting created successfully.');
      setOpenAdd(false);
      setForm({
        title: '',
        date: '',
        duration: 45,
        staff_ids: [],
        url: '',
        password: '',
        description: '',
      });
      fetchData();
    } catch (error) {
      toast.error('Failed to create live meeting.');
    } finally {
      setSaving(false);
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
      id: 'staff_list',
      header: 'Participants (Staff)',
      cell: (r) => (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {r.staff_list?.map((st, idx) => (
            <span key={idx} className="inline-flex items-center rounded-md bg-secondary/80 px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">
              {st.name} {st.surname || ''}
            </span>
          )) || '—'}
        </div>
      ),
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
      id: 'created_by',
      header: 'Created By',
      cell: (r) => (
        <div className="text-xs">
          <span>{`${r.create_by_name || ''} ${r.create_by_surname || ''}`}</span>
          <p className="text-muted-foreground text-[10px]">{r.create_by_role_name}</p>
        </div>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: (r) => (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${r.status === 2 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
          {r.status === 2 ? 'Started' : 'Pending'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (r) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="default" onClick={() => handleJoin(r)} className="h-8">
            <Video className="mr-1 h-3.5 w-3.5" />
            Join
          </Button>
          <Button size="icon" variant="ghost" onClick={() => handleDelete(r.id)} className="h-8 w-8 text-destructive hover:bg-destructive/10">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <ModuleListPack
      title="Zoom Live Meetings"
      description="Schedule and run staff meetings using Zoom."
      isLoading={loading}
      onRetry={fetchData}
      loadingMessage="Loading live meetings..."
      isEmpty={meetings.length === 0}
      emptyTitle="No live meetings found"
      actions={
        <Button onClick={() => setOpenAdd(true)} className="shadow-sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Live Meeting
        </Button>
      }
    >
      <DataTable data={meetings} columns={columns} getRowKey={(r) => r.id} />

      <Dialog open={openAdd} onOpenChange={setOpenAdd}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Zoom Live Meeting</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2">
                <Label htmlFor="title">Meeting Title</Label>
                <Input
                  id="title"
                  placeholder="e.g. Quarterly Syllabus Overview"
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="date">Date & Time</Label>
                <Input
                  id="date"
                  type="datetime-local"
                  value={form.date}
                  onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="duration">Duration (Minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  placeholder="45"
                  value={form.duration}
                  onChange={(e) => setForm((prev) => ({ ...prev, duration: Number(e.target.value) }))}
                  required
                />
              </div>

              <div className="space-y-1.5 col-span-2">
                <Label htmlFor="staff_ids">Invite Participants (Staff)</Label>
                <div className="border rounded-md p-3 max-h-36 overflow-y-auto space-y-2 bg-background">
                  {staffList.map((st) => (
                    <label key={st.id} className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.staff_ids.includes(st.id)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setForm((prev) => {
                            const list = checked
                              ? [...prev.staff_ids, st.id]
                              : prev.staff_ids.filter((id) => id !== st.id);
                            return { ...prev, staff_ids: list };
                          });
                        }}
                        className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                      />
                      <span>
                        {st.name} {st.surname || ''} ({st.employee_id})
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5 col-span-2">
                <Label htmlFor="url">Zoom Join/Start URL</Label>
                <Input
                  id="url"
                  placeholder="https://zoom.us/j/1234567890?pwd=..."
                  value={form.url}
                  onChange={(e) => setForm((prev) => ({ ...prev, url: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-1.5 col-span-2">
                <Label htmlFor="password">Meeting Password</Label>
                <Input
                  id="password"
                  placeholder="Meeting password (optional)"
                  value={form.password}
                  onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                />
              </div>

              <div className="space-y-1.5 col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter agenda or notes..."
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setOpenAdd(false)} disabled={saving}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Creating...' : 'Create Meeting'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </ModuleListPack>
  );
}
export default ZoomMeetingPage;
