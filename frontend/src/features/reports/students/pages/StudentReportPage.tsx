import { useMemo, useState } from 'react';
import { Select } from '@components/ui/select';
import { FormField } from '@components/forms/FormField';
import { ReportSummaryGrid } from '@components/reports';
import { StudentReportTable } from '@features/reports/students/components/StudentReportTable';
import {
  firstSectionIdForClass,
  sectionOptionsForClass,
} from '@features/students/utils/class-section-options';
import { useClasses } from '@hooks/useClasses';
import { useClassSections } from '@hooks/useClassSections';
import { useActiveSession } from '@hooks/useSessions';
import { useStudents } from '@hooks/useStudents';
import { exportToCsv } from '@utils/export-csv';
import { formatClassSection, formatGender } from '@utils/student';
import { printReport } from '@utils/print-report';
import { ModuleReportPack } from '@workflow-packs';

export function StudentReportPage() {
  const { data: activeSession } = useActiveSession();
  const { data: students, isLoading, isError, error, refetch } = useStudents();
  const { data: classesData } = useClasses();
  const classes = classesData?.results || [];
  const { data: classSectionsData } = useClassSections();
  const classSections = classSectionsData?.results || [];

  const [classId, setClassId] = useState(0);
  const [sectionId, setSectionId] = useState(0);

  const filteredStudents = useMemo(() => {
    if (!students) return [];
    return students.filter((student) => {
      if (classId > 0 && student.class_id !== classId) return false;
      if (sectionId > 0 && student.section_id !== sectionId) return false;
      return true;
    });
  }, [students, classId, sectionId]);

  const classOptions = [
    { value: '', label: 'All classes' },
    ...classes
      .filter((c) => c.is_active === 'yes')
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((c) => ({ value: String(c.id), label: c.class_name })),
  ];

  const sectionOptions = useMemo(() => {
    if (classId <= 0) return [{ value: '', label: 'All sections' }];
    return [
      { value: '', label: 'All sections' },
      ...sectionOptionsForClass(classSections, classId),
    ];
  }, [classId, classSections]);

  const handleExportCsv = () => {
    exportToCsv(
      'student-report',
      ['Admission No.', 'Student', 'Class', 'Roll No.', 'Gender', 'Mobile', 'Email'],
      filteredStudents.map((row) => [
        row.admission_no,
        row.full_name,
        formatClassSection(row.class_name, row.section_name),
        row.roll_no != null ? String(row.roll_no) : '',
        formatGender(row.gender),
        row.mobileno ?? '',
        row.email ?? '',
      ]),
    );
  };

  return (
    <ModuleReportPack
      title="Student Report"
      description="Active student roster for the current session with class and section filters."
      printTitle="Student Report"
      printSubtitle={activeSession ? `Session ${activeSession.session}` : undefined}
      onPrint={printReport}
      onExportCsv={handleExportCsv}
      exportDisabled={filteredStudents.length === 0}
      sessionLabel={activeSession?.session}
      submitted
      hasData={Boolean(students)}
      isLoading={isLoading}
      loadingMessage="Loading students..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={filteredStudents.length === 0}
      emptyTitle="No students found"
      emptyDescription="Adjust class or section filters, or admit students first."
      summary={
        students ? (
          <ReportSummaryGrid
            items={[
              { label: 'Total active', value: students.length },
              { label: 'Filtered', value: filteredStudents.length },
              {
                label: 'Classes',
                value: new Set(filteredStudents.map((s) => s.class_id).filter(Boolean)).size,
              },
            ]}
          />
        ) : undefined
      }
      filters={
        <>
          <FormField label="Class" htmlFor="student_report_class">
            <Select
              id="student_report_class"
              options={classOptions}
              value={classId ? String(classId) : ''}
              onChange={(e) => {
                const nextClassId = Number(e.target.value) || 0;
                setClassId(nextClassId);
                setSectionId(
                  nextClassId > 0 ? (firstSectionIdForClass(classSections, nextClassId) ?? 0) : 0,
                );
              }}
            />
          </FormField>
          <FormField label="Section" htmlFor="student_report_section">
            <Select
              id="student_report_section"
              options={sectionOptions}
              value={sectionId ? String(sectionId) : ''}
              onChange={(e) => setSectionId(Number(e.target.value) || 0)}
              disabled={classId <= 0}
            />
          </FormField>
        </>
      }
    >
      {filteredStudents.length > 0 && <StudentReportTable students={filteredStudents} />}
    </ModuleReportPack>
  );
}
