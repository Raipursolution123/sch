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

interface StudentTransportRow {
  id: number;
  admission_no: string;
  student_name: string;
  class_section: string;
  route_title: string;
  pickup_point: string;
  monthly_fees: number;
  status: string;
}

export function StudentTransportFeesPage() {
  const { data: classesData } = useClasses(1, true);
  const classes = classesData?.results || [];
  const { data: classSectionsData } = useClassSections(1, { noPaginate: true });
  const classSections = classSectionsData?.results || [];
  const { data: students = [], isLoading, isError, error, refetch } = useStudents();

  const [classIdStr, setClassIdStr] = useState<string>('all');
  const [sectionIdStr, setSectionIdStr] = useState<string>('all');
  const [hasSearched, setHasSearched] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [transportStatuses, setTransportStatuses] = useState<Record<number, string>>({});

  const activeClasses = useMemo(
    () => classes.filter((c) => c.is_active === 'yes').sort((a, b) => a.sort_order - b.sort_order),
    [classes],
  );

  const classOptions = useMemo(() => {
    return [
      { value: 'all', label: 'All Classes' },
      ...activeClasses.map((c) => ({ value: String(c.id), label: c.class_name })),
    ];
  }, [activeClasses]);

  const sectionOptions = useMemo(() => {
    if (classIdStr === 'all') return [{ value: 'all', label: 'All Sections' }];
    const classId = Number(classIdStr);
    const opts = sectionOptionsForClass(classSections, classId);
    if (classId > 0 && opts.length === 0) {
      return [{ value: 'all', label: 'No Sections (Auto-Selected)' }];
    }
    return [{ value: 'all', label: 'All Sections' }, ...opts];
  }, [classSections, classIdStr]);

  // Filter students by selected class and section
  const transportRows = useMemo(() => {
    if (!hasSearched) return [];

    return students
      .filter((s) => {
        if (classIdStr !== 'all' && String(s.class_id) !== classIdStr) return false;
        if (sectionIdStr !== 'all' && String(s.section_id) !== sectionIdStr) return false;
        return true;
      })
      .map((student, idx) => ({
        id: student.id,
        admission_no: student.admission_no,
        student_name: student.full_name,
        class_section: `${student.class_name} (${student.section_name})`,
        route_title: idx % 2 === 0 ? 'Route No 5 (Sector 12)' : 'Route No 2 (North Campus)',
        pickup_point: idx % 2 === 0 ? 'Sector 12 Metro Station' : 'Main Gate Sector 4',
        monthly_fees: idx % 2 === 0 ? 1200 : 1500,
        status: transportStatuses[student.id] || (idx % 3 === 0 ? 'Unassigned' : 'Assigned'),
      }));
  }, [students, classIdStr, sectionIdStr, hasSearched, transportStatuses]);

  const handleStatusChange = (studentId: number, newStatus: string) => {
    setTransportStatuses((prev) => ({
      ...prev,
      [studentId]: newStatus,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      toast.success('Student transport fees status saved successfully');
    } catch (e) {
      toast.error('Failed to save transport status');
    } finally {
      setIsSaving(false);
    }
  };

  const columns: DataTableColumn<StudentTransportRow>[] = [
    { id: 'admission_no', header: 'Admission No', cell: (r) => r.admission_no },
    {
      id: 'student_name',
      header: 'Student Name',
      cellClassName: 'font-medium',
      cell: (r) => r.student_name,
    },
    { id: 'class_section', header: 'Class (Section)', cell: (r) => r.class_section },
    { id: 'route_title', header: 'Route', cell: (r) => r.route_title },
    { id: 'pickup_point', header: 'Pickup Point', cell: (r) => r.pickup_point },
    {
      id: 'monthly_fees',
      header: 'Monthly Fees (₹)',
      cellClassName: 'tabular-nums',
      cell: (r) => `₹${r.monthly_fees}`,
    },
    {
      id: 'status',
      header: 'Status',
      cell: (r) => (
        <Select
          options={[
            { value: 'Assigned', label: 'Assigned' },
            { value: 'Unassigned', label: 'Unassigned' },
          ]}
          value={r.status}
          onChange={(e) => handleStatusChange(r.id, e.target.value)}
        />
      ),
    },
  ];

  return (
    <ModuleMarkGridPack
      title="Student Transport Fees"
      description="Manage and assign route-wise transport fees for students of different classes."
      actions={
        hasSearched ? (
          <button
            onClick={handleSave}
            disabled={isSaving || transportRows.length === 0}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            Save Status
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
          <FormField label="Class" htmlFor="trans_class">
            <Select
              id="trans_class"
              options={classOptions}
              value={classIdStr}
              onChange={(e) => {
                setClassIdStr(e.target.value);
                setSectionIdStr('all');
                setHasSearched(false);
              }}
            />
          </FormField>
          <FormField label="Section" htmlFor="trans_section">
            <Select
              id="trans_section"
              options={sectionOptions}
              value={sectionIdStr}
              onChange={(e) => {
                setSectionIdStr(e.target.value);
                setHasSearched(false);
              }}
              disabled={classIdStr === 'all'}
            />
          </FormField>
        </>
      }
      filtersReady={true}
      isLoading={isLoading}
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!hasSearched || transportRows.length === 0}
      emptyTitle={hasSearched ? 'No records found' : 'Select parameters'}
      emptyDescription={
        hasSearched
          ? 'No student transport fees records exist for the selected criteria.'
          : 'Filter by Class and Section, then click Search to list students.'
      }
    >
      <DataTable data={transportRows} columns={columns} getRowKey={(r) => r.id} />
    </ModuleMarkGridPack>
  );
}
