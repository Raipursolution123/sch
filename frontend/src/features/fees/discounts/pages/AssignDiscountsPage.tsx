import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FormField } from '@components/forms/FormField';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { Combobox } from '@components/ui/combobox';
import { Input } from '@components/ui/input';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { AssignDiscountsTable } from '@features/fees/discounts/components/AssignDiscountsTable';
import {
  firstSectionIdForClass,
  sectionOptionsForClass,
} from '@features/students/utils/class-section-options';
import {
  useAssignFeeDiscount,
  useFeeDiscountAssignRoster,
  useUnassignFeeDiscount,
} from '@hooks/useFeeDiscountAssignments';
import { useClasses } from '@hooks/useClasses';
import { useClassSections } from '@hooks/useClassSections';
import { useFeeDiscounts } from '@hooks/useFeeDiscounts';
import type { FeeDiscountAssignRosterStudent } from '@app-types/fees/fee-discount-assignment';
import { ModuleMarkGridPack } from '@workflow-packs';

export function AssignDiscountsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: classesData } = useClasses();
  const classes = classesData?.results || [];
  const { data: classSectionsData } = useClassSections(1, { noPaginate: true });
  const classSections = classSectionsData?.results || [];
  const { data: discounts = [] } = useFeeDiscounts();

  const activeDiscounts = useMemo(
    () =>
      discounts.filter((d) => d.is_active === 'yes').sort((a, b) => a.name.localeCompare(b.name)),
    [discounts],
  );

  const [discountId, setDiscountId] = useState(0);
  const [classId, setClassId] = useState(0);
  const [sectionId, setSectionId] = useState(0);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [unassignTarget, setUnassignTarget] = useState<FeeDiscountAssignRosterStudent | null>(null);

  const activeClasses = useMemo(
    () => classes.filter((c) => c.is_active === 'yes').sort((a, b) => a.sort_order - b.sort_order),
    [classes],
  );

  const sectionOptions = useMemo(
    () => sectionOptionsForClass(classSections, classId),
    [classSections, classId],
  );

  const filtersReady = discountId > 0 && classId > 0 && sectionId > 0;
  const {
    data: roster,
    isLoading,
    isError,
    error,
    refetch,
  } = useFeeDiscountAssignRoster(classId, sectionId, discountId, filtersReady);

  const assignMutation = useAssignFeeDiscount();
  const unassignMutation = useUnassignFeeDiscount();

  useEffect(() => {
    if (discountId > 0) return;
    const fromQuery = Number(searchParams.get('discount_id') || 0);
    if (fromQuery > 0) {
      setDiscountId(fromQuery);
      return;
    }
    if (activeDiscounts.length > 0) {
      setDiscountId(activeDiscounts[0].id);
    }
  }, [searchParams, activeDiscounts, discountId]);

  useEffect(() => {
    if (activeClasses.length > 0 && classId === 0) {
      const initialClassId = activeClasses[0].id;
      setClassId(initialClassId);
      const initialSectionId = firstSectionIdForClass(classSections, initialClassId);
      if (initialSectionId) {
        setSectionId(initialSectionId);
      }
    }
  }, [activeClasses, classId]);

  useEffect(() => {
    if (classId <= 0) {
      setSectionId(0);
      return;
    }
    const next = firstSectionIdForClass(classSections, classId);
    setSectionId(next ?? 0);
  }, [classId, classSections]);

  useEffect(() => {
    setSelectedIds([]);
  }, [discountId, classId, sectionId, roster?.students]);

  const canAssign =
    activeDiscounts.length > 0 &&
    activeClasses.length > 0 &&
    classSections.some((row) => row.is_active === 'yes');

  const handleToggle = (studentSessionId: number, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...prev, studentSessionId] : prev.filter((id) => id !== studentSessionId),
    );
  };

  const handleToggleAll = (checked: boolean) => {
    if (!roster) return;
    if (!checked) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds(
      roster.students.filter((row) => !row.is_assigned).map((row) => row.student_session_id),
    );
  };

  const handleAssign = () => {
    if (!discountId || selectedIds.length === 0) return;
    assignMutation.mutate(
      {
        fees_discount_id: discountId,
        student_session_ids: selectedIds,
      },
      { onSuccess: () => setSelectedIds([]) },
    );
  };

  const assignButton = (
    <PermissionButton
      permission="fees.manage"
      className="min-h-11"
      disabled={selectedIds.length === 0 || assignMutation.isPending}
      isLoading={assignMutation.isPending}
      onClick={handleAssign}
    >
      Assign selected ({selectedIds.length})
    </PermissionButton>
  );

  return (
    <>
      <ModuleMarkGridPack
        title="Assign Discounts"
        description="Select an active discount plan, then assign it to students by class and section."
        prerequisiteHint={
          !canAssign ? (
            <p className="text-sm text-muted-foreground">
              Create an active fee discount and configure class-section mappings before assigning.
            </p>
          ) : undefined
        }
        filters={
          <>
            <FormField label="Discount" htmlFor="assign_discount">
              <Combobox
                id="assign_discount"
                placeholder="Select discount"
                searchPlaceholder="Search discount…"
                options={activeDiscounts.map((d) => ({
                  value: String(d.id),
                  label: `${d.name} (${d.code})`,
                }))}
                value={discountId ? String(discountId) : ''}
                onValueChange={(v) => {
                  const nextId = Number(v) || 0;
                  setDiscountId(nextId);
                  const params = new URLSearchParams(searchParams);
                  if (nextId > 0) params.set('discount_id', String(nextId));
                  else params.delete('discount_id');
                  setSearchParams(params, { replace: true });
                }}
                disabled={!canAssign}
              />
            </FormField>
            <FormField label="Class" htmlFor="assign_discount_class">
              <Combobox
                id="assign_discount_class"
                placeholder="Select class"
                searchPlaceholder="Search class…"
                options={activeClasses.map((c) => ({
                  value: String(c.id),
                  label: c.class_name,
                }))}
                value={classId ? String(classId) : ''}
                onValueChange={(v) => setClassId(Number(v) || 0)}
                disabled={!canAssign}
              />
            </FormField>
            <FormField label="Section" htmlFor="assign_discount_section">
              <Combobox
                id="assign_discount_section"
                placeholder={sectionOptions.length ? 'Select section' : 'No sections for class'}
                searchPlaceholder="Search section…"
                options={sectionOptions}
                value={sectionId ? String(sectionId) : ''}
                onValueChange={(v) => setSectionId(Number(v) || 0)}
                disabled={!canAssign || sectionOptions.length === 0}
              />
            </FormField>
            <FormField label="Session" htmlFor="assign_discount_session">
              <Input
                id="assign_discount_session"
                value={roster?.session_name ?? 'Current session'}
                disabled
                readOnly
              />
            </FormField>
          </>
        }
        actions={assignButton}
        filtersReady={filtersReady}
        isLoading={isLoading}
        loadingMessage="Loading students..."
        isError={isError}
        error={error}
        onRetry={() => void refetch()}
        isEmpty={!isLoading && !isError && (roster?.students.length ?? 0) === 0}
        emptyTitle="No students in this class section"
        emptyDescription="Choose another class or section with enrolled students."
        stickyActions={
          <>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium tabular-nums text-foreground">{selectedIds.length}</span>{' '}
              students selected for assignment
            </p>
            {assignButton}
          </>
        }
      >
        {roster && (
          <AssignDiscountsTable
            students={roster.students}
            selectedIds={selectedIds}
            onToggle={handleToggle}
            onToggleAll={handleToggleAll}
            onUnassign={setUnassignTarget}
            isUnassignPending={unassignMutation.isPending}
          />
        )}
      </ModuleMarkGridPack>

      <ConfirmDialog
        open={unassignTarget !== null}
        onOpenChange={(open) => {
          if (!open) setUnassignTarget(null);
        }}
        title="Remove discount assignment?"
        description={unassignTarget ? `Remove this discount from ${unassignTarget.full_name}?` : ''}
        confirmLabel="Remove"
        destructive
        isLoading={unassignMutation.isPending}
        onConfirm={() => {
          if (!unassignTarget?.assignment_id) return;
          unassignMutation.mutate(unassignTarget.assignment_id, {
            onSuccess: () => setUnassignTarget(null),
          });
        }}
      />
    </>
  );
}
