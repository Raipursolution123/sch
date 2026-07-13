import { useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { Select } from '@components/ui/select';
import { SubjectGroupFormDialog } from '@features/academics/subject-groups/components/SubjectGroupFormDialog';
import { SubjectGroupsTable } from '@features/academics/subject-groups/components/SubjectGroupsTable';
import type { SubjectGroupDetailsValues } from '@features/academics/subject-groups/schemas/subject-group.schema';
import { useActiveSession, useSessions } from '@features/academics/sessions/hooks/useSessions';
import {
  useCreateSubjectGroup,
  useDeleteSubjectGroup,
  useSubjectGroup,
  useSubjectGroups,
  useSyncSubjectGroupClassSections,
  useSyncSubjectGroupSubjects,
  useUpdateSubjectGroup,
} from '@hooks/useSubjectGroups';
import { useClassSections } from '@hooks/useClassSections';
import { useSubjects } from '@hooks/useSubjects';
import type { SubjectGroup } from '@app-types/academics/subject-group';
import { ModuleListPack } from '@workflow-packs';

type DialogMode = 'create' | 'edit' | null;

export function SubjectGroupsPage() {
  const [page, setPage] = useState(1);
  const { data: activeSessionData } = useActiveSession();
  const activeSessionId = activeSessionData?.id;

  const { data: sessionsData } = useSessions();
  const sessions = sessionsData?.results ?? [];

  const [sessionFilter, setSessionFilter] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (sessionFilter === undefined && activeSessionId) {
      setSessionFilter(activeSessionId);
    }
  }, [activeSessionId, sessionFilter]);

  const sessionId = sessionFilter ?? activeSessionId;

  const {
    data: groupsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useSubjectGroups(sessionId, page);
  const groups = groupsData?.results;
  const count = groupsData?.count ?? 0;

  const { data: subjectsData } = useSubjects();
  const subjects = subjectsData?.results ?? [];

  const { data: classSectionsData } = useClassSections();
  const classSections = classSectionsData?.results ?? [];

  const createMutation = useCreateSubjectGroup();
  const updateMutation = useUpdateSubjectGroup();
  const deleteMutation = useDeleteSubjectGroup();
  const syncSubjectsMutation = useSyncSubjectGroupSubjects();
  const syncClassSectionsMutation = useSyncSubjectGroupClassSections();

  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SubjectGroup | null>(null);

  const { data: selectedGroupDetail } = useSubjectGroup(
    selectedGroupId,
    dialogMode === 'edit' && selectedGroupId !== null,
  );

  const selectedGroup = useMemo(() => {
    if (dialogMode !== 'edit' || !selectedGroupId) return null;
    return selectedGroupDetail ?? groups?.find((g) => g.id === selectedGroupId) ?? null;
  }, [dialogMode, selectedGroupId, selectedGroupDetail, groups]);

  const sessionOptions = useMemo(
    () => sessions.map((s) => ({ value: String(s.id), label: s.session })),
    [sessions],
  );

  const closeDialog = () => {
    setDialogMode(null);
    setSelectedGroupId(null);
  };

  const handleCreate = (
    values: SubjectGroupDetailsValues & {
      subject_ids?: number[];
      class_section_ids?: number[];
    },
  ) => {
    createMutation.mutate(
      {
        name: values.name,
        session_id: values.session_id,
        description: values.description || null,
        subject_ids: values.subject_ids,
        class_section_ids: values.class_section_ids,
      },
      {
        onSuccess: () => {
          closeDialog();
        },
      },
    );
  };

  const handleUpdateDetails = (values: SubjectGroupDetailsValues) => {
    if (!selectedGroup) return;
    updateMutation.mutate(
      {
        id: selectedGroup.id,
        payload: {
          name: values.name,
          description: values.description || null,
        },
      },
      { onSuccess: closeDialog },
    );
  };

  const handleSyncSubjects = (subjectIds: number[]) => {
    if (!selectedGroup) return;
    syncSubjectsMutation.mutate(
      { id: selectedGroup.id, payload: { subject_ids: subjectIds } },
      { onSuccess: closeDialog },
    );
  };

  const handleSyncClassSections = (classSectionIds: number[]) => {
    if (!selectedGroup) return;
    syncClassSectionsMutation.mutate(
      { id: selectedGroup.id, payload: { class_section_ids: classSectionIds } },
      { onSuccess: closeDialog },
    );
  };

  const isFormLoading =
    createMutation.isPending ||
    updateMutation.isPending ||
    syncSubjectsMutation.isPending ||
    syncClassSectionsMutation.isPending;

  const canCreate = sessionId !== undefined && sessions.length > 0;

  const addAction = (
    <PermissionButton
      permission="subject_groups.create"
      onClick={() => setDialogMode('create')}
      className="gap-1"
      disabled={!canCreate}
      title={canCreate ? undefined : 'Configure academic sessions first'}
    >
      <Plus className="h-4 w-4" aria-hidden="true" />
      Add Subject Group
    </PermissionButton>
  );

  const sessionFilterControl = (
    <div className="flex items-center gap-2">
      <label htmlFor="subject-group-session" className="text-sm text-muted-foreground">
        Session
      </label>
      <Select
        id="subject-group-session"
        className="w-44"
        options={sessionOptions}
        value={sessionId ? String(sessionId) : ''}
        onChange={(e) => {
          setSessionFilter(Number(e.target.value));
          setPage(1);
        }}
        disabled={sessionOptions.length === 0}
      />
    </div>
  );

  return (
    <ModuleListPack
      title="Subject Groups"
      description="Bundle subjects and assign them to class sections for a given academic session."
      actions={
        <div className="flex flex-wrap items-center gap-3">
          {sessionFilterControl}
          {addAction}
        </div>
      }
      isLoading={isLoading}
      loadingMessage="Loading subject groups..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && groups?.length === 0}
      emptyTitle="No subject groups for this session"
      emptyDescription="Create a group, then assign subjects and class sections."
      emptyAction={canCreate ? addAction : undefined}
      footer={
        <>
          <SubjectGroupFormDialog
            open={dialogMode !== null}
            onOpenChange={(open) => {
              if (!open) closeDialog();
            }}
            group={dialogMode === 'edit' ? selectedGroup : null}
            sessions={sessions}
            subjects={subjects}
            classSections={classSections}
            defaultSessionId={sessionId}
            onCreate={handleCreate}
            onUpdateDetails={handleUpdateDetails}
            onSyncSubjects={handleSyncSubjects}
            onSyncClassSections={handleSyncClassSections}
            isLoading={isFormLoading}
          />

          <ConfirmDialog
            open={Boolean(deleteTarget)}
            onOpenChange={(open) => {
              if (!open) setDeleteTarget(null);
            }}
            title="Delete subject group?"
            description={
              deleteTarget
                ? `Delete "${deleteTarget.name}"? This cannot be undone if no students or timetable entries reference it.`
                : ''
            }
            confirmLabel="Delete"
            destructive
            onConfirm={() => {
              if (!deleteTarget) return;
              deleteMutation.mutate(deleteTarget.id, {
                onSuccess: () => setDeleteTarget(null),
              });
            }}
            isLoading={deleteMutation.isPending}
          />
        </>
      }
    >
      <SubjectGroupsTable
        groups={groups ?? []}
        pagination={{
          page,
          pageSize: 10,
          totalCount: count,
          onPageChange: setPage,
        }}
        onEdit={(group) => {
          setSelectedGroupId(group.id);
          setDialogMode('edit');
        }}
        onDelete={setDeleteTarget}
      />
    </ModuleListPack>
  );
}
