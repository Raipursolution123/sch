import { useState, useMemo } from 'react';
import { Plus, MessageSquare } from 'lucide-react';
import { useAssignedIncidents, useIncidents, useIncidentComments } from '@hooks/useBehaviour';
import { useClasses } from '@hooks/useClasses';
import { useClassSections } from '@hooks/useClassSections';
import { useStudents } from '@hooks/useStudents';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { ModuleListPack } from '@workflow-packs';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@components/ui/dialog';
import { Button } from '@components/ui/button';
import { Label } from '@components/ui/label';
import { Select } from '@components/ui/select';
import { Input } from '@components/ui/input';
import { Trash2, Send } from 'lucide-react';
import type { StudentIncidentDetail } from '@app-types/index';

export function AssignIncidentPage() {
  const [filterClass, setFilterClass] = useState<string>('all');
  const [filterSection, setFilterSection] = useState<string>('all');

  const classParam = filterClass !== 'all' ? Number(filterClass) : undefined;
  const sectionParam = filterSection !== 'all' ? Number(filterSection) : undefined;

  const { data: assigned = [], isLoading, isError, error, refetch, assignIncident } = useAssignedIncidents({
    class_id: classParam,
    section_id: sectionParam,
  });

  const { data: incidents = [] } = useIncidents();
  
  const classesQueryResult = useClasses(1, true);
  const classSectionsQueryResult = useClassSections(1, { noPaginate: true });
  const { data: studentsData = [] } = useStudents();

  const classesData = classesQueryResult.data?.results || [];
  const classSectionsData = classSectionsQueryResult.data?.results || [];

  const [open, setOpen] = useState(false);
  const [commentsTarget, setCommentsTarget] = useState<StudentIncidentDetail | null>(null);

  // Local state for dialog dropdowns
  const [formClass, setFormClass] = useState('');
  const [formSection, setFormSection] = useState('');
  const [formStudent, setFormStudent] = useState('');
  const [formIncident, setFormIncident] = useState('');

  // Dropdown options configurations
  const filterClassOptions = useMemo(() => [
    { value: 'all', label: 'All Classes' },
    ...classesData.map((cls) => ({ value: cls.id.toString(), label: cls.class_name })),
  ], [classesData]);

  const filterSectionOptions = useMemo(() => [
    { value: 'all', label: 'All Sections' },
    ...classSectionsData
      .filter((cs) => String(cs.class_id) === String(filterClass))
      .map((cs) => ({ value: cs.section_id.toString(), label: cs.section_name })),
  ], [classSectionsData, filterClass]);

  const formClassOptions = useMemo(() => [
    { value: '', label: 'Select Class' },
    ...classesData.map((cls) => ({ value: cls.id.toString(), label: cls.class_name })),
  ], [classesData]);

  const formSectionOptions = useMemo(() => [
    { value: '', label: 'Select Section' },
    ...classSectionsData
      .filter((cs) => String(cs.class_id) === String(formClass))
      .map((cs) => ({ value: cs.section_id.toString(), label: cs.section_name })),
  ], [classSectionsData, formClass]);

  const formStudentOptions = useMemo(() => {
    const filtered = studentsData.filter((student) => {
      const classMatch = formClass ? String(student.class_id) === String(formClass) : true;
      const sectionMatch = formSection ? String(student.section_id) === String(formSection) : true;
      return classMatch && sectionMatch;
    });

    return [
      { value: '', label: 'Select Student' },
      ...filtered.map((s) => ({ value: s.id.toString(), label: `${s.full_name} (${s.admission_no})` })),
    ];
  }, [studentsData, formClass, formSection]);

  const formIncidentOptions = useMemo(() => [
    { value: '', label: 'Select Behavior Incident' },
    ...incidents.map((inc) => ({
      value: inc.id.toString(),
      label: `${inc.title} (${inc.point > 0 ? `+${inc.point}` : inc.point} pts)`,
    })),
  ], [incidents]);

  const handleOpenAssign = () => {
    setFormClass('');
    setFormSection('');
    setFormStudent('');
    setFormIncident('');
    setOpen(true);
  };

  const handleAssign = async () => {
    if (!formStudent || !formIncident) return;
    try {
      await assignIncident({
        student_id: Number(formStudent),
        incident_id: Number(formIncident),
      });
      setOpen(false);
      void refetch();
    } catch (e) {
      console.error(e);
    }
  };

  const columns: DataTableColumn<StudentIncidentDetail>[] = [
    { id: 'student_name', header: 'Student Name', cell: (row) => row.student_name },
    { id: 'admission_no', header: 'Admission No', cell: (row) => row.admission_no },
    {
      id: 'class_name',
      header: 'Class (Section)',
      cell: (row) => (
        <span>
          {row.class_name} ({row.section_name})
        </span>
      ),
    },
    { id: 'incident_title', header: 'Incident', cell: (row) => row.incident_title },
    {
      id: 'incident_point',
      header: 'Points',
      cell: (row) => (
        <span className={row.incident_point < 0 ? 'text-destructive font-semibold' : 'text-success font-semibold'}>
          {row.incident_point > 0 ? `+${row.incident_point}` : row.incident_point}
        </span>
      ),
    },
    { id: 'assign_by_name', header: 'Assigned By', cell: (row) => row.assign_by_name },
    {
      id: 'created_at',
      header: 'Date',
      cell: (row) => (
        <span>{new Date(row.created_at).toLocaleDateString()}</span>
      ),
    },
  ];

  return (
    <ModuleListPack
      title="Assign Incident"
      description="Track and assign behavior incidents to students."
      actions={
        <PermissionButton permission="staff.create" onClick={handleOpenAssign} className="gap-1">
          <Plus className="h-4 w-4" />
          Assign Incident
        </PermissionButton>
      }
      isLoading={isLoading}
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={false}
      emptyTitle="No assigned incidents"
      emptyDescription="Assign your first behavior incident to a student."
      emptyAction={
        <PermissionButton permission="staff.create" onClick={handleOpenAssign} className="gap-1">
          <Plus className="h-4 w-4" />
          Assign Incident
        </PermissionButton>
      }
    >
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-1.5">
          <Label>Class</Label>
          <Select
            value={filterClass}
            options={filterClassOptions}
            onValueChange={(val) => {
              setFilterClass(val);
              setFilterSection('all');
            }}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Section</Label>
          <Select
            value={filterSection}
            options={filterSectionOptions}
            onValueChange={setFilterSection}
            disabled={filterClass === 'all'}
          />
        </div>
      </div>

      <DataTable
        data={assigned}
        columns={columns}
        getRowKey={(r) => r.id}
        actions={(row) => (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setCommentsTarget(row)}>
              <MessageSquare className="h-4 w-4" />
            </Button>
          </div>
        )}
      />

      {/* Assign Incident Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Incident to Student</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Class (Optional)</Label>
              <Select
                value={formClass}
                options={formClassOptions}
                onValueChange={(val) => {
                  setFormClass(val);
                  setFormSection('');
                  setFormStudent('');
                }}
              />
            </div>

            <div className="space-y-2">
              <Label>Section (Optional)</Label>
              <Select
                value={formSection}
                options={formSectionOptions}
                onValueChange={(val) => {
                  setFormSection(val);
                  setFormStudent('');
                }}
                disabled={!formClass}
              />
            </div>

            <div className="space-y-2">
              <Label>Student</Label>
              <Select
                value={formStudent}
                options={formStudentOptions}
                onValueChange={(val) => setFormStudent(val)}
              />
            </div>

            <div className="space-y-2">
              <Label>Incident</Label>
              <Select
                value={formIncident}
                options={formIncidentOptions}
                onValueChange={(val) => setFormIncident(val)}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAssign} disabled={!formStudent || !formIncident}>
                Assign
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Comments Drawer / Modal */}
      {commentsTarget && (
        <CommentsDialog
          target={commentsTarget}
          onClose={() => setCommentsTarget(null)}
        />
      )}
    </ModuleListPack>
  );
}

function CommentsDialog({
  target,
  onClose,
}: {
  target: StudentIncidentDetail;
  onClose: () => void;
}) {
  const { data: comments = [], addComment, deleteComment } = useIncidentComments(target.id);
  const [commentText, setCommentText] = useState('');

  const handleSend = async () => {
    if (!commentText.trim()) return;
    try {
      await addComment({
        student_incident_id: target.id,
        comment: commentText,
        type: 'staff',
      });
      setCommentText('');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Incident Comments</DialogTitle>
          <p className="text-xs text-muted-foreground">
            Student: {target.student_name} | Incident: {target.incident_title}
          </p>
        </DialogHeader>

        <div className="my-4 max-h-60 overflow-y-auto space-y-3 pr-2">
          {comments.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-4">No comments yet. Start the conversation!</p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="flex flex-col rounded-lg bg-muted p-2.5 relative group">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-semibold text-primary">
                    {c.type === 'staff' ? c.staff_name || 'Staff' : c.student_name || 'Student'}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(c.created_date).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-foreground pr-6">{c.comment}</p>
                <button
                  onClick={() => void deleteComment(c.id)}
                  className="absolute right-2 top-2 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete Comment"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="flex gap-2">
          <Input
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Type your comment..."
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <Button onClick={handleSend}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
