import { useState } from 'react';
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
import type { LessonCreatePayload } from '@app-types/academics/lesson';
import { useSubjectGroups, useSubjectGroup } from '@hooks/useSubjectGroups';
import { useActiveSession } from '@hooks/useSessions';

interface LessonCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: LessonCreatePayload) => void;
  isLoading: boolean;
}

export function LessonCreateDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: LessonCreateDialogProps) {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!subjectGroupId || !subjectId || !classSectionId) {
      return;
    }

    const payload: LessonCreatePayload = {
      session_id: sessionId || 1, // Fallback to 1 if activeSession is undefined somehow
      subject_group_id: subjectGroupId,
      subject_id: subjectId,
      class_section_id: classSectionId,
      name,
    };

    onSubmit(payload);

    // Reset form
    setName('');
    setSubjectGroupId(null);
    setSubjectId(null);
    setClassSectionId(null);
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
          <DialogTitle>Add Lesson</DialogTitle>
          <DialogDescription>
            Create a new lesson and assign it to a subject group.
          </DialogDescription>
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
            <Label htmlFor="name">Lesson Name *</Label>
            <Input
              id="name"
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
              {isLoading ? 'Saving...' : 'Add Lesson'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
