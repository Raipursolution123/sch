import { useEffect, useMemo, useState } from 'react';
import { FormField } from '@components/forms/FormField';
import { Select } from '@components/ui/select';
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
import { ModuleMarkGridPack } from '@workflow-packs';

export function CollectFeesPage() {
  const { data: classesData } = useClasses();
  const classes = classesData?.results || [];
  const { data: classSectionsData } = useClassSections();
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
      setClassId(activeClasses[0].id);
    }
  }, [activeClasses, classId]);

  useEffect(() => {
    if (classId <= 0) return;
    const nextSectionId = firstSectionIdForClass(classSections, classId);
    if (nextSectionId && sectionId !== nextSectionId) {
      setSectionId(nextSectionId);
    }
  }, [classId, classSections, sectionId]);

  const canCollect =
    activeClasses.length > 0 && classSections.some((row) => row.is_active === 'yes');

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
              <Select
                id="collect_fees_class"
                placeholder="Select class"
                options={activeClasses.map((c) => ({
                  value: String(c.id),
                  label: c.class_name,
                }))}
                value={classId ? String(classId) : ''}
                onChange={(e) => {
                  const nextClassId = Number(e.target.value);
                  setClassId(nextClassId);
                  const nextSectionId = firstSectionIdForClass(classSections, nextClassId);
                  setSectionId(nextSectionId ?? 0);
                }}
                disabled={!canCollect}
              />
            </FormField>
            <FormField label="Section" htmlFor="collect_fees_section">
              <Select
                id="collect_fees_section"
                placeholder="Select section"
                options={sectionOptions}
                value={sectionId ? String(sectionId) : ''}
                onChange={(e) => setSectionId(Number(e.target.value))}
                disabled={!canCollect || sectionOptions.length === 0}
              />
            </FormField>
            <FormField label="Session" htmlFor="collect_fees_session">
              <Select
                id="collect_fees_session"
                placeholder="Current session"
                options={
                  roster?.session_name
                    ? [{ value: roster.session_name, label: roster.session_name }]
                    : []
                }
                value={roster?.session_name ?? ''}
                disabled
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
        isEmpty={!isLoading && !isError && (roster?.students.length ?? 0) === 0}
        emptyTitle="No students in this class section"
        emptyDescription="Enroll students in the selected class and section, then assign fees."
      >
        {roster && <CollectFeesTable students={roster.students} onCollect={handleCollect} />}
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
