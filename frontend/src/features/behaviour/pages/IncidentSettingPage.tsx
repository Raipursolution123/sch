import { useState, useEffect } from 'react';
import { useBehaviourSetting } from '@hooks/useBehaviour';
import { ModuleListPack } from '@workflow-packs';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Plus, X, Save } from 'lucide-react';
import { toast } from 'sonner';

export function IncidentSettingPage() {
  const { data: setting, isLoading, isError, error, refetch, updateSetting } = useBehaviourSetting();
  const [commentsList, setCommentsList] = useState<string[]>([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    if (setting?.comment_option) {
      try {
        const parsed = JSON.parse(setting.comment_option);
        if (Array.isArray(parsed)) {
          setCommentsList(parsed);
        }
      } catch (e) {
        console.error('Failed to parse comment options:', e);
      }
    }
  }, [setting]);

  const handleAddComment = () => {
    const trimmed = newComment.trim();
    if (!trimmed) return;
    if (commentsList.includes(trimmed)) {
      toast.warning('This comment option already exists.');
      return;
    }
    setCommentsList([...commentsList, trimmed]);
    setNewComment('');
  };

  const handleRemoveComment = (item: string) => {
    setCommentsList(commentsList.filter((c) => c !== item));
  };

  const handleSave = async () => {
    try {
      await updateSetting({
        comment_option: JSON.stringify(commentsList),
      });
      toast.success('Behaviour settings updated successfully.');
    } catch (e) {
      console.error(e);
      toast.error('Failed to save settings.');
    }
  };

  return (
    <ModuleListPack
      title="Behaviour Settings"
      description="Configure options and tags for student behavioral comment templates."
      isLoading={isLoading}
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
    >
      <div className="max-w-2xl">
        <div className="rounded-lg border bg-card shadow-sm">
          <div className="p-6 pb-4 border-b">
            <h3 className="text-lg font-semibold leading-none tracking-tight">Comment Templates</h3>
            <p className="text-sm text-muted-foreground mt-1.5">
              Configure default quick-select tags that teachers and staff can choose when entering remarks.
            </p>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex gap-2">
              <Input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="e.g. Excellent participation, Shows leadership"
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
              />
              <Button onClick={handleAddComment} className="gap-1">
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Active Templates</Label>
              <div className="flex flex-wrap gap-2">
                {commentsList.length === 0 ? (
                  <span className="text-sm text-muted-foreground">No template tags added. Add some above.</span>
                ) : (
                  commentsList.map((tag) => (
                    <div
                      key={tag}
                      className="flex items-center gap-1.5 rounded-full bg-primary-pale px-3 py-1 text-sm font-medium text-ink"
                    >
                      <span>{tag}</span>
                      <button
                        onClick={() => handleRemoveComment(tag)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button onClick={handleSave} className="gap-1">
                <Save className="h-4 w-4" />
                Save Settings
              </Button>
            </div>
          </div>
        </div>
      </div>
    </ModuleListPack>
  );
}

// Inline label helper for clean compile
function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>;
}
