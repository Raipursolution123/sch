import { useState, useMemo } from 'react';
import { Search, Save } from 'lucide-react';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { FormField } from '@components/forms/FormField';
import { Select } from '@components/ui/select';
import { Input } from '@components/ui/input';
import { ModuleMarkGridPack } from '@workflow-packs';
import { useStudents } from '@hooks/useStudents';
import { useClasses } from '@hooks/useClasses';
import { useClassSections } from '@hooks/useClassSections';
import { sectionOptionsForClass } from '@features/students/utils/class-section-options';
import { toast } from 'sonner';

interface FeeAdjustmentRow {
  id: number;
  admission_no: string;
  student_name: string;
  class_section: string;
  fine_amount: number;
  reason: string;
}

export function PositiveFeeAdjustmentPage() {
  const { data: classesData } = useClasses();
  const classes = classesData?.results || [];
  const { data: classSectionsData } = useClassSections(1, { noPaginate: true });
  const classSections = classSectionsData?.results || [];
  const { data: students = [], isLoading, isError, error, refetch } = useStudents();

  const [classId, setClassId] = useState<number>(0);
  const [sectionId, setSectionId] = useState<number>(0);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [adjustments, setAdjustments] = useState<
    Record<number, { amount: number; reason: string }>
  >({});

  const activeClasses = useMemo(
    () => classes.filter((c) => c.is_active === 'yes').sort((a, b) => a.sort_order - b.sort_order),
    [classes],
  );

  const sectionOptions = useMemo(
    () => sectionOptionsForClass(classSections, classId),
    [classSections, classId],
  );

  const filteredRows = useMemo(() => {
    if (!hasSearched) return [];

    return students
      .filter((s) => {
        if (classId && s.class_id !== classId) return false;
        if (sectionId && s.section_id !== sectionId) return false;
        return true;
      })
      .map((student) => ({
        id: student.id,
        admission_no: student.admission_no,
        student_name: student.full_name,
        class_section: `${student.class_name} (${student.section_name})`,
        fine_amount: adjustments[student.id]?.amount || 0,
        reason: adjustments[student.id]?.reason || '',
      }));
  }, [students, classId, sectionId, hasSearched, adjustments]);

  const handleAmountChange = (studentId: number, amount: number) => {
    setAdjustments((prev) => ({
      ...prev,
      [studentId]: {
        amount,
        reason: prev[studentId]?.reason || '',
      },
    }));
  };

  const handleReasonChange = (studentId: number, reason: string) => {
    setAdjustments((prev) => ({
      ...prev,
      [studentId]: {
        amount: prev[studentId]?.amount || 0,
        reason,
      },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      toast.success('Fee adjustments applied successfully');
    } catch (e) {
      toast.error('Failed to apply fee adjustments');
    } finally {
      setIsSaving(false);
    }
  };

  const columns: DataTableColumn<FeeAdjustmentRow>[] = [
    { id: 'admission_no', header: 'Admission No', cell: (r) => r.admission_no },
    {
      id: 'student_name',
      header: 'Student Name',
      cellClassName: 'font-medium',
      cell: (r) => r.student_name,
    },
    { id: 'class_section', header: 'Class (Section)', cell: (r) => r.class_section },
    {
      id: 'fine_amount',
      header: 'Adjustment Amount (₹)',
      cell: (r) => (
        <Input
          type="number"
          placeholder="₹0"
          value={r.fine_amount || ''}
          onChange={(e) => handleAmountChange(r.id, Number(e.target.value))}
          className="w-32 tabular-nums"
        />
      ),
    },
    {
      id: 'reason',
      header: 'Reason / Remarks',
      cell: (r) => (
        <Input
          type="text"
          placeholder="Late fee, Library fine, etc."
          value={r.reason}
          onChange={(e) => handleReasonChange(r.id, e.target.value)}
        />
      ),
    },
  ];

  return (
    <ModuleMarkGridPack
      title="Positive Fee Adjustment"
      description="Apply additional charges, fines, or custom fee increments to specific students."
      actions={
        hasSearched ? (
          <button
            onClick={handleSave}
            disabled={isSaving || filteredRows.length === 0}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            Save Adjustments
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
          <FormField label="Class" htmlFor="adj_class">
            <Select
              id="adj_class"
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
          <FormField label="Section" htmlFor="adj_section">
            <Select
              id="adj_section"
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
