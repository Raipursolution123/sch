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
import type { SyllabusStatusCreatePayload } from '@/types/academics/syllabus-status';
import { useSubjectGroups, useSubjectGroup } from '@/hooks/useSubjectGroups';
import { useLessonList } from '@/hooks/useLessons';
import { useTopicList } from '@/hooks/useTopics';
import { useActiveSession } from '@/hooks/useSessions';

interface SyllabusStatusCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: SyllabusStatusCreatePayload) => void;
  isLoading: boolean;
}

export function SyllabusStatusCreateDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: SyllabusStatusCreateDialogProps) {
  const [subjectGroupId, setSubjectGroupId] = useState<number | null>(null);
  const [subjectId, setSubjectId] = useState<number | null>(null);
  const [classSectionId, setClassSectionId] = useState<number | null>(null);
  const [lessonId, setLessonId] = useState<number | null>(null);
  const [topicId, setTopicId] = useState<number | null>(null);

  const [date, setDate] = useState<string>('');
  const [timeFrom, setTimeFrom] = useState<string>('');
  const [timeTo, setTimeTo] = useState<string>('');
  const [subTopic, setSubTopic] = useState<string>('');
  const [presentation, setPresentation] = useState<string>('');

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

  const { data: topicsData, isLoading: isLoadingTopics } = useTopicList({
    page: 1,
    lesson_id: lessonId,
  });
  const topics = topicsData?.results || [];

  const handleGroupChange = (val: string) => {
    const parsed = parseInt(val, 10);
    setSubjectGroupId(isNaN(parsed) ? null : parsed);
    setSubjectId(null);
    setClassSectionId(null);
    setLessonId(null);
    setTopicId(null);
  };

  const handleSubjectChange = (val: string) => {
    const parsed = parseInt(val, 10);
    setSubjectId(isNaN(parsed) ? null : parsed);
    setLessonId(null);
    setTopicId(null);
  };

  const handleClassSectionChange = (val: string) => {
    const parsed = parseInt(val, 10);
    setClassSectionId(isNaN(parsed) ? null : parsed);
    setLessonId(null);
    setTopicId(null);
  };

  const handleLessonChange = (val: string) => {
    const parsed = parseInt(val, 10);
    setLessonId(isNaN(parsed) ? null : parsed);
    setTopicId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!topicId) return;

    const payload: SyllabusStatusCreatePayload = {
      topic_id: topicId,
      session_id: sessionId || 1,
      created_by: 1, // Fallback for testing
      created_for: 1, // Fallback for testing
      date,
      time_from: timeFrom,
      time_to: timeTo,
      sub_topic: subTopic,
      presentation,
      status: 0,
    };

    onSubmit(payload);

    setDate('');
    setTimeFrom('');
    setTimeTo('');
    setSubTopic('');
    setPresentation('');
    setTopicId(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Syllabus</DialogTitle>
          <DialogDescription>Create a new syllabus record to track its status.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-2 h-[60vh] space-y-4 overflow-y-auto px-1">
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Lesson *</Label>
              <Select
                value={lessonId ? String(lessonId) : ''}
                onChange={(e) => handleLessonChange(e.target.value)}
                required
                disabled={isLoadingLessons || (!subjectId && !classSectionId)}
                placeholder="Select Lesson"
                options={lessons.map((l) => ({ value: String(l.id), label: l.name }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Topic *</Label>
              <Select
                value={topicId ? String(topicId) : ''}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setTopicId(isNaN(val) ? null : val);
                }}
                required
                disabled={isLoadingTopics || !lessonId}
                placeholder="Select Topic"
                options={topics.map((t) => ({ value: String(t.id), label: t.name }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date *</Label>
            <Input
              id="date"
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timeFrom">Time From</Label>
              <Input
                id="timeFrom"
                type="time"
                value={timeFrom}
                onChange={(e) => setTimeFrom(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeTo">Time To</Label>
              <Input
                id="timeTo"
                type="time"
                value={timeTo}
                onChange={(e) => setTimeTo(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subTopic">Sub Topic</Label>
            <Input
              id="subTopic"
              placeholder="e.g. Introduction to Cells"
              value={subTopic}
              onChange={(e) => setSubTopic(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="presentation">Presentation</Label>
            <Input
              id="presentation"
              placeholder="e.g. Slide deck URL or notes"
              value={presentation}
              onChange={(e) => setPresentation(e.target.value)}
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
              {isLoading ? 'Saving...' : 'Add Syllabus'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
