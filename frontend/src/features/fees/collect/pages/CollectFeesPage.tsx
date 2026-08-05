import { useEffect, useMemo, useState } from 'react';
import { FormField } from '@components/forms/FormField';
import { Combobox } from '@components/ui/combobox';
import { Input } from '@components/ui/input';
import { ReportSummaryGrid } from '@components/reports';
import { CollectFeesStudentDrawer } from '@features/fees/collect/components/CollectFeesStudentDrawer';
import { CollectFeesTable } from '@features/fees/collect/components/CollectFeesTable';
import {
  firstSectionIdForClass,
  sectionOptionsForClass,
} from '@features/students/utils/class-section-options';
import { useCollectFeesRoster } from '@hooks/useCollectFees';
import { useClasses } from '@hooks/useClasses';
import { useClassSections } from '@hooks/useClassSections';
import type { FeeCollectRosterStudent } from '@app-types/fees/fee-collect';
import { formatAmount } from '@utils/format';
import { ModuleMarkGridPack } from '@workflow-packs';

export function CollectFeesPage() {
  const { data: classesData } = useClasses();
  const classes = classesData?.results || [];
  const { data: classSectionsData } = useClassSections(1, { noPaginate: true });
  const classSections = classSectionsData?.results || [];

  const [classId, setClassId] = useState(0);
  const [sectionId, setSectionId] = useState(0);
  const [selectedStudent, setSelectedStudent] = useState<FeeCollectRosterStudent | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const activeClasses = useMemo(
    () => classes.filter((c) => c.is_active === 'yes').sort((a, b) => a.sort_order - b.sort_order),
    [classes],
  );

  const sectionOptions = useMemo(
    () => sectionOptionsForClass(classSections, classId),
    [classSections, classId],
  );

  const filtersReady = classId > 0 && sectionId > 0;
  const {
    data: roster,
    isLoading,
    isError,
    error,
    refetch,
  } = useCollectFeesRoster(classId, sectionId, filtersReady);

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

  const canCollect =
    activeClasses.length > 0 && classSections.some((row) => row.is_active === 'yes');

  const students = roster?.students ?? [];
  const sectionTotals = useMemo(() => {
    const due = students.reduce((sum, s) => sum + (s.total_due || 0), 0);
    const paid = students.reduce((sum, s) => sum + (s.total_paid || 0), 0);
    const balance = students.reduce((sum, s) => sum + (s.total_balance || 0), 0);
    const overdueCount = students.filter((s) => s.total_balance > 0).length;
    return { due, paid, balance, overdueCount };
  }, [students]);

  const handleCollect = (student: FeeCollectRosterStudent) => {
    setSelectedStudent(student);
    setDrawerOpen(true);
  };

  return (
    <>
      <ModuleMarkGridPack
        title="Collect Fees"
        description="View outstanding balances by class and section, then record payments."
        prerequisiteHint={
          !canCollect ? (
            <p className="text-sm text-muted-foreground">
              Configure active classes and class-section mappings under Academics before collecting
              fees.
            </p>
          ) : undefined
        }
        filters={
          <>
            <FormField label="Class" htmlFor="collect_fees_class">
              <Combobox
                id="collect_fees_class"
                placeholder="Select class"
                searchPlaceholder="Search class…"
                options={activeClasses.map((c) => ({
                  value: String(c.id),
                  label: c.class_name,
                }))}
                value={classId ? String(classId) : ''}
                onValueChange={(v) => setClassId(Number(v) || 0)}
                disabled={!canCollect && activeClasses.length === 0}
              />
            </FormField>
            <FormField label="Section" htmlFor="collect_fees_section">
              <Combobox
                id="collect_fees_section"
                placeholder={sectionOptions.length ? 'Select section' : 'No sections for class'}
                searchPlaceholder="Search section…"
                options={sectionOptions}
                value={sectionId ? String(sectionId) : ''}
                onValueChange={(v) => setSectionId(Number(v) || 0)}
                disabled={sectionOptions.length === 0}
                emptyMessage="No sections mapped to this class"
              />
            </FormField>
            <FormField label="Session" htmlFor="collect_fees_session">
              <Input
                id="collect_fees_session"
                value={roster?.session_name ?? 'Current session'}
                disabled
                readOnly
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
        emptyTitle="No students in this class section"
        emptyDescription="Enroll students, assign a Fees Master structure, then return to collect."
        gridToolbar={
          <ReportSummaryGrid
            className="lg:grid-cols-4"
            items={[
              { label: 'Students', value: students.length },
              { label: 'With balance', value: sectionTotals.overdueCount, tone: 'warning' },
              { label: 'Total due', value: formatAmount(sectionTotals.due) },
              {
                label: 'Outstanding',
                value: formatAmount(sectionTotals.balance),
                tone: sectionTotals.balance > 0 ? 'destructive' : 'success',
              },
            ]}
          />
        }
        stickyActions={
          <p className="text-sm text-muted-foreground">
            Open a student row to record payment. Amounts use{' '}
            <span className="tabular-nums">₹</span> with audit trail on save.
          </p>
        }
      >
        <CollectFeesTable students={students} onCollect={handleCollect} />
      </ModuleMarkGridPack>

      <CollectFeesStudentDrawer
        open={drawerOpen}
        onOpenChange={(open) => {
          setDrawerOpen(open);
          if (!open) setSelectedStudent(null);
        }}
        student={selectedStudent}
        classId={classId}
        sectionId={sectionId}
        sessionName={roster?.session_name}
        className={roster?.class_name}
        sectionName={roster?.section_name}
      />
    </>
  );
}
