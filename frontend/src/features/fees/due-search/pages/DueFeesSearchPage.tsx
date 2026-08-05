import { useMemo, useState } from 'react';
import { Input } from '@components/ui/input';
import { Combobox } from '@components/ui/combobox';
import { FormField } from '@components/forms/FormField';
import { ReportSummaryGrid } from '@components/reports';
import { DueFeesSearchTable } from '@features/fees/due-search/components/DueFeesSearchTable';
import { sectionOptionsForClass } from '@features/students/utils/class-section-options';
import { useFeeDueSearch } from '@hooks/useFeeSearch';
import { useClasses } from '@hooks/useClasses';
import { useClassSections } from '@hooks/useClassSections';
import { useActiveSession } from '@hooks/useSessions';
import { formatAmount } from '@utils/format';
import { ModuleReportPack } from '@workflow-packs';

export function DueFeesSearchPage() {
  const { data: activeSession } = useActiveSession();
  const { data: classesData } = useClasses();
  const classes = classesData?.results || [];
  const { data: classSectionsData } = useClassSections();
  const classSections = classSectionsData?.results || [];

  const [classId, setClassId] = useState(0);
  const [sectionId, setSectionId] = useState(0);
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState(true);

  const filters = useMemo(
    () => ({
      ...(classId > 0 ? { class_id: classId } : {}),
      ...(sectionId > 0 ? { section_id: sectionId } : {}),
      ...(query.trim() ? { q: query.trim() } : {}),
    }),
    [classId, sectionId, query],
  );

  const { data, isLoading, isError, error, refetch } = useFeeDueSearch(filters, submitted);

  const classOptions = useMemo(
    () =>
      classes
        .filter((c) => c.is_active === 'yes')
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((c) => ({ value: String(c.id), label: c.class_name })),
    [classes],
  );

  const sectionOptions = useMemo(() => {
    if (classId <= 0) return [];
    return sectionOptionsForClass(classSections, classId);
  }, [classId, classSections]);

  return (
    <ModuleReportPack
      title="Search Due Fees"
      description="Find students with outstanding fee balances in the current session."
      sessionLabel={activeSession ? `Session ${activeSession.session}` : undefined}
      submitted={submitted}
      hasData={Boolean(data?.students.length)}
      onApply={() => setSubmitted(true)}
      filters={
        <>
          <FormField label="Class" htmlFor="due_search_class">
            <Combobox
              id="due_search_class"
              options={classOptions}
              value={classId ? String(classId) : ''}
              onValueChange={(v) => {
                setClassId(v ? Number(v) : 0);
                setSectionId(0);
                setSubmitted(false);
              }}
              allowEmpty
              emptyLabel="All classes"
              placeholder="All classes"
              searchPlaceholder="Search class…"
            />
          </FormField>
          <FormField label="Section" htmlFor="due_search_section">
            <Combobox
              id="due_search_section"
              options={sectionOptions}
              value={sectionId ? String(sectionId) : ''}
              onValueChange={(v) => {
                setSectionId(v ? Number(v) : 0);
                setSubmitted(false);
              }}
              allowEmpty
              emptyLabel="All sections"
              placeholder="All sections"
              searchPlaceholder="Search section…"
              disabled={classId > 0 && sectionOptions.length === 0}
            />
          </FormField>
          <FormField label="Student" htmlFor="due_search_query">
            <Input
              id="due_search_query"
              value={query}
              placeholder="Name or admission no."
              onChange={(e) => {
                setQuery(e.target.value);
                setSubmitted(false);
              }}
            />
          </FormField>
        </>
      }
      summary={
        data ? (
          <ReportSummaryGrid
            items={[
              { label: 'Students with balance', value: data.total_students },
              {
                label: 'Total outstanding',
                value: formatAmount(data.total_balance),
                tone: data.total_balance > 0 ? 'destructive' : 'success',
              },
            ]}
          />
        ) : undefined
      }
      isLoading={isLoading}
      loadingMessage="Searching due fees..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={submitted && !isLoading && !isError && (data?.students.length ?? 0) === 0}
      emptyTitle="No outstanding fees"
      emptyDescription="No balances match these filters. Widen class/section or clear the student search."
    >
      {data && data.students.length > 0 && <DueFeesSearchTable students={data.students} />}
    </ModuleReportPack>
  );
}
