import { useState } from 'react';
import { useSessions, useActiveSession } from '@hooks/useSessions';
import { useSubjectGroups, useSubjectGroup } from '@hooks/useSubjectGroups';
import { useCopyOldLessons } from '@hooks/useLessons';
import { Button } from '@components/ui/button';
import { Select } from '@components/ui/select';
import { Label } from '@components/ui/label';

export function CopyOldLessonsPage() {
  const { data: sessionsData, isLoading: isLoadingSessions } = useSessions();
  const sessions = sessionsData?.results || [];

  const { data: activeSession } = useActiveSession();
  const currentSessionId = activeSession?.id;

  // Source selections state
  const [fromSessionId, setFromSessionId] = useState<number | null>(null);
  const [fromSubjectGroupId, setFromSubjectGroupId] = useState<number | null>(null);
  const [fromSubjectId, setFromSubjectId] = useState<number | null>(null);

  // Target selections state
  const [toSessionId, setToSessionId] = useState<number | null>(currentSessionId || null);
  const [toSubjectGroupId, setToSubjectGroupId] = useState<number | null>(null);
  const [toSubjectId, setToSubjectId] = useState<number | null>(null);

  // Fetch subject groups for source and target
  const { data: fromGroupsData, isLoading: isLoadingFromGroups } = useSubjectGroups(fromSessionId || undefined);
  const fromGroups = fromGroupsData?.results || [];

  const { data: toGroupsData, isLoading: isLoadingToGroups } = useSubjectGroups(toSessionId || undefined);
  const toGroups = toGroupsData?.results || [];

  // Fetch subjects for source and target
  const { data: fromGroupDetail, isLoading: isLoadingFromDetail } = useSubjectGroup(
    fromSubjectGroupId,
    !!fromSubjectGroupId
  );
  const fromSubjects = fromGroupDetail?.subjects || [];

  const { data: toGroupDetail, isLoading: isLoadingToDetail } = useSubjectGroup(
    toSubjectGroupId,
    !!toSubjectGroupId
  );
  const toSubjects = toGroupDetail?.subjects || [];

  const copyMutation = useCopyOldLessons();

  const handleCopy = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !fromSessionId ||
      !fromSubjectGroupId ||
      !fromSubjectId ||
      !toSessionId ||
      !toSubjectGroupId ||
      !toSubjectId
    ) {
      return;
    }

    copyMutation.mutate({
      from_session_id: fromSessionId,
      from_subject_group_id: fromSubjectGroupId,
      from_subject_id: fromSubjectId,
      to_session_id: toSessionId,
      to_subject_group_id: toSubjectGroupId,
      to_subject_id: toSubjectId,
    });
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Copy Old Lessons</h1>
        <p className="text-sm text-muted-foreground">
          Copy lesson plan syllabus structures and topics from a prior academic session to the current session.
        </p>
      </div>

      <form onSubmit={handleCopy} className="bg-card border rounded-lg p-6 space-y-8 shadow-sm">
        {/* Source and Target Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Source Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-medium border-b pb-2 text-foreground">Source (From)</h2>

            <div className="space-y-2">
              <Label>Session *</Label>
              <Select
                value={fromSessionId ? String(fromSessionId) : ''}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setFromSessionId(isNaN(val) ? null : val);
                  setFromSubjectGroupId(null);
                  setFromSubjectId(null);
                }}
                required
                disabled={isLoadingSessions}
                placeholder="Select Source Session"
                options={sessions.map((s) => ({ value: String(s.id), label: s.session }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Subject Group *</Label>
              <Select
                value={fromSubjectGroupId ? String(fromSubjectGroupId) : ''}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setFromSubjectGroupId(isNaN(val) ? null : val);
                  setFromSubjectId(null);
                }}
                required
                disabled={!fromSessionId || isLoadingFromGroups}
                placeholder="Select Subject Group"
                options={fromGroups.map((g) => ({ value: String(g.id), label: g.name }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Subject *</Label>
              <Select
                value={fromSubjectId ? String(fromSubjectId) : ''}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setFromSubjectId(isNaN(val) ? null : val);
                }}
                required
                disabled={!fromSubjectGroupId || isLoadingFromDetail}
                placeholder="Select Subject"
                options={fromSubjects.map((s) => ({ value: String(s.id), label: s.name }))}
              />
            </div>
          </div>

          {/* Target Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-medium border-b pb-2 text-foreground">Target (To)</h2>

            <div className="space-y-2">
              <Label>Session *</Label>
              <Select
                value={toSessionId ? String(toSessionId) : ''}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setToSessionId(isNaN(val) ? null : val);
                  setToSubjectGroupId(null);
                  setToSubjectId(null);
                }}
                required
                disabled={isLoadingSessions}
                placeholder="Select Target Session"
                options={sessions.map((s) => ({ value: String(s.id), label: s.session }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Subject Group *</Label>
              <Select
                value={toSubjectGroupId ? String(toSubjectGroupId) : ''}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setToSubjectGroupId(isNaN(val) ? null : val);
                  setToSubjectId(null);
                }}
                required
                disabled={!toSessionId || isLoadingToGroups}
                placeholder="Select Subject Group"
                options={toGroups.map((g) => ({ value: String(g.id), label: g.name }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Subject *</Label>
              <Select
                value={toSubjectId ? String(toSubjectId) : ''}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setToSubjectId(isNaN(val) ? null : val);
                }}
                required
                disabled={!toSubjectGroupId || isLoadingToDetail}
                placeholder="Select Subject"
                options={toSubjects.map((s) => ({ value: String(s.id), label: s.name }))}
              />
            </div>
          </div>
        </div>

        {/* Submit Action */}
        <div className="flex justify-end border-t pt-4">
          <Button
            type="submit"
            disabled={
              copyMutation.isPending ||
              !fromSessionId ||
              !fromSubjectGroupId ||
              !fromSubjectId ||
              !toSessionId ||
              !toSubjectGroupId ||
              !toSubjectId
            }
          >
            {copyMutation.isPending ? 'Copying...' : 'Copy Lessons & Topics'}
          </Button>
        </div>
      </form>
    </div>
  );
}
