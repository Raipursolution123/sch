import { useState, useMemo } from 'react';
import { Plus, Check, GraduationCap, X } from 'lucide-react';
import { toast } from 'sonner';
import { ModuleListPack } from '@workflow-packs';
import { sectionOptionsForClass } from '@features/students/utils/class-section-options';
import { useClasses } from '@hooks/useClasses';
import { useClassSections } from '@hooks/useClassSections';
import { useStudents } from '@hooks/useStudents';
import type { ClassSection } from '@app-types/academics/class-section';

interface EnrolledClass {
  classId: number;
  className: string;
  sectionId: number;
  sectionName: string;
  isPrimary?: boolean;
}

export function MultiClassPage() {
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [searchedClass, setSearchedClass] = useState<string>('');
  const [searchedSection, setSearchedSection] = useState<string>('');
  const [hasSearched, setHasSearched] = useState(false);

  const [addingClassStudent, setAddingClassStudent] = useState<number | null>(null);
  const [newClass, setNewClass] = useState<string>('');
  const [newSection, setNewSection] = useState<string>('');

  // Local state to store simulated secondary class enrollments per student
  const [extraEnrollments, setExtraEnrollments] = useState<Record<number, EnrolledClass[]>>({});

  // Fetch classes
  const { data: classesData } = useClasses(1);
  const classes = classesData?.results || [];

  // Fetch class-section mappings
  const { data: classSectionsData } = useClassSections(1, { noPaginate: true });
  const classSections = classSectionsData?.results || [];

  // Fetch all active students
  const { data: students = [], isLoading, isError, error, refetch } = useStudents();

  // Filter sections options based on selected class
  const sectionOptions = useMemo(() => {
    if (!selectedClass || selectedClass === 'all') return [];
    return sectionOptionsForClass(classSections as ClassSection[], Number(selectedClass));
  }, [classSections, selectedClass]);

  // Filter sections options for new assignment
  const newSectionOptions = useMemo(() => {
    if (!newClass) return [];
    return sectionOptionsForClass(classSections as ClassSection[], Number(newClass));
  }, [classSections, newClass]);

  const handleSearch = () => {
    if (!selectedClass || !selectedSection) {
      toast.error('Please select Class and Section criteria');
      return;
    }
    setSearchedClass(selectedClass);
    setSearchedSection(selectedSection);
    setHasSearched(true);
  };

  const filteredStudents = useMemo(() => {
    if (!hasSearched) return [];
    return students.filter((s) => {
      // Filter by Class
      if (searchedClass !== 'all' && String(s.class_id) !== String(searchedClass)) {
        return false;
      }
      // Filter by Section
      if (searchedSection !== 'all' && String(s.section_id) !== String(searchedSection)) {
        return false;
      }
      return true;
    });
  }, [students, searchedClass, searchedSection, hasSearched]);

  const handleAddClass = (studentId: number) => {
    if (!newClass || !newSection) {
      toast.error('Please select both Class and Section');
      return;
    }

    const selectedClassObj = classes.find((c) => String(c.id) === String(newClass));
    const selectedSectionObj = classSections.find((s: any) => String(s.section_id) === String(newSection));

    let sectionName = '';
    let sectionId = 0;

    if (newSection === 'all') {
      sectionName = 'All Sections';
      sectionId = 0;
    } else if (selectedSectionObj) {
      sectionName = selectedSectionObj.section_name || '';
      sectionId = selectedSectionObj.section_id;
    }

    if (!selectedClassObj) {
      toast.error('Invalid class selected');
      return;
    }

    const newEnrollment: EnrolledClass = {
      classId: selectedClassObj.id,
      className: selectedClassObj.class_name,
      sectionId,
      sectionName,
      isPrimary: false,
    };

    // Check duplicate
    const currentExtras = extraEnrollments[studentId] || [];
    const isDuplicate = currentExtras.some(
      (e) => String(e.classId) === String(newClass) && String(e.sectionId) === String(newSection)
    );

    const student = students.find((s) => s.id === studentId);
    const isPrimaryDuplicate = student && String(student.class_id) === String(newClass) && String(student.section_id) === String(newSection);

    if (isDuplicate || isPrimaryDuplicate) {
      toast.error('This class and section is already assigned to this student.');
      return;
    }

    setExtraEnrollments((prev) => ({
      ...prev,
      [studentId]: [...currentExtras, newEnrollment],
    }));

    toast.success('Additional Class/Section assigned successfully');
    setAddingClassStudent(null);
    setNewClass('');
    setNewSection('');
  };

  const handleRemoveExtraClass = (studentId: number, classId: number, sectionId: number) => {
    setExtraEnrollments((prev) => ({
      ...prev,
      [studentId]: (prev[studentId] || []).filter(
        (e) => !(e.classId === classId && e.sectionId === sectionId)
      ),
    }));
    toast.success('Assigned class removed');
  };

  return (
    <ModuleListPack
      title="Multi Class Student"
      description="Enroll students in multiple classes or sections for elective courses or dual streams."
      isLoading={isLoading}
      loadingMessage="Loading students..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
    >
      {/* Criteria Filter */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3 rounded-lg border border-border bg-card p-4">
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase">Class</label>
          <select
            value={selectedClass}
            onChange={(e) => {
              const val = e.target.value;
              setSelectedClass(val);
              if (val === 'all') {
                setSelectedSection('all');
              } else {
                const options = sectionOptionsForClass(classSections as ClassSection[], Number(val));
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
          <label className="text-xs font-semibold text-muted-foreground uppercase">Section</label>
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
            className="h-10 w-full rounded-md bg-primary text-primary-foreground font-medium text-sm transition-colors hover:bg-primary/95"
          >
            Search
          </button>
        </div>
      </div>

      {/* Students List */}
      {!hasSearched ? (
        <div className="text-center py-12 border border-dashed rounded-xl bg-card/50">
          <p className="text-sm text-muted-foreground">Select Class and Section, then click Search to list students.</p>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="text-center py-12 border border-dashed rounded-xl bg-card/50">
          <p className="text-sm text-muted-foreground">No students found for the selected Class and Section criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {filteredStudents.map((student) => {
            const extras = extraEnrollments[student.id] || [];
            return (
              <div key={student.id} className="relative rounded-xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-foreground">{student.full_name}</h4>
                    <p className="text-xs text-muted-foreground">Admission No: {student.admission_no}</p>
                  </div>
                  <GraduationCap className="h-5 w-5 text-primary" />
                </div>

                <div className="mt-4 space-y-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase block">Assigned Classes</span>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                      <Check className="h-3 w-3" />
                      {student.class_name} ({student.section_name}) [Primary]
                    </span>
                    {extras.map((enroll) => (
                      <span
                        key={`${enroll.classId}-${enroll.sectionId}`}
                        className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground"
                      >
                        {enroll.className} ({enroll.sectionName})
                        <button
                          onClick={() => handleRemoveExtraClass(student.id, enroll.classId, enroll.sectionId)}
                          className="hover:text-destructive text-muted-foreground"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {addingClassStudent === student.id ? (
                  <div className="mt-4 border-t pt-4">
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={newClass}
                        onChange={(e) => {
                          const val = e.target.value;
                          setNewClass(val);
                          const options = sectionOptionsForClass(classSections as ClassSection[], Number(val));
                          if (options.length === 0) {
                            setNewSection('all');
                          } else {
                            setNewSection('');
                          }
                        }}
                        className="h-9 rounded-md border border-input bg-background px-2 text-xs"
                      >
                        <option value="">Class</option>
                        {classes.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.class_name}
                          </option>
                        ))}
                      </select>
                      <select
                        value={newSection}
                        onChange={(e) => setNewSection(e.target.value)}
                        disabled={!newClass}
                        className="h-9 rounded-md border border-input bg-background px-2 text-xs disabled:opacity-50"
                      >
                        <option value="">Section</option>
                        {newClass && <option value="all">All Sections</option>}
                        {newSectionOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mt-3 flex justify-end gap-2">
                      <button
                        onClick={() => setAddingClassStudent(null)}
                        className="h-8 rounded-md px-3 text-xs border hover:bg-accent"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleAddClass(student.id)}
                        className="h-8 rounded-md px-3 text-xs bg-primary text-white font-medium"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setAddingClassStudent(student.id)}
                    className="mt-4 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    <Plus className="h-4 w-4" />
                    Assign Another Class
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </ModuleListPack>
  );
}
