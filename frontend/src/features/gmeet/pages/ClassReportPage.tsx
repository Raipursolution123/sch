import { useState, useEffect } from 'react';
import { gmeetService, type Gmeet, type GmeetViewerHistory } from '@services/api/gmeet.service';
import { classesService, classSectionsService } from '@services/api';
import { ModuleListPack } from '@workflow-packs';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { Button } from '@components/ui/button';
import { Label } from '@components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@components/ui/dialog';
import { toast } from 'sonner';
import { Search, Users, Calendar, Clock, Eye } from 'lucide-react';

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

export function ClassReportPage() {
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<Gmeet[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');

  // Refs
  const [classList, setClassList] = useState<any[]>([]);
  const [sectionList, setSectionList] = useState<any[]>([]);

  // Viewers Modal
  const [viewersOpen, setViewersOpen] = useState(false);
  const [viewersLoading, setViewersLoading] = useState(false);
  const [viewers, setViewers] = useState<GmeetViewerHistory[]>([]);
  const [activeClassName, setActiveClassName] = useState('');

  useEffect(() => {
    fetchRefs();
  }, []);

  const fetchRefs = async () => {
    try {
      const [clsData, secData] = await Promise.all([
        classesService.list(1, true),
        classSectionsService.list(1, true),
      ]);
      setClassList(clsData?.results || []);
      setSectionList(secData?.results || []);
    } catch (error) {
      console.error('Failed to load classes or sections reference data.', error);
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedClass || !selectedSection) {
      toast.error('Please select both class and section.');
      return;
    }
    try {
      setLoading(true);
      const data = await gmeetService.getClassReport({
        class_id: Number(selectedClass),
        section_id: Number(selectedSection),
      });
      setClasses(data || []);
    } catch (error) {
      toast.error('Failed to fetch class report.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewViewers = async (c: Gmeet) => {
    try {
      setViewersOpen(true);
      setViewersLoading(true);
      setActiveClassName(c.title);
      const data = await gmeetService.getClassViewers(c.id, {
        class_id: Number(selectedClass),
        section_id: Number(selectedSection),
      });
      setViewers(data || []);
    } catch (error) {
      toast.error('Failed to fetch viewers list.');
    } finally {
      setViewersLoading(false);
    }
  };

  const columns: DataTableColumn<Gmeet>[] = [
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
      id: 'teacher',
      header: 'Teacher',
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
      id: 'total_viewers',
      header: 'Viewers Count',
      cell: (r) => (
        <Button variant="outline" size="sm" onClick={() => handleViewViewers(r)} className="h-8 gap-1.5">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span>{r.total_viewers ?? 0}</span>
          <Eye className="h-3.5 w-3.5 ml-1 text-muted-foreground" />
        </Button>
      ),
    },
  ];

  const viewerColumns: DataTableColumn<GmeetViewerHistory>[] = [
    {
      id: 'student_name',
      header: 'Student Name',
      cell: (r) => `${r.student_name || ''} ${r.student_lastname || ''}`.trim() || '—',
    },
    {
      id: 'admission_no',
      header: 'Admission No',
      cell: (r) => r.admission_no || '—',
    },
    {
      id: 'roll_no',
      header: 'Roll No',
      cell: (r) => r.roll_no || '—',
    },
    {
      id: 'father_name',
      header: "Father's Name",
      cell: (r) => r.father_name || '—',
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
      title="Class Report"
      description="View attendance and viewer statistics for live online classes."
      isLoading={loading}
      onRetry={() => void handleSearch()}
      loadingMessage="Fetching report..."
    >
      <div className="bg-card/50 p-4 border rounded-lg shadow-sm mb-6 max-w-4xl">
        <form onSubmit={handleSearch} className="flex flex-wrap items-end gap-4">
          <div className="space-y-1.5 w-48">
            <Label htmlFor="class_id">Class</Label>
            <Select
              value={selectedClass}
              onValueChange={(val) => {
                setSelectedClass(val);
                setSelectedSection('');
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

          <div className="space-y-1.5 w-48">
            <Label htmlFor="section_id">Section</Label>
            <Select
              value={selectedSection}
              onValueChange={setSelectedSection}
              disabled={!selectedClass}
            >
              <SelectTrigger id="section_id">
                <SelectValue placeholder="Select Section" />
              </SelectTrigger>
              <SelectContent>
                {sectionList
                  .filter((sec) => String(sec.class_id) === selectedClass)
                  .map((sec) => (
                    <SelectItem key={sec.id} value={String(sec.id)}>
                      {sec.section_name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="gap-2">
            <Search className="h-4 w-4" />
            Search
          </Button>
        </form>
      </div>

      {classes.length > 0 ? (
        <DataTable data={classes} columns={columns} getRowKey={(r) => r.id} />
      ) : (
        !loading &&
        selectedClass &&
        selectedSection && (
          <div className="text-center py-12 border rounded-lg bg-card/10">
            <p className="text-muted-foreground">No completed classes found for the selected filter.</p>
          </div>
        )
      )}

      <Dialog open={viewersOpen} onOpenChange={setViewersOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Viewers for: {activeClassName}</DialogTitle>
          </DialogHeader>

          {viewersLoading ? (
            <div className="py-12 text-center text-muted-foreground">Loading viewers...</div>
          ) : viewers.length > 0 ? (
            <DataTable data={viewers} columns={viewerColumns} getRowKey={(r) => r.id} />
          ) : (
            <div className="py-12 text-center text-muted-foreground">No student join history recorded for this class.</div>
          )}
        </DialogContent>
      </Dialog>
    </ModuleListPack>
  );
}
export default ClassReportPage;
