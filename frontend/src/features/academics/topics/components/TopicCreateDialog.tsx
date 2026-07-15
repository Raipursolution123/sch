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
import { Switch } from '@components/ui/switch';
import type { TopicCreatePayload } from '@/types/academics/topic';
import { useLessonList } from '@/hooks/useLessons';
import { useActiveSession } from '@/hooks/useSessions';

interface TopicCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: TopicCreatePayload) => void;
  isLoading: boolean;
}

export function TopicCreateDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: TopicCreateDialogProps) {
  const [name, setName] = useState<string>('');
  const [lessonId, setLessonId] = useState<number | null>(null);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [completeDate, setCompleteDate] = useState<string>('');

  const { data: activeSession } = useActiveSession();
  const sessionId = activeSession?.id;

  // We load a list of lessons so the user can select one.
  const { data: lessonsData, isLoading: isLoadingLessons } = useLessonList({ page: 1 });
  const lessons = lessonsData?.results || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!lessonId) return;

    const payload: TopicCreatePayload = {
      session_id: sessionId || 1, // Fallback to 1 if activeSession is undefined
      lesson_id: lessonId,
      name,
      status: isComplete ? 1 : 0,
      complete_date: isComplete ? completeDate || new Date().toISOString().split('T')[0] : null,
    };

    onSubmit(payload);

    setName('');
    setLessonId(null);
    setIsComplete(false);
    setCompleteDate('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Topic</DialogTitle>
          <DialogDescription>Create a new topic and assign it to a lesson.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-2 space-y-4">
          <div className="space-y-2">
            <Label>Lesson *</Label>
            <Select
              value={lessonId ? String(lessonId) : ''}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setLessonId(isNaN(val) ? null : val);
              }}
              required
              disabled={isLoadingLessons}
              placeholder="Select Lesson"
              options={lessons.map((l) => ({ value: String(l.id), label: l.name }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="topic-name">Topic Name *</Label>
            <Input
              id="topic-name"
              placeholder="e.g. Newton's First Law"
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
              {isLoading ? 'Saving...' : 'Add Topic'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
