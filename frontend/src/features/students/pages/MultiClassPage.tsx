import { useMemo, useState } from 'react';
import { Plus, Check, GraduationCap, X } from 'lucide-react';
import { ModuleListPack } from '@workflow-packs';
import { sectionOptionsForClass } from '@features/students/utils/class-section-options';
import { useClasses } from '@hooks/useClasses';
import { useClassSections } from '@hooks/useClassSections';
import { useMultiClassRoster, useSaveMultiClass } from '@hooks/useMultiClass';
import type { ClassSection } from '@app-types/academics/class-section';
import type { MultiClassStudent } from '@services/api/multi-class.service';

export function MultiClassPage() {
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [hasSearched, setHasSearched] = useState(false);

  const [addingClassStudent, setAddingClassStudent] = useState<number | null>(null);
  const [newClass, setNewClass] = useState<string>('');
  const [newSection, setNewSection] = useState<string>('');

  const { data: classesData } = useClasses(1);
  const classes = classesData?.results || [];
  const { data: classSectionsData } = useClassSections(1, { noPaginate: true });
  const classSections = classSectionsData?.results || [];

  const classId = selectedClass && selectedClass !== 'all' ? Number(selectedClass) : undefined;
  const sectionId =
    selectedSection && selectedSection !== 'all' ? Number(selectedSection) : undefined;

  const {
    data: roster,
    isLoading,
    isError,
    error,
    refetch,
  } = useMultiClassRoster(classId, sectionId, hasSearched);
  const saveMutation = useSaveMultiClass();

  const students = roster?.students ?? [];

  const sectionOptions = useMemo(() => {
    if (!selectedClass || selectedClass === 'all') return [];
    return sectionOptionsForClass(classSections as ClassSection[], Number(selectedClass));
  }, [classSections, selectedClass]);

  const newSectionOptions = useMemo(() => {
    if (!newClass) return [];
    return sectionOptionsForClass(classSections as ClassSection[], Number(newClass));
  }, [classSections, newClass]);

  const handleSearch = () => {
    if (!selectedClass || !selectedSection) return;
    setHasSearched(true);
  };

  const extraEnrollments = (student: MultiClassStudent) =>
    student.enrollments.filter((e) => !e.is_primary);

  const saveExtras = (
    student: MultiClassStudent,
    extras: Array<{ class_id: number; section_id: number }>,
  ) => {
    saveMutation.mutate(
      { student_id: student.student_id, enrollments: extras },
      {
        onSuccess: () => {
          setAddingClassStudent(null);
          setNewClass('');
          setNewSection('');
        },
      },
    );
  };

  const handleAddClass = (student: MultiClassStudent) => {
    if (!newClass || !newSection) return;

    const classIdNum = Number(newClass);
    const sectionIdNum = newSection === 'all' ? 0 : Number(newSection);
    if (!classIdNum || (newSection !== 'all' && !sectionIdNum)) return;

    const currentExtras = extraEnrollments(student);
    const isDuplicate = currentExtras.some(
      (e) => e.class_id === classIdNum && e.section_id === sectionIdNum,
    );
    const isPrimaryDuplicate =
      student.primary_class_id === classIdNum && student.primary_section_id === sectionIdNum;

    if (isDuplicate || isPrimaryDuplicate) return;

    saveExtras(student, [
      ...currentExtras.map((e) => ({ class_id: e.class_id, section_id: e.section_id })),
      { class_id: classIdNum, section_id: sectionIdNum },
    ]);
  };

  const handleRemoveExtraClass = (
    student: MultiClassStudent,
    classIdToRemove: number,
    sectionIdToRemove: number,
  ) => {
    const extras = extraEnrollments(student)
      .filter((e) => !(e.class_id === classIdToRemove && e.section_id === sectionIdToRemove))
      .map((e) => ({ class_id: e.class_id, section_id: e.section_id }));
    saveExtras(student, extras);
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
      <div className="mb-6 grid grid-cols-1 gap-4 rounded-lg border border-border bg-card p-4 md:grid-cols-3">
        <div>
          <label className="text-xs font-semibold uppercase text-muted-foreground">Class</label>
          <select
            value={selectedClass}
            onChange={(e) => {
              const val = e.target.value;
              setSelectedClass(val);
              setHasSearched(false);
              if (val === 'all') {
                setSelectedSection('all');
              } else {
                const options = sectionOptionsForClass(
                  classSections as ClassSection[],
                  Number(val),
                );
                setSelectedSection(options.length === 0 ? 'all' : '');
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
            onChange={(e) => {
              setSelectedSection(e.target.value);
              setHasSearched(false);
            }}
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
            disabled={!selectedClass || !selectedSection}
            className="h-10 w-full rounded-md bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/95 disabled:opacity-50"
          >
            Search
          </button>
        </div>
      </div>

      {!hasSearched ? (
        <div className="rounded-xl border border-dashed bg-card/50 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            Select class and section, then click Search to list students.
          </p>
        </div>
      ) : students.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-card/50 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            No students found for the selected class and section criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {students.map((student) => {
            const extras = extraEnrollments(student);
            return (
              <div
                key={student.student_id}
                className="relative rounded-xl border border-border bg-card p-5 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-foreground">{student.student_name}</h4>
                    <p className="text-xs text-muted-foreground">
                      Admission No: {student.admission_no}
                    </p>
                  </div>
                  <GraduationCap className="h-5 w-5 text-primary" />
                </div>

                <div className="mt-4 space-y-2">
                  <span className="block text-xs font-semibold uppercase text-muted-foreground">
                    Assigned Classes
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                      <Check className="h-3 w-3" />
                      {student.primary_class_name} ({student.primary_section_name}) [Primary]
                    </span>
                    {extras.map((enroll) => (
                      <span
                        key={`${enroll.class_id}-${enroll.section_id}`}
                        className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground"
                      >
                        {enroll.class_name} ({enroll.section_name})
                        <button
                          onClick={() =>
                            handleRemoveExtraClass(student, enroll.class_id, enroll.section_id)
                          }
                          disabled={saveMutation.isPending}
                          className="text-muted-foreground hover:text-destructive disabled:opacity-50"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {addingClassStudent === student.student_id ? (
                  <div className="mt-4 border-t pt-4">
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={newClass}
                        onChange={(e) => {
                          const val = e.target.value;
                          setNewClass(val);
                          const options = sectionOptionsForClass(
                            classSections as ClassSection[],
                            Number(val),
                          );
                          setNewSection(options.length === 0 ? 'all' : '');
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
                        className="h-8 rounded-md border px-3 text-xs hover:bg-accent"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleAddClass(student)}
                        disabled={saveMutation.isPending}
                        className="h-8 rounded-md bg-primary px-3 text-xs font-medium text-white disabled:opacity-50"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setAddingClassStudent(student.student_id)}
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
