import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Trash2, AlertTriangle, Search } from 'lucide-react';
import { toast } from 'sonner';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { ModuleListPack } from '@workflow-packs';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/api-endpoints';
import { sectionOptionsForClass } from '@features/students/utils/class-section-options';
import { useClasses } from '@hooks/useClasses';
import { useClassSections } from '@hooks/useClassSections';
import { useStudents } from '@hooks/useStudents';
import type { StudentListItem } from '@app-types/students/student';
import type { ClassSection } from '@app-types/academics/class-section';

export function BulkDeletePage() {
  const qc = useQueryClient();
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [searchedClass, setSearchedClass] = useState<string>('');
  const [searchedSection, setSearchedSection] = useState<string>('');
  const [hasSearched, setHasSearched] = useState(false);

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [search, setSearch] = useState('');

  // Fetch classes
  const { data: classesData } = useClasses(1);
  const classes = classesData?.results || [];

  // Fetch class-section mappings
  const { data: classSectionsData } = useClassSections(1, { noPaginate: true });
  const classSections = classSectionsData?.results || [];

  // Fetch disable reasons
  const { data: disableReasons = [] } = useQuery({
    queryKey: ['students', 'disable-reasons'],
    queryFn: async () => {
      const { data } = await apiClient.get('/students/disable-reasons/');
      return data.data || [];
    },
  });

  // Filter sections options based on selected class
  const sectionOptions = useMemo(() => {
    if (!selectedClass || selectedClass === 'all') return [];
    return sectionOptionsForClass(classSections as ClassSection[], Number(selectedClass));
  }, [classSections, selectedClass]);

  // Fetch active students list
  const { data: students = [], isLoading, isError, error, refetch } = useStudents();

  const handleSearch = () => {
    if (!selectedClass || !selectedSection) {
      toast.error('Please select Class and Section criteria');
      return;
    }
    setSearchedClass(selectedClass);
    setSearchedSection(selectedSection);
    setHasSearched(true);
    setSelectedIds([]);
  };

  const filteredStudents = useMemo(() => {
    if (!hasSearched) return [];
    return students.filter((student) => {
      // Filter by Class
      if (searchedClass !== 'all' && String(student.class_id) !== String(searchedClass)) {
        return false;
      }
      // Filter by Section
      if (searchedSection !== 'all' && String(student.section_id) !== String(searchedSection)) {
        return false;
      }

      const target = `${student.full_name} ${student.admission_no}`.toLowerCase();
      return target.includes(search.toLowerCase());
    });
  }, [students, searchedClass, searchedSection, search, hasSearched]);

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredStudents.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredStudents.map((s) => s.id));
    }
  };

  const handleBulkDelete = async () => {
    setIsDeleting(true);
    let successCount = 0;
    let failCount = 0;

    // Fetch or ensure at least one active disable reason exists
    let reasonId = disableReasons[0]?.id;
    if (!reasonId) {
      try {
        const { data: newReason } = await apiClient.post('/students/disable-reasons/', {
          reason: 'Bulk Deactivated',
        });
        reasonId = newReason.data?.id;
      } catch (err) {
        toast.error('Cannot perform deactivation because no disable reasons exist.');
        setIsDeleting(false);
        return;
      }
    }

    for (const id of selectedIds) {
      try {
        await apiClient.delete(API_ENDPOINTS.students.detail(id), {
          data: { disable_reason_id: reasonId, dis_note: 'Bulk deleted by Admin' },
        });
        successCount++;
      } catch (err) {
        failCount++;
      }
    }

    setIsDeleting(false);
    setShowConfirm(false);
    setSelectedIds([]);
    void qc.invalidateQueries({ queryKey: ['students'] });
    void refetch();

    if (successCount > 0) {
      toast.success(`Successfully deleted ${successCount} student(s).`);
    }
    if (failCount > 0) {
      toast.error(`Failed to delete ${failCount} student(s).`);
    }
  };

  const columns: DataTableColumn<StudentListItem>[] = [
    {
      id: 'select',
      header: '',
      cell: (r) => (
        <input
          type="checkbox"
          checked={selectedIds.includes(r.id)}
          onChange={() => toggleSelect(r.id)}
          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
        />
      ),
      cellClassName: 'w-10 text-center',
    },
    {
      id: 'admission_no',
      header: 'Admission No',
      cell: (r) => r.admission_no,
    },
    {
      id: 'name',
      header: 'Student Name',
      cellClassName: 'font-medium',
      cell: (r) => r.full_name,
    },
    {
      id: 'class_section',
      header: 'Class (Section)',
      cell: (r) => `${r.class_name} (${r.section_name})`,
    },
    {
      id: 'gender',
      header: 'Gender',
      cell: (r) => r.gender || '-',
    },
  ];

  return (
    <>
      <ModuleListPack
        title="Bulk Delete Students"
        description="Select multiple students to delete/disable their accounts in bulk."
        isLoading={isLoading}
        loadingMessage="Loading students..."
        isError={isError}
        error={error}
        onRetry={() => void refetch()}
      >
        {/* Criteria Filter */}
        <div className="mb-6 grid grid-cols-1 gap-4 rounded-lg border border-border bg-card p-4 md:grid-cols-3">
          <div>
            <label className="text-xs font-semibold uppercase text-muted-foreground">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedClass(val);
                if (val === 'all') {
                  setSelectedSection('all');
                } else {
                  const options = sectionOptionsForClass(
                    classSections as ClassSection[],
                    Number(val),
                  );
                  if (options.length === 0) {
                    setSelectedSection('all');
                  } else {
                    setSelectedSection('');
                  }
                }
              }}
              className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Select Class</option>
              <option value="all">All Classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.class_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase text-muted-foreground">Section</label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              disabled={!selectedClass}
              className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            >
              {selectedClass === 'all' ? (
                <option value="all">All Sections</option>
              ) : (
                <>
                  <option value="">Select Section</option>
                  {selectedClass && <option value="all">All Sections</option>}
                  {sectionOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                  {selectedClass && sectionOptions.length === 0 && (
                    <option value="all">No Sections (Auto-Selected)</option>
                  )}
                </>
              )}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleSearch}
              className="h-10 w-full rounded-md bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/95"
            >
              Search
            </button>
          </div>
        </div>

        {hasSearched ? (
          <>
            <div className="mb-6 flex items-center justify-between gap-4">
              <div className="relative max-w-sm flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by name, admission no..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={toggleSelectAll}
                  className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  {selectedIds.length === filteredStudents.length ? 'Deselect All' : 'Select All'}
                </button>

                <PermissionButton
                  permission="students.delete"
                  variant="destructive"
                  disabled={selectedIds.length === 0}
                  onClick={() => setShowConfirm(true)}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Selected ({selectedIds.length})
                </PermissionButton>
              </div>
            </div>

            <DataTable data={filteredStudents} columns={columns} getRowKey={(r) => r.id} />
          </>
        ) : (
          <div className="rounded-xl border border-dashed bg-card/50 py-12 text-center">
            <p className="text-sm text-muted-foreground">
              Select Class and Section, then click Search to list students.
            </p>
          </div>
        )}
      </ModuleListPack>

      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title="Confirm Bulk Deactivation"
        description={
          <div className="space-y-2">
            <p>
              Are you sure you want to deactivate/disable the {selectedIds.length} selected
              student(s)?
            </p>
            <div className="flex items-center gap-2 rounded-md border border-yellow-200 bg-yellow-50 p-3 text-xs text-yellow-800">
              <AlertTriangle className="h-4 w-4 shrink-0 text-yellow-600" />
              <span>
                Disabled students will be moved to the Disabled Students list. Their records will
                not be permanently deleted.
              </span>
            </div>
          </div>
        }
        confirmLabel="Deactivate Students"
        destructive
        onConfirm={handleBulkDelete}
        isLoading={isDeleting}
      />
    </>
  );
}
