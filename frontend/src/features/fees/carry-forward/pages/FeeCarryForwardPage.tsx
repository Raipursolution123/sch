import { useEffect, useMemo, useState } from 'react';
import { ArrowRightLeft } from 'lucide-react';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { FormField } from '@components/forms/FormField';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { Checkbox } from '@components/ui/checkbox';
import { Select } from '@components/ui/select';
import {
  firstSectionIdForClass,
  sectionOptionsForClass,
} from '@features/students/utils/class-section-options';
import { useCarryForwardFees, useFeeCarryForwardPreview } from '@hooks/useFeeStudentAssign';
import { useFeeAssignments } from '@hooks/useFeeAssignments';
import { useClasses } from '@hooks/useClasses';
import { useClassSections } from '@hooks/useClassSections';
import { useSessions } from '@hooks/useSessions';
import type { FeeCarryForwardRow } from '@app-types/fees/fee-student-assign';
import { formatAmount } from '@utils/format';
import { ModuleMarkGridPack } from '@workflow-packs';

export function FeeCarryForwardPage() {
  const { data: sessionsData } = useSessions();
  const sessions = sessionsData?.results || [];
  const { data: classesData } = useClasses();
  const classes = classesData?.results || [];
  const { data: classSectionsData } = useClassSections();
  const classSections = classSectionsData?.results || [];
  const { data: assignments = [] } = useFeeAssignments();

  const [fromSessionId, setFromSessionId] = useState(0);
  const [toSessionId, setToSessionId] = useState(0);
  const [classId, setClassId] = useState(0);
  const [sectionId, setSectionId] = useState(0);
  const [feeSessionGroupId, setFeeSessionGroupId] = useState(0);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const activeClasses = useMemo(
    () => classes.filter((c) => c.is_active === 'yes').sort((a, b) => a.sort_order - b.sort_order),
    [classes],
  );
  const sectionOptions = useMemo(
    () => sectionOptionsForClass(classSections, classId),
    [classSections, classId],
  );
  const targetAssignments = useMemo(
    () =>
      assignments.filter(
        (a) => a.is_active === 'yes' && a.session_id === toSessionId && a.class_id === classId,
      ),
    [assignments, toSessionId, classId],
  );

  const filtersReady =
    fromSessionId > 0 &&
    toSessionId > 0 &&
    fromSessionId !== toSessionId &&
    classId > 0 &&
    sectionId > 0;

  const {
    data: preview,
    isLoading,
    isError,
    error,
    refetch,
  } = useFeeCarryForwardPreview(fromSessionId, toSessionId, classId, sectionId, filtersReady);
  const carryMutation = useCarryForwardFees();

  useEffect(() => {
    if (sessions.length === 0) return;
    const active = sessions.find((s) => s.is_active === 'yes');
    if (toSessionId === 0 && active) setToSessionId(active.id);
    if (fromSessionId === 0) {
      const prior = sessions.find((s) => s.id !== (active?.id ?? 0));
      if (prior) setFromSessionId(prior.id);
    }
  }, [sessions, fromSessionId, toSessionId]);

  useEffect(() => {
    if (activeClasses.length > 0 && classId === 0) setClassId(activeClasses[0].id);
  }, [activeClasses, classId]);

  useEffect(() => {
    if (classId <= 0) return;
    const next = firstSectionIdForClass(classSections, classId);
    if (next && sectionId !== next) setSectionId(next);
  }, [classId, classSections, sectionId]);

  useEffect(() => {
    setFeeSessionGroupId(0);
  }, [toSessionId, classId]);

  useEffect(() => {
    if (targetAssignments.length > 0 && feeSessionGroupId === 0) {
      setFeeSessionGroupId(targetAssignments[0].id);
    }
  }, [targetAssignments, feeSessionGroupId]);

  useEffect(() => {
    if (!preview) return;
    setSelected(
      new Set(
        preview.students
          .filter((s) => s.has_target_enrollment && !s.already_carried)
          .map((s) => s.student_id),
      ),
    );
  }, [preview]);

  const students = preview?.students ?? [];
  const selectable = students.filter((s) => s.has_target_enrollment);
  const allSelected = selectable.length > 0 && selectable.every((s) => selected.has(s.student_id));

  const columns: DataTableColumn<FeeCarryForwardRow>[] = [
    {
      id: 'check',
      header: (
        <Checkbox
          checked={allSelected}
          onChange={(e) => {
            if (e.target.checked) {
              setSelected(new Set(selectable.map((s) => s.student_id)));
            } else {
              setSelected(new Set());
            }
          }}
          aria-label="Select all eligible students"
        />
      ),
      cell: (row) => (
        <Checkbox
          checked={selected.has(row.student_id)}
          disabled={!row.has_target_enrollment}
          onChange={(e) => {
            setSelected((prev) => {
              const next = new Set(prev);
              if (e.target.checked) next.add(row.student_id);
              else next.delete(row.student_id);
              return next;
            });
          }}
          aria-label={`Carry ${row.full_name}`}
        />
      ),
    },
    {
      id: 'student',
      header: 'Student',
      cellClassName: 'font-medium',
      cell: (r) => (
        <div>
          <span>{r.full_name}</span>
          <p className="text-xs font-normal text-muted-foreground">{r.admission_no}</p>
        </div>
      ),
    },
    {
      id: 'balance',
      header: 'Previous balance',
      cellClassName: 'tabular-nums',
      cell: (r) => formatAmount(r.previous_balance),
    },
    {
      id: 'target',
      header: 'Target enrollment',
      cell: (r) =>
        r.has_target_enrollment
          ? r.already_carried
            ? 'Already carried'
            : 'Ready'
          : 'Missing in target session',
    },
  ];

  return (
    <ModuleMarkGridPack
      title="Carry Forward"
      description="Move unpaid prior-session balances into the target session using a Fees Master structure."
      actions={
        <PermissionButton
          permission="fees.carry_forward"
          onClick={() => {
            if (!filtersReady || feeSessionGroupId <= 0 || selected.size === 0) return;
            carryMutation.mutate({
              from_session_id: fromSessionId,
              to_session_id: toSessionId,
              class_id: classId,
              section_id: sectionId,
              fee_session_group_id: feeSessionGroupId,
              student_ids: [...selected],
            });
          }}
          className="gap-1"
          disabled={
            !filtersReady || feeSessionGroupId <= 0 || selected.size === 0 || students.length === 0
          }
          isLoading={carryMutation.isPending}
        >
          <ArrowRightLeft className="h-4 w-4" aria-hidden="true" />
          Carry forward selected
        </PermissionButton>
      }
      filters={
        <>
          <FormField label="From session" htmlFor="cf_from">
            <Select
              id="cf_from"
              options={sessions.map((s) => ({ value: String(s.id), label: s.session }))}
              value={fromSessionId ? String(fromSessionId) : ''}
              onChange={(e) => setFromSessionId(Number(e.target.value))}
              placeholder="Previous session"
            />
          </FormField>
          <FormField label="To session" htmlFor="cf_to">
            <Select
              id="cf_to"
              options={sessions.map((s) => ({ value: String(s.id), label: s.session }))}
              value={toSessionId ? String(toSessionId) : ''}
              onChange={(e) => setToSessionId(Number(e.target.value))}
              placeholder="Target session"
            />
          </FormField>
          <FormField label="Class" htmlFor="cf_class">
            <Select
              id="cf_class"
              options={activeClasses.map((c) => ({
                value: String(c.id),
                label: c.class_name,
              }))}
              value={classId ? String(classId) : ''}
              onChange={(e) => setClassId(Number(e.target.value))}
              placeholder="Select class"
            />
          </FormField>
          <FormField label="Section" htmlFor="cf_section">
            <Select
              id="cf_section"
              options={sectionOptions}
              value={sectionId ? String(sectionId) : ''}
              onChange={(e) => setSectionId(Number(e.target.value))}
              placeholder="Select section"
            />
          </FormField>
          <FormField label="Target fee structure" htmlFor="cf_fsg">
            <Select
              id="cf_fsg"
              options={targetAssignments.map((a) => ({
                value: String(a.id),
                label: `${a.fee_group_name} · ${formatAmount(a.total_amount)}`,
              }))}
              value={feeSessionGroupId ? String(feeSessionGroupId) : ''}
              onChange={(e) => setFeeSessionGroupId(Number(e.target.value))}
              placeholder={
                targetAssignments.length
                  ? 'Select fee structure'
                  : 'No Fees Master structure for target session/class'
              }
              disabled={!filtersReady || targetAssignments.length === 0}
            />
          </FormField>
        </>
      }
      filtersReady={filtersReady}
      isLoading={isLoading}
      loadingMessage="Loading carry-forward preview..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && students.length === 0}
      emptyTitle="No balances to carry"
      emptyDescription="No students with unpaid prior-session balances were found for these filters."
    >
      <DataTable data={students} columns={columns} getRowKey={(r) => r.student_id} />
    </ModuleMarkGridPack>
  );
}
