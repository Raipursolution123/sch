import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2 } from 'lucide-react';
import { z } from 'zod';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { Combobox } from '@components/ui/combobox';
import { FormField } from '@components/forms/FormField';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { ModuleListPack } from '@workflow-packs';
import {
  useAssignBehaviourIncident,
  useBehaviourAssignments,
  useBehaviourIncidents,
  useDeleteBehaviourAssignment,
} from '@hooks/useBehaviour';
import { useActiveSession } from '@hooks/useSessions';
import { useStudents } from '@hooks/useStudents';
import type { BehaviourAssignment } from '@services/api/behaviour.service';

const schema = z.object({
  student_id: z.number().int().positive('Student is required'),
  incident_id: z.number().int().positive('Incident is required'),
});
type FormValues = z.infer<typeof schema>;

export function BehaviourAssignmentsPage() {
  const { data: activeSession } = useActiveSession();
  const sessionId = activeSession?.id;
  const { data = [], isLoading, isError, error, refetch } = useBehaviourAssignments(sessionId);
  const { data: incidents = [] } = useBehaviourIncidents();
  const { data: students = [] } = useStudents();
  const assignMutation = useAssignBehaviourIncident();
  const deleteMutation = useDeleteBehaviourAssignment();

  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BehaviourAssignment | null>(null);

  const { handleSubmit, reset, setValue, watch, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { student_id: 0, incident_id: 0 },
  });

  const studentId = watch('student_id');
  const incidentId = watch('incident_id');

  useEffect(() => {
    if (!open) return;
    reset({ student_id: 0, incident_id: 0 });
  }, [open, reset]);

  const studentOptions = useMemo(
    () =>
      students.map((s) => ({
        value: String(s.id),
        label: `${s.admission_no || s.id} — ${s.full_name || s.firstname || 'Student'}`,
      })),
    [students],
  );

  const incidentOptions = useMemo(
    () =>
      incidents.map((i) => ({
        value: String(i.id),
        label: `${i.title} (${i.point} pts)`,
      })),
    [incidents],
  );

  const filtered = data.filter((row) => {
    const q = search.toLowerCase();
    return (
      !q ||
      row.student_name.toLowerCase().includes(q) ||
      (row.admission_no || '').toLowerCase().includes(q) ||
      (row.incident_title || '').toLowerCase().includes(q)
    );
  });

  const addAction = (
    <PermissionButton
      permission="behaviour.create"
      onClick={() => setOpen(true)}
      className="gap-1"
      disabled={!sessionId}
    >
      <Plus className="h-4 w-4" />
      Assign Incident
    </PermissionButton>
  );

  const columns: DataTableColumn<BehaviourAssignment>[] = [
    {
      id: 'student',
      header: 'Student',
      cellClassName: 'font-medium',
      cell: (r) => `${r.admission_no || r.student_id} — ${r.student_name}`,
    },
    { id: 'incident', header: 'Incident', cell: (r) => r.incident_title || '—' },
    { id: 'points', header: 'Points', cell: (r) => r.incident_point ?? '—' },
    { id: 'created', header: 'Assigned', cell: (r) => r.created_at || '—' },
  ];

  return (
    <>
      <ModuleListPack
        title="Assign Behaviour Incidents"
        description="Assign incident types to students for the active academic session."
        actions={addAction}
        isLoading={isLoading}
        loadingMessage="Loading assignments..."
        isError={isError}
        error={error}
        onRetry={() => void refetch()}
        isEmpty={!isLoading && !isError && data.length === 0}
        emptyTitle="No assignments"
        emptyDescription="Assign an incident type to a student to start tracking behaviour."
        emptyAction={addAction}
      >
        <DataTable
          data={filtered}
          columns={columns}
          getRowKey={(r) => r.id}
          searchValue={search}
          onSearchChange={setSearch}
          actions={(row) => (
            <PermissionButton
              permission="behaviour.delete"
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => setDeleteTarget(row)}
            >
              <Trash2 className="h-4 w-4" />
            </PermissionButton>
          )}
        />
      </ModuleListPack>

      <EntityFormDialog
        open={open}
        onOpenChange={setOpen}
        title="Assign Incident"
        onSubmit={handleSubmit((values) => {
          if (!sessionId) return;
          assignMutation.mutate(
            {
              student_id: values.student_id,
              incident_id: values.incident_id,
              session_id: sessionId,
            },
            { onSuccess: () => setOpen(false) },
          );
        })}
        isLoading={assignMutation.isPending}
      >
        <FormErrorSummary errors={formState.errors} />
        <FormField label="Student" required>
          <Combobox
            value={studentId ? String(studentId) : ''}
            onValueChange={(v) => setValue('student_id', Number(v) || 0, { shouldValidate: true })}
            options={studentOptions}
            placeholder="Select student"
          />
        </FormField>
        <FormField label="Incident type" required>
          <Combobox
            value={incidentId ? String(incidentId) : ''}
            onValueChange={(v) => setValue('incident_id', Number(v) || 0, { shouldValidate: true })}
            options={incidentOptions}
            placeholder="Select incident"
          />
        </FormField>
      </EntityFormDialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(openState) => {
          if (!openState) setDeleteTarget(null);
        }}
        title="Remove assignment"
        description={
          deleteTarget
            ? `Remove "${deleteTarget.incident_title}" from ${deleteTarget.student_name}?`
            : ''
        }
        confirmLabel="Remove"
        destructive
        isLoading={deleteMutation.isPending}
        onConfirm={() => {
          if (deleteTarget) {
            deleteMutation.mutate(deleteTarget.id, {
              onSuccess: () => setDeleteTarget(null),
            });
          }
        }}
      />
    </>
  );
}
