import { useState, useMemo } from 'react';
import { Select } from '@components/ui/select';
import { FormField } from '@components/forms/FormField';
import { ReportSummaryGrid } from '@components/reports';
import { useClasses } from '@hooks/useClasses';
import { useClassSections } from '@hooks/useClassSections';
import { useActiveSession } from '@hooks/useSessions';
import { exportToCsv } from '@utils/export-csv';
import { printReport } from '@utils/print-report';
import { ModuleReportPack } from '@workflow-packs';
import { BookOpen, CheckCircle, Clock } from 'lucide-react';
import { sectionOptionsForClass } from '@features/students/utils/class-section-options';

interface SyllabusStatusRow {
  subject: string;
  teacher: string;
  totalTopics: number;
  completedTopics: number;
  percentage: number;
  lastUpdated: string;
  classId: number;
  sectionId: number;
}

export function LessonPlanReportPage() {
  const { data: activeSession } = useActiveSession();
  const { data: classesData } = useClasses();
  const classes = classesData?.results || [];
  const { data: classSectionsData } = useClassSections();
  const classSections = classSectionsData?.results || [];

  const [classId, setClassId] = useState('');
  const [sectionId, setSectionId] = useState('');

  // Mocked data that corresponds to the lesson plan syllabus status mapped to classes and sections
  const mockSyllabusData: SyllabusStatusRow[] = [
    { subject: 'Mathematics (Math-Old)', teacher: 'John Doe', totalTopics: 12, completedTopics: 8, percentage: 66, lastUpdated: '2026-07-30', classId: 24, sectionId: 20 },
    { subject: 'Science (Sci-10)', teacher: 'Sarah Smith', totalTopics: 15, completedTopics: 5, percentage: 33, lastUpdated: '2026-07-28', classId: 24, sectionId: 21 },
    { subject: 'English (Eng-Lit)', teacher: 'Emma Watson', totalTopics: 10, completedTopics: 10, percentage: 100, lastUpdated: '2026-07-29', classId: 25, sectionId: 20 },
    { subject: 'Social Studies (SSt-10)', teacher: 'Robert Downey', totalTopics: 8, completedTopics: 2, percentage: 25, lastUpdated: '2026-07-25', classId: 25, sectionId: 21 },
  ];

  const classOptions = [
    { value: '', label: 'All classes' },
    ...classes
      .filter((c) => c.is_active === 'yes')
      .map((c) => ({ value: String(c.id), label: c.class_name })),
  ];

  const sectionOptions = useMemo(() => {
    if (!classId) return [{ value: '', label: 'All sections' }];
    return [
      { value: '', label: 'All sections' },
      ...sectionOptionsForClass(classSections, Number(classId)),
    ];
  }, [classId, classSections]);

  const filteredSyllabusData = useMemo(() => {
    return mockSyllabusData.filter((row) => {
      if (classId && row.classId !== Number(classId)) return false;
      if (sectionId && row.sectionId !== Number(sectionId)) return false;
      return true;
    });
  }, [classId, sectionId]);

  const handleExportCsv = () => {
    exportToCsv(
      'lesson-plan-syllabus-report',
      ['Subject', 'Teacher', 'Total Topics', 'Completed Topics', 'Completion %', 'Last Updated'],
      filteredSyllabusData.map((row) => [
        row.subject,
        row.teacher,
        String(row.totalTopics),
        String(row.completedTopics),
        `${row.percentage}%`,
        row.lastUpdated,
      ]),
    );
  };

  return (
    <ModuleReportPack
      title="Lesson Plan Syllabus Report"
      description="Track class and subject syllabus status completion progress for active lessons."
      printTitle="Syllabus Status Report"
      printSubtitle={activeSession ? `Session ${activeSession.session}` : undefined}
      onPrint={printReport}
      onExportCsv={handleExportCsv}
      exportDisabled={filteredSyllabusData.length === 0}
      sessionLabel={activeSession?.session}
      submitted
      hasData={true}
      isLoading={false}
      isEmpty={filteredSyllabusData.length === 0}
      summary={
        <ReportSummaryGrid
          items={[
            { label: 'Total Subjects', value: filteredSyllabusData.length },
            { label: 'Fully Completed', value: filteredSyllabusData.filter(s => s.percentage === 100).length },
            { label: 'Avg. Progress', value: filteredSyllabusData.length ? `${Math.round(filteredSyllabusData.reduce((acc, row) => acc + row.percentage, 0) / filteredSyllabusData.length)}%` : '0%' },
          ]}
        />
      }
      filters={
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Class">
            <Select
              value={classId}
              onChange={(e) => {
                setClassId(e.target.value);
                setSectionId('');
              }}
              options={classOptions}
            />
          </FormField>
          <FormField label="Section">
            <Select
              value={sectionId}
              onChange={(e) => setSectionId(e.target.value)}
              options={sectionOptions}
              disabled={!classId}
            />
          </FormField>
        </div>
      }
    >

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-6 py-4">Subject</th>
              <th className="px-6 py-4">Teacher</th>
              <th className="px-6 py-4 text-center">Total Topics</th>
              <th className="px-6 py-4 text-center">Completed</th>
              <th className="px-6 py-4">Progress Bar</th>
              <th className="px-6 py-4 text-center">Last Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredSyllabusData.map((row, idx) => (
              <tr key={idx} className="hover:bg-muted/50 transition-colors">
                <td className="px-6 py-4 font-medium text-foreground flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  {row.subject}
                </td>
                <td className="px-6 py-4 text-muted-foreground">{row.teacher}</td>
                <td className="px-6 py-4 text-center text-muted-foreground">{row.totalTopics}</td>
                <td className="px-6 py-4 text-center text-muted-foreground">
                  <span className="inline-flex items-center gap-1 font-semibold text-ink">
                    {row.completedTopics === row.totalTopics ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Clock className="h-4 w-4 text-amber-500" />
                    )}
                    {row.completedTopics}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-muted h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-primary h-full transition-all duration-300"
                        style={{ width: `${row.percentage}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-ink">{row.percentage}%</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center text-muted-foreground">{row.lastUpdated}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ModuleReportPack>
  );
}
