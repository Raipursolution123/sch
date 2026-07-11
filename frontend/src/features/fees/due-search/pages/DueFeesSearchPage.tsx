import { useMemo, useState } from 'react';
import { Input } from '@components/ui/input';
import { Select } from '@components/ui/select';
import { FormField } from '@components/forms/FormField';
import { ReportSummaryGrid } from '@components/reports';
import { DueFeesSearchTable } from '@features/fees/due-search/components/DueFeesSearchTable';
import {
  firstSectionIdForClass,
  sectionOptionsForClass,
} from '@features/students/utils/class-section-options';
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

  const classOptions = [
    { value: '', label: 'All classes' },
    ...classes
      .filter((c) => c.is_active === 'yes')
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((c) => ({ value: String(c.id), label: c.class_name })),
  ];

  const sectionOptions = useMemo(() => {
    if (classId <= 0) {
      return [{ value: '', label: 'All sections' }];
    }
    return [
      { value: '', label: 'All sections' },
      ...sectionOptionsForClass(classSections, classId),
    ];
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
            <Select
              id="due_search_class"
              options={classOptions}
              value={classId ? String(classId) : ''}
              onChange={(e) => {
                const nextClassId = Number(e.target.value) || 0;
                setClassId(nextClassId);
                setSectionId(
                  nextClassId > 0 ? (firstSectionIdForClass(classSections, nextClassId) ?? 0) : 0,
                );
                setSubmitted(false);
              }}
            />
          </FormField>
          <FormField label="Section" htmlFor="due_search_section">
            <Select
              id="due_search_section"
              options={sectionOptions}
              value={sectionId ? String(sectionId) : ''}
              onChange={(e) => {
                setSectionId(Number(e.target.value) || 0);
                setSubmitted(false);
              }}
              disabled={classId > 0 && sectionOptions.length <= 1}
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
              { label: 'Students with balance', value: String(data.total_students) },
              { label: 'Total outstanding', value: formatAmount(data.total_balance) },
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
      emptyTitle="No outstanding fees found"
      emptyDescription="Try widening class/section filters or clearing the student search."
    >
      {data && data.students.length > 0 && <DueFeesSearchTable students={data.students} />}
    </ModuleReportPack>
  );
}
