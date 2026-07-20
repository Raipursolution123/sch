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
import { Switch } from '@components/ui/switch';
import type { Topic, TopicUpdatePayload } from '@app-types/academics/topic';
import { useSubjectGroups, useSubjectGroup } from '@hooks/useSubjectGroups';
import { useLessonList } from '@hooks/useLessons';
import { useActiveSession } from '@hooks/useSessions';

interface TopicUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  topic: Topic | null;
  onSubmit: (id: number, data: TopicUpdatePayload) => void;
  isLoading: boolean;
}

export function TopicUpdateDialog({
  open,
  onOpenChange,
  topic,
  onSubmit,
  isLoading,
}: TopicUpdateDialogProps) {
  const [name, setName] = useState<string>('');
  const [subjectGroupId, setSubjectGroupId] = useState<number | null>(null);
  const [subjectId, setSubjectId] = useState<number | null>(null);
  const [classSectionId, setClassSectionId] = useState<number | null>(null);
  const [lessonId, setLessonId] = useState<number | null>(null);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [completeDate, setCompleteDate] = useState<string>('');

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

  const { data: lessonsData, isLoading: isLoadingLessons } = useLessonList({
    page: 1,
    subject_group_id: subjectGroupId,
    subject_id: subjectId,
    class_section_id: classSectionId,
  });
  const lessons = lessonsData?.results || [];

  useEffect(() => {
    if (topic) {
      setName(topic.name);
      setSubjectGroupId(topic.subject_group_id || null);
      setSubjectId(topic.subject_id || null);
      setClassSectionId(topic.class_section_id || null);
      setLessonId(topic.lesson_id || null);
      setIsComplete(topic.status === 1);
      setCompleteDate(topic.complete_date || '');
    }
  }, [topic]);

  const handleGroupChange = (val: string) => {
    const parsed = parseInt(val, 10);
    setSubjectGroupId(isNaN(parsed) ? null : parsed);
    setSubjectId(null);
    setClassSectionId(null);
    setLessonId(null);
  };

  const handleSubjectChange = (val: string) => {
    const parsed = parseInt(val, 10);
    setSubjectId(isNaN(parsed) ? null : parsed);
    setLessonId(null);
  };

  const handleClassSectionChange = (val: string) => {
    const parsed = parseInt(val, 10);
    setClassSectionId(isNaN(parsed) ? null : parsed);
    setLessonId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic || !lessonId) return;

    const payload: TopicUpdatePayload = {
      lesson_id: lessonId,
      name,
      status: isComplete ? 1 : 0,
      complete_date: isComplete ? completeDate || new Date().toISOString().split('T')[0] : null,
    };

    onSubmit(topic.id, payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Topic</DialogTitle>
          <DialogDescription>Update the topic details and completion status.</DialogDescription>
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
                onChange={(e) => handleSubjectChange(e.target.value)}
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
                onChange={(e) => handleClassSectionChange(e.target.value)}
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
            <Label>Lesson *</Label>
            <Select
              value={lessonId ? String(lessonId) : ''}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setLessonId(isNaN(val) ? null : val);
              }}
              required
              disabled={isLoadingLessons || (!subjectId && !classSectionId)}
              placeholder="Select Lesson"
              options={lessons.map((l) => ({ value: String(l.id), label: l.name }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-topic-name">Topic Name *</Label>
            <Input
              id="edit-topic-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label className="text-base">Mark as Complete</Label>
              <div className="text-sm text-muted-foreground">
                Has this topic been fully covered in class?
              </div>
            </div>
            <Switch checked={isComplete} onCheckedChange={setIsComplete} />
          </div>

          {isComplete && (
            <div className="space-y-2">
              <Label htmlFor="complete-date">Completion Date</Label>
              <Input
                id="complete-date"
                type="date"
                value={completeDate}
                onChange={(e) => setCompleteDate(e.target.value)}
              />
            </div>
          )}

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
