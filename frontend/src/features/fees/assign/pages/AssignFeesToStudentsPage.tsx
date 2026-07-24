import { useEffect, useMemo, useState } from 'react';
import { Save } from 'lucide-react';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { FormField } from '@components/forms/FormField';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { Checkbox } from '@components/ui/checkbox';
import { Select } from '@components/ui/select';
import {
  useFeeStudentAssignRoster,
  useSaveFeeStudentAssignments,
} from '@hooks/useFeeStudentAssign';
import { useFeeAssignments } from '@hooks/useFeeAssignments';
import { useSections } from '@hooks/useSections';
import type { FeeStudentAssignRow } from '@app-types/fees/fee-student-assign';
import { formatAmount } from '@utils/format';
import { ModuleMarkGridPack } from '@workflow-packs';

export function AssignFeesToStudentsPage() {
  const { data: assignments = [], isLoading: loadingAssignments } = useFeeAssignments();
  const { data: sectionsData } = useSections();
  const sections = sectionsData?.results || [];
  const [feeSessionGroupId, setFeeSessionGroupId] = useState(0);
  const [sectionId, setSectionId] = useState(0);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const activeAssignments = useMemo(
    () => assignments.filter((a) => a.is_active === 'yes'),
    [assignments],
  );

  const filtersReady = feeSessionGroupId > 0;
  const {
    data: roster,
    isLoading,
    isError,
    error,
    refetch,
  } = useFeeStudentAssignRoster(
    feeSessionGroupId,
    sectionId > 0 ? sectionId : undefined,
    filtersReady,
  );
  const saveMutation = useSaveFeeStudentAssignments();

  useEffect(() => {
    if (activeAssignments.length > 0 && feeSessionGroupId === 0) {
      setFeeSessionGroupId(activeAssignments[0].id);
    }
  }, [activeAssignments, feeSessionGroupId]);

  useEffect(() => {
    if (!roster) return;
    setSelected(
      new Set(roster.students.filter((s) => s.assigned).map((s) => s.student_session_id)),
    );
  }, [roster]);

  const sectionOptions = useMemo(() => {
    const fromRoster = new Map<number, string>();
    for (const row of roster?.students ?? []) {
      if (row.section_id)
        fromRoster.set(row.section_id, row.section_name || `Section ${row.section_id}`);
    }
    if (fromRoster.size > 0) {
      return [
        { value: '0', label: 'All sections' },
        ...[...fromRoster.entries()].map(([id, name]) => ({
          value: String(id),
          label: name,
        })),
      ];
    }
    return [
      { value: '0', label: 'All sections' },
      ...sections
        .filter((s) => s.is_active === 'yes')
        .map((s) => ({ value: String(s.id), label: s.section_name })),
    ];
  }, [roster?.students, sections]);

  const students = roster?.students ?? [];
  const allSelected =
    students.length > 0 && students.every((s) => selected.has(s.student_session_id));

  const columns: DataTableColumn<FeeStudentAssignRow>[] = [
    {
      id: 'check',
      header: (
        <Checkbox
          checked={allSelected}
          onChange={(e) => {
            if (e.target.checked) {
              setSelected(new Set(students.map((s) => s.student_session_id)));
            } else {
              setSelected(new Set());
            }
          }}
          aria-label="Select all students"
        />
      ),
      cell: (row) => (
        <Checkbox
          checked={selected.has(row.student_session_id)}
          onChange={(e) => {
            setSelected((prev) => {
              const next = new Set(prev);
              if (e.target.checked) next.add(row.student_session_id);
              else next.delete(row.student_session_id);
              return next;
            });
          }}
          aria-label={`Assign ${row.full_name}`}
        />
      ),
    },
    {
      id: 'roll',
      header: 'Roll',
      cellClassName: 'tabular-nums text-muted-foreground',
      cell: (r) => (r.roll_no != null ? r.roll_no : '—'),
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
    { id: 'section', header: 'Section', cell: (r) => r.section_name || '—' },
    {
      id: 'status',
      header: 'Status',
      cell: (r) => (selected.has(r.student_session_id) ? 'Assigned' : 'Not assigned'),
    },
  ];

  return (
    <ModuleMarkGridPack
      title="Assign Fees"
      description="Map a Fees Master structure to enrolled students so balances appear in Collect Fees."
      actions={
        <PermissionButton
          permission="fees.student_assign"
          onClick={() => {
            if (!filtersReady) return;
            saveMutation.mutate({
              fee_session_group_id: feeSessionGroupId,
              section_id: sectionId > 0 ? sectionId : null,
              student_session_ids: [...selected],
            });
          }}
          className="gap-1"
          disabled={!filtersReady || students.length === 0}
          isLoading={saveMutation.isPending}
        >
          <Save className="h-4 w-4" aria-hidden="true" />
          Save assignments
        </PermissionButton>
      }
      prerequisiteHint={
        !loadingAssignments && activeAssignments.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Create an active fee structure under Fees Master before assigning it to students.
          </p>
        ) : roster ? (
          <p className="text-sm text-muted-foreground">
            {roster.class_name} · {roster.assignment.fee_group_name} · Total{' '}
            {formatAmount(roster.total_amount)}
          </p>
        ) : undefined
      }
      filters={
        <>
          <FormField label="Fee structure" htmlFor="assign_fee_structure">
            <Select
              id="assign_fee_structure"
              options={activeAssignments.map((a) => ({
                value: String(a.id),
                label: `${a.class_name} · ${a.fee_group_name} · ${a.session_name}`,
              }))}
              value={feeSessionGroupId ? String(feeSessionGroupId) : ''}
              onChange={(e) => {
                setFeeSessionGroupId(Number(e.target.value));
                setSectionId(0);
              }}
              placeholder="Select fee structure"
            />
          </FormField>
          <FormField label="Section filter" htmlFor="assign_fee_section">
            <Select
              id="assign_fee_section"
              options={sectionOptions}
              value={String(sectionId)}
              onChange={(e) => setSectionId(Number(e.target.value))}
              disabled={!filtersReady}
            />
          </FormField>
        </>
      }
      filtersReady={filtersReady}
      isLoading={isLoading}
      loadingMessage="Loading students..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && students.length === 0}
      emptyTitle="No students enrolled"
      emptyDescription="No active students found for this fee structure’s class and session."
    >
      <DataTable data={students} columns={columns} getRowKey={(r) => r.student_session_id} />
    </ModuleMarkGridPack>
  );
}
