import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@components/ui/dialog';
import { Button } from '@components/ui/button';
import { Label } from '@components/ui/label';
import { Input } from '@components/ui/input';
import { Select } from '@components/ui/select';
import type { Lesson, LessonUpdatePayload } from '@app-types/academics/lesson';
import { useSubjectGroups, useSubjectGroup } from '@hooks/useSubjectGroups';
import { useActiveSession } from '@hooks/useSessions';

interface LessonUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lesson: Lesson | null;
  onSubmit: (id: number, data: LessonUpdatePayload) => void;
  isLoading: boolean;
}

export function LessonUpdateDialog({
  open,
  onOpenChange,
  lesson,
  onSubmit,
  isLoading,
}: LessonUpdateDialogProps) {
  const [name, setName] = useState<string>('');
  const [subjectGroupId, setSubjectGroupId] = useState<number | null>(null);
  const [subjectId, setSubjectId] = useState<number | null>(null);
  const [classSectionId, setClassSectionId] = useState<number | null>(null);

  const { data: activeSession } = useActiveSession();
  const sessionId = activeSession?.id;

  const { data: subjectGroupsData, isLoading: isLoadingGroups } = useSubjectGroups(sessionId);
  const subjectGroups = subjectGroupsData?.results || [];

  const { data: subjectGroupDetail, isLoading: isLoadingDetail } = useSubjectGroup(
    subjectGroupId,
    !!subjectGroupId,
  );
  const subjects = subjectGroupDetail?.subjects || [];
  const classSections = subjectGroupDetail?.class_sections || [];

  useEffect(() => {
    if (lesson) {
      setName(lesson.name);
      setSubjectGroupId(lesson.subject_group_id || null);
      setSubjectId(lesson.subject_id || null);
      setClassSectionId(lesson.class_section_id || null);
    }
  }, [lesson]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lesson) return;

    if (!subjectGroupId || !subjectId || !classSectionId) {
      return;
    }

    const payload: LessonUpdatePayload = {
      session_id: sessionId || 1, // Fallback
      subject_group_id: subjectGroupId,
      subject_id: subjectId,
      class_section_id: classSectionId,
      name,
    };

    onSubmit(lesson.id, payload);
  };

  const handleGroupChange = (val: string) => {
    const parsed = parseInt(val, 10);
    setSubjectGroupId(isNaN(parsed) ? null : parsed);
    setSubjectId(null);
    setClassSectionId(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Lesson</DialogTitle>
          <DialogDescription>Update the name of the lesson.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-2 space-y-4">
          <div className="space-y-2">
            <Label>Subject Group *</Label>
            <Select
              value={subjectGroupId ? String(subjectGroupId) : ''}
              onChange={(e) => handleGroupChange(e.target.value)}
              required
              disabled={isLoadingGroups}
              placeholder="Select Subject Group"
              options={subjectGroups.map((g) => ({ value: String(g.id), label: g.name }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Subject *</Label>
              <Select
                value={subjectId ? String(subjectId) : ''}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setSubjectId(isNaN(val) ? null : val);
                }}
                required
                disabled={!subjectGroupId || isLoadingDetail}
                placeholder="Select Subject"
                options={subjects.map((s) => ({ value: String(s.id), label: s.name }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Class & Section *</Label>
              <Select
                value={classSectionId ? String(classSectionId) : ''}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setClassSectionId(isNaN(val) ? null : val);
                }}
                required
                disabled={!subjectGroupId || isLoadingDetail}
                placeholder="Select Class & Section"
                options={classSections.map((cs) => ({
                  value: String(cs.id),
                  label: `${cs.class_name} - ${cs.section_name}`,
                }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-name">Lesson Name *</Label>
            <Input
              id="edit-name"
              placeholder="e.g. Introduction to Physics"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
