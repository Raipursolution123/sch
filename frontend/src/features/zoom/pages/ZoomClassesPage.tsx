import { useState, useEffect } from 'react';
import { zoomService, type Conference } from '@services/api/zoom.service';
import { classesService, classSectionsService, staffService, sessionsService } from '@services/api';
import { ModuleListPack } from '@workflow-packs';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { Button } from '@components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@components/ui/dialog';
import { Label } from '@components/ui/label';
import { Input } from '@components/ui/input';
import { Textarea } from '@components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select';
import { toast } from 'sonner';
import { Video, Trash2, Plus, Calendar, Clock } from 'lucide-react';

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

export function ZoomClassesPage() {
  const [classes, setClasses] = useState<Conference[]>([]);
  const [loading, setLoading] = useState(true);
  const [openAdd, setOpenAdd] = useState(false);
  const [saving, setSaving] = useState(false);

  // References
  const [classList, setClassList] = useState<any[]>([]);
  const [sectionList, setSectionList] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [activeSession, setActiveSession] = useState<number | null>(null);

  // Form State
  const [form, setForm] = useState({
    title: '',
    date: '',
    duration: 40,
    class_id: '',
    class_sections: [] as number[],
    staff_id: '',
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
      const data = await zoomService.listClasses();
      setClasses(data || []);
    } catch (error) {
      toast.error('Failed to load live classes.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRefs = async () => {
    try {
      const [clsData, secData, staffData, sessData] = await Promise.all([
        classesService.list(1, true),
        classSectionsService.list(1, true),
        staffService.list(1),
        sessionsService.getActive(),
      ]);
      setClassList(clsData?.results || []);
      setSectionList(secData?.results || []);
      setStaffList(staffData?.results || []);
      setActiveSession(sessData?.id || 1);
    } catch (error) {
      console.error('Failed to load reference data.', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this live class?')) return;
    try {
      await zoomService.deleteClass(id);
      toast.success('Live class deleted.');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete live class.');
    }
  };

  const handleJoin = async (c: Conference) => {
    try {
      const url = c.return_response || c.url || '';
      if (!url) {
        toast.error('Meeting URL not defined.');
        return;
      }
      window.open(url, '_blank');
      await zoomService.join(c.id);
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
        staff_id: form.staff_id ? Number(form.staff_id) : null,
        url: form.url,
        return_response: form.url, // save same in response
        password: form.password,
        description: form.description,
        api_type: 'manual',
        class_sections: form.class_sections,
        session_id: activeSession,
      };
      await zoomService.createClass(payload);
      toast.success('Live class created successfully.');
      setOpenAdd(false);
      setForm({
        title: '',
        date: '',
        duration: 40,
        class_id: '',
        class_sections: [],
        staff_id: '',
        url: '',
        password: '',
        description: '',
      });
      fetchData();
    } catch (error) {
      toast.error('Failed to create live class.');
    } finally {
      setSaving(false);
    }
  };

  const columns: DataTableColumn<Conference>[] = [
    {
      id: 'title',
      header: 'Class Title',
      cell: (r) => (
        <div>
          <span className="font-semibold">{r.title}</span>
          {r.description && <p className="text-xs text-muted-foreground">{r.description}</p>}
        </div>
      ),
    },
    {
      id: 'class_section',
      header: 'Class / Section',
      cell: (r) => (
        <div className="flex flex-wrap gap-1">
          {r.sections_list?.map((sec, idx) => (
            <span key={idx} className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
              {sec.class_name} ({sec.section_name})
            </span>
          )) || '—'}
        </div>
      ),
    },
    {
      id: 'teacher',
      header: 'Staff / Teacher',
      cell: (r) => `${r.create_for_name || ''} ${r.create_for_surname || ''}`.trim() || '—',
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
      title="Zoom Live Classes"
      description="Create and join online Zoom classes for students."
      isLoading={loading}
      onRetry={fetchData}
      loadingMessage="Loading live classes..."
      isEmpty={classes.length === 0}
      emptyTitle="No live classes found"
      actions={
        <Button onClick={() => setOpenAdd(true)} className="shadow-sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Live Class
        </Button>
      }
    >
      <DataTable data={classes} columns={columns} getRowKey={(r) => r.id} />

      <Dialog open={openAdd} onOpenChange={setOpenAdd}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Zoom Live Class</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2">
                <Label htmlFor="title">Class Title</Label>
                <Input
                  id="title"
                  placeholder="e.g. Science - Gravity and Motion"
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
                  placeholder="40"
                  value={form.duration}
                  onChange={(e) => setForm((prev) => ({ ...prev, duration: Number(e.target.value) }))}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="class_id">Class</Label>
                <Select
                  value={form.class_id}
                  onValueChange={(val) => {
                    setForm((prev) => ({ ...prev, class_id: val, class_sections: [] }));
                  }}
                >
                  <SelectTrigger id="class_id">
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classList.map((cls) => (
                      <SelectItem key={cls.id} value={String(cls.id)}>
                        {cls.class_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="class_sections">Section(s)</Label>
                <div className="border rounded-md p-2 max-h-24 overflow-y-auto space-y-1.5 bg-background">
                  {sectionList
                    .filter((sec) => String(sec.class_id) === form.class_id || !form.class_id)
                    .map((sec) => (
                      <label key={sec.id} className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.class_sections.includes(sec.id)}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setForm((prev) => {
                              const list = checked
                                ? [...prev.class_sections, sec.id]
                                : prev.class_sections.filter((id) => id !== sec.id);
                              return { ...prev, class_sections: list };
                            });
                          }}
                          className="rounded border-gray-300 text-primary focus:ring-primary h-3.5 w-3.5"
                        />
                        <span>{sec.section_name}</span>
                      </label>
                    ))}
                  {sectionList.filter((sec) => String(sec.class_id) === form.class_id).length === 0 && (
                    <span className="text-[10px] text-muted-foreground">Select class first</span>
                  )}
                </div>
              </div>

              <div className="space-y-1.5 col-span-2">
                <Label htmlFor="staff_id">Assigned Teacher (Staff)</Label>
                <Select
                  value={form.staff_id}
                  onValueChange={(val) => setForm((prev) => ({ ...prev, staff_id: val }))}
                >
                  <SelectTrigger id="staff_id">
                    <SelectValue placeholder="Select Teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    {staffList.map((st) => (
                      <SelectItem key={st.id} value={String(st.id)}>
                        {`${st.name} ${st.surname || ''}`.trim()} ({st.employee_id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  placeholder="Enter meeting details..."
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
                {saving ? 'Creating...' : 'Create Class'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </ModuleListPack>
  );
}
export default ZoomClassesPage;
