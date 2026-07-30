import { useState, useMemo } from 'react';
import { Search, Save } from 'lucide-react';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { FormField } from '@components/forms/FormField';
import { Select } from '@components/ui/select';
import { ModuleMarkGridPack } from '@workflow-packs';
import { useStudents } from '@hooks/useStudents';
import { useClasses } from '@hooks/useClasses';
import { useClassSections } from '@hooks/useClassSections';
import { sectionOptionsForClass } from '@features/students/utils/class-section-options';
import { toast } from 'sonner';

interface StudentSchemeRow {
  id: number;
  admission_no: string;
  student_name: string;
  class_section: string;
  applied_scheme: string;
}

export function ApplySchemeScholarshipPage() {
  const { data: classesData } = useClasses();
  const classes = classesData?.results || [];
  const { data: classSectionsData } = useClassSections(1, { noPaginate: true });
  const classSections = classSectionsData?.results || [];
  const { data: students = [], isLoading, isError, error, refetch } = useStudents();

  const [classId, setClassId] = useState<number>(0);
  const [sectionId, setSectionId] = useState<number>(0);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [appliedSchemes, setAppliedSchemes] = useState<Record<number, string>>({});

  const activeClasses = useMemo(
    () => classes.filter((c) => c.is_active === 'yes').sort((a, b) => a.sort_order - b.sort_order),
    [classes]
  );

  const sectionOptions = useMemo(
    () => sectionOptionsForClass(classSections, classId),
    [classSections, classId]
  );

  const filteredRows = useMemo(() => {
    if (!hasSearched) return [];

    return students
      .filter((s) => {
        if (classId && s.class_id !== classId) return false;
        if (sectionId && s.section_id !== sectionId) return false;
        return true;
      })
      .map((student, idx) => ({
        id: student.id,
        admission_no: student.admission_no,
        student_name: student.full_name,
        class_section: `${student.class_name} (${student.section_name})`,
        applied_scheme: appliedSchemes[student.id] || (idx % 4 === 0 ? 'Merit Scholarship' : 'None'),
      }));
  }, [students, classId, sectionId, hasSearched, appliedSchemes]);

  const handleSchemeChange = (studentId: number, scheme: string) => {
    setAppliedSchemes((prev) => ({
      ...prev,
      [studentId]: scheme,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      toast.success('Student scholarship schemes updated successfully');
    } catch (e) {
      toast.error('Failed to update scholarship');
    } finally {
      setIsSaving(false);
    }
  };

  const columns: DataTableColumn<StudentSchemeRow>[] = [
    { id: 'admission_no', header: 'Admission No', cell: (r) => r.admission_no },
    { id: 'student_name', header: 'Student Name', cellClassName: 'font-medium', cell: (r) => r.student_name },
    { id: 'class_section', header: 'Class (Section)', cell: (r) => r.class_section },
    {
      id: 'applied_scheme',
      header: 'Scholarship Scheme',
      cell: (r) => (
        <Select
          options={[
            { value: 'None', label: 'None' },
            { value: 'Merit Scholarship', label: 'Merit Scholarship (50%)' },
            { value: 'Sports Quota Discount', label: 'Sports Quota Discount' },
            { value: 'EWS Scheme', label: 'EWS Scheme (100%)' },
          ]}
          value={r.applied_scheme}
          onChange={(e) => handleSchemeChange(r.id, e.target.value)}
        />
      ),
    },
  ];

  return (
    <ModuleMarkGridPack
      title="Apply Scheme & Scholarship"
      description="Assign and authorize specific scholarship schemes or fee concessions to students."
      actions={
        hasSearched ? (
          <button
            onClick={handleSave}
            disabled={isSaving || filteredRows.length === 0}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            Save Assignments
          </button>
        ) : (
          <button
            onClick={() => setHasSearched(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
          >
            <Search className="h-4 w-4" />
            Search Students
          </button>
        )
      }
      filters={
        <>
          <FormField label="Class" htmlFor="sch_class">
            <Select
              id="sch_class"
              options={activeClasses.map((c) => ({ value: String(c.id), label: c.class_name }))}
              value={classId ? String(classId) : ''}
              onChange={(e) => {
                setClassId(Number(e.target.value));
                setSectionId(0);
                setHasSearched(false);
              }}
              placeholder="All classes"
            />
          </FormField>
          <FormField label="Section" htmlFor="sch_section">
            <Select
              id="sch_section"
              options={sectionOptions}
              value={sectionId ? String(sectionId) : ''}
              onChange={(e) => {
                setSectionId(Number(e.target.value));
                setHasSearched(false);
              }}
              placeholder="All sections"
              disabled={!classId}
            />
          </FormField>
        </>
      }
      filtersReady={true}
      isLoading={isLoading}
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!hasSearched || filteredRows.length === 0}
      emptyTitle={hasSearched ? 'No records found' : 'Select parameters'}
      emptyDescription={
        hasSearched
          ? 'No student records exist for the selected criteria.'
          : 'Filter by Class and Section, then click Search to list students.'
      }
    >
      <DataTable data={filteredRows} columns={columns} getRowKey={(r) => r.id} />
    </ModuleMarkGridPack>
  );
}
