import { useEffect, useMemo, useState } from 'react';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { Checkbox } from '@components/ui/checkbox';
import { FormField } from '@components/forms/FormField';
import { Select } from '@components/ui/select';
import { PromotePreviewTable } from '@features/academics/promote/components/PromotePreviewTable';
import { useActiveSession, useSessions } from '@features/academics/sessions/hooks/useSessions';
import { useClassSections } from '@hooks/useClassSections';
import { useClasses } from '@hooks/useClasses';
import { useExecutePromote, usePromotePreview } from '@hooks/usePromoteStudents';
import { useSubjectGroups } from '@hooks/useSubjectGroups';
import type { PromotePreviewParams } from '@app-types/academics/promote';

const STEPS = ['Source', 'Target', 'Preview', 'Confirm'] as const;
type Step = (typeof STEPS)[number];

export function PromoteWizard() {
  const { data: activeSessionData } = useActiveSession();
  const activeSessionId = activeSessionData?.id;
  const { data: sessionsData } = useSessions();
  const sessions = sessionsData?.results ?? [];

  const { data: classesData } = useClasses();
  const classes = (classesData?.results ?? []).filter((c) => c.is_active === 'yes');

  const { data: classSectionsData } = useClassSections(1, { noPaginate: true });
  const classSections = (classSectionsData?.results ?? []).filter((m) => m.is_active === 'yes');

  const [step, setStep] = useState<Step>('Source');

  const [fromSessionId, setFromSessionId] = useState<number | undefined>(undefined);
  const [fromClassId, setFromClassId] = useState<number | undefined>(undefined);
  const [fromSectionId, setFromSectionId] = useState<number | undefined>(undefined);

  const [toSessionId, setToSessionId] = useState<number | undefined>(undefined);
  const [toClassId, setToClassId] = useState<number | undefined>(undefined);
  const [toSectionId, setToSectionId] = useState<number | undefined>(undefined);
  const [toSubjectGroupId, setToSubjectGroupId] = useState<number | undefined>(undefined);

  const [deactivateSource, setDeactivateSource] = useState(true);
  const [markAlumni, setMarkAlumni] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);

  useEffect(() => {
    if (fromSessionId === undefined && activeSessionId) {
      setFromSessionId(activeSessionId);
    }
  }, [activeSessionId, fromSessionId]);

  const { data: subjectGroupsData } = useSubjectGroups(toSessionId);
  const subjectGroups = subjectGroupsData?.results ?? [];

  const fromSectionOptions = useMemo(() => {
    if (fromClassId === undefined) return [];
    const seen = new Map<number, string>();
    for (const row of classSections) {
      if (row.class_id !== fromClassId) continue;
      seen.set(row.section_id, row.section_name);
    }
    return Array.from(seen.entries())
      .map(([value, label]) => ({ value: String(value), label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [classSections, fromClassId]);

  const toSectionOptions = useMemo(() => {
    if (toClassId === undefined) return [];
    const seen = new Map<number, string>();
    for (const row of classSections) {
      if (row.class_id !== toClassId) continue;
      seen.set(row.section_id, row.section_name);
    }
    return Array.from(seen.entries())
      .map(([value, label]) => ({ value: String(value), label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [classSections, toClassId]);

  const previewParams: PromotePreviewParams | null = useMemo(() => {
    if (
      fromSessionId === undefined ||
      fromClassId === undefined ||
      fromSectionId === undefined ||
      toSessionId === undefined ||
      toClassId === undefined ||
      toSectionId === undefined
    ) {
      return null;
    }
    return {
      from_session_id: fromSessionId,
      from_class_id: fromClassId,
      from_section_id: fromSectionId,
      to_session_id: toSessionId,
      to_class_id: toClassId,
      to_section_id: toSectionId,
    };
  }, [fromSessionId, fromClassId, fromSectionId, toSessionId, toClassId, toSectionId]);

  const {
    data: preview,
    isLoading: previewLoading,
    isError: previewError,
    error: previewErrorObj,
    refetch: refetchPreview,
  } = usePromotePreview(step === 'Preview' || step === 'Confirm' ? previewParams : null);

  useEffect(() => {
    if (!preview) return;
    const eligible = preview.students.filter((s) => s.eligible).map((s) => s.student_id);
    setSelectedStudentIds(eligible);
  }, [preview]);

  const executeMutation = useExecutePromote();

  const sessionOptions = sessions.map((s) => ({
    value: String(s.id),
    label: s.session,
  }));

  const classOptions = classes.map((c) => ({
    value: String(c.id),
    label: c.class_name,
  }));

  const targetClassSectionIds = useMemo(() => {
    if (toClassId === undefined) return [];
    if (toSectionId !== undefined) {
      const cs = classSections.find((cs) => cs.class_id === toClassId && cs.section_id === toSectionId);
      return cs ? [cs.id] : [];
    }
    return classSections.filter((cs) => cs.class_id === toClassId).map((cs) => cs.id);
  }, [classSections, toClassId, toSectionId]);

  const subjectGroupOptions = useMemo(() => {
    const defaultOption = { value: '', label: 'None (optional)' };
    if (toClassId === undefined) return [defaultOption];

    const filtered = subjectGroups.filter((g) => {
      if (!g.class_section_ids) return true;
      if (g.class_section_ids.length === 0) return false;
      return g.class_section_ids.some((id) => targetClassSectionIds.includes(Number(id)));
    });

    return [
      defaultOption,
      ...filtered.map((g) => ({ value: String(g.id), label: g.name })),
    ];
  }, [subjectGroups, toClassId, targetClassSectionIds]);

  const debugInfo = JSON.stringify({
    toClassId,
    toSectionId,
    targetClassSectionIds,
    subjectGroupsCount: subjectGroups.length,
    subjectGroupClassSectionIds: subjectGroups.map(g => g.class_section_ids),
    classSectionsCount: classSections.length,
  });

  const sourceReady =
    fromSessionId !== undefined && fromClassId !== undefined && fromSectionId !== undefined;

  const targetReady =
    toSessionId !== undefined &&
    toClassId !== undefined &&
    toSectionId !== undefined &&
    fromSessionId !== toSessionId;

  const handleToggleStudent = (studentId: number, checked: boolean) => {
    setSelectedStudentIds((prev) =>
      checked ? [...prev, studentId] : prev.filter((id) => id !== studentId),
    );
  };

  const handleToggleAll = (checked: boolean) => {
    if (!preview) return;
    if (!checked) {
      setSelectedStudentIds([]);
      return;
    }
    setSelectedStudentIds(preview.students.filter((s) => s.eligible).map((s) => s.student_id));
  };

  const handleExecute = () => {
    if (!previewParams || selectedStudentIds.length === 0) return;
    executeMutation.mutate(
      {
        ...previewParams,
        to_subject_group_id: toSubjectGroupId ?? null,
        student_ids: selectedStudentIds,
        deactivate_source: deactivateSource,
        mark_alumni: markAlumni,
      },
      {
        onSuccess: () => {
          setStep('Source');
          setFromClassId(undefined);
          setFromSectionId(undefined);
          setToSessionId(undefined);
          setToClassId(undefined);
          setToSectionId(undefined);
          setToSubjectGroupId(undefined);
          setSelectedStudentIds([]);
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {STEPS.map((label, index) => {
          const active = step === label;
          const done = STEPS.indexOf(step) > index;
          return (
            <div
              key={label}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                active
                  ? 'bg-primary text-primary-foreground'
                  : done
                    ? 'bg-muted text-foreground'
                    : 'bg-muted/50 text-muted-foreground'
              }`}
            >
              {index + 1}. {label}
            </div>
          );
        })}
      </div>

      {step === 'Source' && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Select the session, class, and section students are moving from.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            <FilterSelect
              label="Source session"
              options={sessionOptions}
              value={fromSessionId}
              onChange={(v) => {
                setFromSessionId(v);
                setFromClassId(undefined);
                setFromSectionId(undefined);
              }}
            />
            <FilterSelect
              label="Source class"
              options={classOptions}
              value={fromClassId}
              onChange={(v) => {
                setFromClassId(v);
                setFromSectionId(undefined);
              }}
            />
            <FilterSelect
              label="Source section"
              options={fromSectionOptions}
              value={fromSectionId}
              onChange={setFromSectionId}
              disabled={fromClassId === undefined}
            />
          </div>
          <div className="flex justify-end">
            <PermissionButton
              permission="promote_students.view"
              onClick={() => setStep('Target')}
              disabled={!sourceReady}
            >
              Next: Target
            </PermissionButton>
          </div>
        </div>
      )}

      {step === 'Target' && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Select where students will be enrolled in the new session.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <FilterSelect
              label="Target session"
              options={sessionOptions.filter((o) => o.value !== String(fromSessionId))}
              value={toSessionId}
              onChange={(v) => {
                setToSessionId(v);
                setToSubjectGroupId(undefined);
              }}
            />
            <FilterSelect
              label="Target class"
              options={classOptions}
              value={toClassId}
              onChange={(v) => {
                setToClassId(v);
                setToSectionId(undefined);
              }}
            />
            <FilterSelect
              label="Target section"
              options={toSectionOptions}
              value={toSectionId}
              onChange={setToSectionId}
              disabled={toClassId === undefined}
            />
            <FilterSelect
              label="Subject group"
              options={subjectGroupOptions}
              value={toSubjectGroupId}
              onChange={(v) => setToSubjectGroupId(v)}
              disabled={toSessionId === undefined}
            />
          </div>
          <div className="flex justify-between">
            <PermissionButton
              permission="promote_students.view"
              variant="outline"
              onClick={() => setStep('Source')}
            >
              Back
            </PermissionButton>
            <PermissionButton
              permission="promote_students.view"
              onClick={() => setStep('Preview')}
              disabled={!targetReady}
            >
              Next: Preview
            </PermissionButton>
          </div>
        </div>
      )}

      {step === 'Preview' && (
        <div className="space-y-4">
          {previewLoading && <p className="text-sm text-muted-foreground">Loading preview…</p>}
          {previewError && (
            <p className="text-sm text-destructive">
              {(previewErrorObj as Error)?.message ?? 'Failed to load preview'}
            </p>
          )}
          {preview && (
            <>
              <div className="grid gap-2 text-sm sm:grid-cols-3">
                <div className="rounded-md border p-3">
                  <div className="text-muted-foreground">Eligible</div>
                  <div className="text-lg font-semibold">{preview.eligible_count}</div>
                </div>
                <div className="rounded-md border p-3">
                  <div className="text-muted-foreground">Already in target</div>
                  <div className="text-lg font-semibold">{preview.already_in_target_count}</div>
                </div>
                <div className="rounded-md border p-3">
                  <div className="text-muted-foreground">Inactive skipped</div>
                  <div className="text-lg font-semibold">{preview.inactive_skipped_count}</div>
                </div>
              </div>
              {preview.warnings.length > 0 && (
                <ul className="list-disc space-y-1 pl-5 text-sm text-amber-800">
                  {preview.warnings.map((w) => (
                    <li key={w}>{w}</li>
                  ))}
                </ul>
              )}
              <PromotePreviewTable
                students={preview.students}
                selectedIds={selectedStudentIds}
                onToggle={handleToggleStudent}
                onToggleAll={handleToggleAll}
              />
            </>
          )}
          <div className="flex justify-between">
            <PermissionButton
              permission="promote_students.view"
              variant="outline"
              onClick={() => setStep('Target')}
            >
              Back
            </PermissionButton>
            <PermissionButton
              permission="promote_students.view"
              onClick={() => setStep('Confirm')}
              disabled={!preview || selectedStudentIds.length === 0}
            >
              Next: Confirm
            </PermissionButton>
          </div>
        </div>
      )}

      {step === 'Confirm' && (
        <div className="space-y-4">
          <div className="space-y-2 rounded-md border p-4 text-sm">
            <p>
              Promote <strong>{selectedStudentIds.length}</strong> student(s) to the target
              session/class-section.
            </p>
            {toSubjectGroupId && (
              <p className="text-muted-foreground">
                Assigned Subject Group: <strong>{subjectGroups.find(g => g.id === toSubjectGroupId)?.name || 'Unknown'}</strong>
              </p>
            )}
            <label className="flex items-center gap-2 mt-4">
              <Checkbox
                checked={deactivateSource}
                onChange={(e) => setDeactivateSource(e.target.checked)}
              />
              Deactivate source enrollment (recommended)
            </label>
            <label className="flex items-center gap-2">
              <Checkbox
                checked={markAlumni}
                onChange={(e) => setMarkAlumni(e.target.checked)}
                disabled={!deactivateSource}
              />
              Mark source enrollment as alumni (final-year graduates)
            </label>
          </div>
          <div className="flex justify-between">
            <PermissionButton
              permission="promote_students.view"
              variant="outline"
              onClick={() => setStep('Preview')}
            >
              Back
            </PermissionButton>
            <PermissionButton
              permission="promote_students.create"
              onClick={handleExecute}
              disabled={executeMutation.isPending || selectedStudentIds.length === 0}
            >
              {executeMutation.isPending ? 'Promoting…' : 'Promote students'}
            </PermissionButton>
          </div>
        </div>
      )}

      {(step === 'Preview' || step === 'Confirm') && previewParams && (
        <button
          type="button"
          className="text-xs text-muted-foreground underline"
          onClick={() => void refetchPreview()}
        >
          Refresh preview
        </button>
      )}
    </div>
  );
}

interface FilterSelectProps {
  label: string;
  options: Array<{ value: string; label: string }>;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  disabled?: boolean;
}

function FilterSelect({ label, options, value, onChange, disabled }: FilterSelectProps) {
  const id = useMemo(() => `promote_${label.toLowerCase().replace(/\s+/g, '_')}`, [label]);
  return (
    <FormField label={label} htmlFor={id}>
      <Select
        id={id}
        options={options}
        placeholder={`Select ${label.toLowerCase()}`}
        value={value !== undefined ? String(value) : ''}
        onChange={(e) => {
          const raw = e.target.value;
          onChange(raw === '' ? undefined : Number(raw));
        }}
        disabled={disabled}
      />
    </FormField>
  );
}
