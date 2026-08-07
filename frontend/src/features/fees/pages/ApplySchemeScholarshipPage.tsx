import { useMemo, useState } from 'react';
import { Check, Plus, Search, X } from 'lucide-react';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormField } from '@components/forms/FormField';
import { Select } from '@components/ui/select';
import { ModuleMarkGridPack } from '@workflow-packs';
import { useClasses } from '@hooks/useClasses';
import { useClassSections } from '@hooks/useClassSections';
import { sectionOptionsForClass } from '@features/students/utils/class-section-options';
import { useStudents } from '@hooks/useStudents';
import {
  useApplyScheme,
  useApproveSchemeApplication,
  useFeeSchemes,
  useRejectSchemeApplication,
  useSchemeApplications,
} from '@hooks/useSchemeScholarship';
import type { SchemeApplication } from '@services/api/scheme-scholarship.service';
import { toast } from 'sonner';

export function ApplySchemeScholarshipPage() {
  const { data: classesData } = useClasses();
  const classes = classesData?.results || [];
  const { data: classSectionsData } = useClassSections(1, { noPaginate: true });
  const classSections = classSectionsData?.results || [];
  const { data: schemes = [] } = useFeeSchemes();
  const { data: students = [] } = useStudents();

  const [classId, setClassId] = useState<number>(0);
  const [sectionId, setSectionId] = useState<number>(0);
  const [schemeId, setSchemeId] = useState<number>(0);
  const [statusFilter, setStatusFilter] = useState<number | ''>('');
  const [hasSearched, setHasSearched] = useState(false);

  const [applyOpen, setApplyOpen] = useState(false);
  const [applySchemeId, setApplySchemeId] = useState<number>(0);
  const [applyClassId, setApplyClassId] = useState<number>(0);
  const [applySectionId, setApplySectionId] = useState<number>(0);
  const [applyStudentId, setApplyStudentId] = useState<number>(0);

  const filters = useMemo(
    () => ({
      ss_id: schemeId || undefined,
      applied_status: statusFilter === '' ? undefined : statusFilter,
      class_id: classId || undefined,
      section_id: sectionId || undefined,
    }),
    [schemeId, statusFilter, classId, sectionId],
  );

  const {
    data: applications = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useSchemeApplications(filters, hasSearched);
  const approveMutation = useApproveSchemeApplication();
  const rejectMutation = useRejectSchemeApplication();
  const applyMutation = useApplyScheme();

  const sectionOptions = useMemo(
    () => sectionOptionsForClass(classSections, classId),
    [classSections, classId],
  );

  const applySectionOptions = useMemo(
    () => sectionOptionsForClass(classSections, applyClassId),
    [classSections, applyClassId],
  );

  const applyStudentOptions = useMemo(() => {
    return students
      .filter((student) => {
        if (applyClassId && student.class_id !== applyClassId) return false;
        if (applySectionId && student.section_id !== applySectionId) return false;
        return true;
      })
      .map((student) => ({
        value: String(student.id),
        label: `${student.full_name} (${student.admission_no})`,
      }));
  }, [students, applyClassId, applySectionId]);

  const handleApply = () => {
    if (!applySchemeId || !applyStudentId) {
      toast.error('Select scheme and student');
      return;
    }
    applyMutation.mutate(
      { ss_id: applySchemeId, student_id: applyStudentId },
      {
        onSuccess: () => {
          setApplyOpen(false);
          setApplyStudentId(0);
          setHasSearched(true);
        },
      },
    );
  };

  const columns: DataTableColumn<SchemeApplication>[] = [
    { id: 'student', header: 'Student', cellClassName: 'font-medium', cell: (r) => r.student_name },
    { id: 'scheme', header: 'Scheme', cell: (r) => r.scheme_name || '—' },
    { id: 'class', header: 'Class', cell: (r) => `${r.class_name} (${r.section_name})` },
    { id: 'status', header: 'Status', cell: (r) => r.status_label },
    { id: 'date', header: 'Applied', cell: (r) => r.applied_on || '—' },
  ];

  return (
    <>
      <ModuleMarkGridPack
        title="Apply / Approve Scheme & Scholarship"
        description="Apply schemes to students and review pending applications."
        actions={
          <div className="flex gap-2">
            <button
              onClick={() => setApplyOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium"
            >
              <Plus className="h-4 w-4" />
              Apply to Student
            </button>
            <button
              onClick={() => setHasSearched(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              <Search className="h-4 w-4" />
              Search Applications
            </button>
          </div>
        }
        filters={
          <>
            <FormField label="Scheme">
              <Select
                value={schemeId ? String(schemeId) : ''}
                onChange={(e) => setSchemeId(Number(e.target.value) || 0)}
                options={schemes.map((s) => ({ value: String(s.id), label: s.ss_name }))}
                placeholder="All schemes"
              />
            </FormField>
            <FormField label="Class">
              <Select
                value={classId ? String(classId) : ''}
                onChange={(e) => {
                  setClassId(Number(e.target.value) || 0);
                  setSectionId(0);
                }}
                options={classes.map((c) => ({ value: String(c.id), label: c.class_name }))}
                placeholder="All classes"
              />
            </FormField>
            <FormField label="Section">
              <Select
                value={sectionId ? String(sectionId) : ''}
                onChange={(e) => setSectionId(Number(e.target.value) || 0)}
                options={sectionOptions}
                placeholder="All sections"
                disabled={!classId}
              />
            </FormField>
            <FormField label="Status">
              <Select
                value={statusFilter === '' ? '' : String(statusFilter)}
                onChange={(e) =>
                  setStatusFilter(e.target.value === '' ? '' : Number(e.target.value))
                }
                options={[
                  { value: '', label: 'All' },
                  { value: '0', label: 'Pending' },
                  { value: '1', label: 'Approved' },
                  { value: '2', label: 'Rejected' },
                ]}
              />
            </FormField>
          </>
        }
        filtersReady
        isLoading={isLoading && hasSearched}
        isError={isError}
        error={error}
        onRetry={() => void refetch()}
        isEmpty={hasSearched && applications.length === 0}
        emptyTitle="No applications"
        emptyDescription="No scheme applications match the selected filters."
      >
        <DataTable
          data={hasSearched ? applications : []}
          columns={columns}
          getRowKey={(r) => r.id}
          actions={(row) => (
            <>
              {row.applied_status !== 1 && (
                <button
                  title="Approve"
                  onClick={() => approveMutation.mutate(row.id)}
                  className="text-emerald-600"
                >
                  <Check className="h-4 w-4" />
                </button>
              )}
              {row.applied_status !== 2 && (
                <button
                  title="Reject"
                  onClick={() => rejectMutation.mutate(row.id)}
                  className="text-amber-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </>
          )}
        />
      </ModuleMarkGridPack>

      <EntityFormDialog
        open={applyOpen}
        onOpenChange={setApplyOpen}
        title="Apply Scheme to Student"
        onSubmit={(e) => {
          e.preventDefault();
          handleApply();
        }}
        isLoading={applyMutation.isPending}
        submitLabel="Apply Scheme"
      >
        <div className="space-y-4">
          <FormField label="Scheme" required>
            <Select
              value={applySchemeId ? String(applySchemeId) : ''}
              onChange={(e) => setApplySchemeId(Number(e.target.value) || 0)}
              options={schemes.map((s) => ({ value: String(s.id), label: s.ss_name }))}
              placeholder="Select scheme"
            />
          </FormField>
          <FormField label="Class">
            <Select
              value={applyClassId ? String(applyClassId) : ''}
              onChange={(e) => {
                setApplyClassId(Number(e.target.value) || 0);
                setApplySectionId(0);
                setApplyStudentId(0);
              }}
              options={classes.map((c) => ({ value: String(c.id), label: c.class_name }))}
              placeholder="Select class"
            />
          </FormField>
          <FormField label="Section">
            <Select
              value={applySectionId ? String(applySectionId) : ''}
              onChange={(e) => {
                setApplySectionId(Number(e.target.value) || 0);
                setApplyStudentId(0);
              }}
              options={applySectionOptions}
              placeholder="Select section"
              disabled={!applyClassId}
            />
          </FormField>
          <FormField label="Student" required>
            <Select
              value={applyStudentId ? String(applyStudentId) : ''}
              onChange={(e) => setApplyStudentId(Number(e.target.value) || 0)}
              options={applyStudentOptions}
              placeholder="Select student"
              disabled={!applyClassId || !applySectionId}
            />
          </FormField>
        </div>
      </EntityFormDialog>
    </>
  );
}
