import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormField } from '@components/forms/FormField';
import { FormTextField } from '@components/forms/fields';
import { Button } from '@components/ui/button';
import { Select } from '@components/ui/select';
import { Textarea } from '@components/ui/textarea';
import type { ClassSection } from '@app-types/academics/class-section';
import type { Subject } from '@app-types/academics/subject';
import type { SubjectGroup } from '@app-types/academics/subject-group';
import type { AcademicSession } from '@features/academics/sessions/types/session.types';
import {
  subjectGroupDetailsSchema,
  type SubjectGroupDetailsValues,
} from '@features/academics/subject-groups/schemas/subject-group.schema';
import { cn } from '@utils/cn';

type TabId = 'details' | 'subjects' | 'class-sections';

interface SubjectGroupFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group?: SubjectGroup | null;
  sessions: AcademicSession[];
  subjects: Subject[];
  classSections: ClassSection[];
  defaultSessionId?: number;
  onCreate: (
    values: SubjectGroupDetailsValues & {
      subject_ids?: number[];
      class_section_ids?: number[];
    },
  ) => void;
  onUpdateDetails: (values: SubjectGroupDetailsValues) => void;
  onSyncSubjects: (subjectIds: number[]) => void;
  onSyncClassSections: (classSectionIds: number[]) => void;
  isLoading?: boolean;
}

function toDetailsValues(
  group: SubjectGroup,
  defaultSessionId?: number,
): SubjectGroupDetailsValues {
  return {
    name: group.name,
    description: group.description ?? '',
    session_id: group.session_id ?? defaultSessionId ?? 0,
  };
}

const sessionOptions = (sessions: AcademicSession[]) =>
  sessions.map((s) => ({ value: String(s.id), label: s.session }));

export function SubjectGroupFormDialog({
  open,
  onOpenChange,
  group,
  sessions,
  subjects,
  classSections,
  defaultSessionId,
  onCreate,
  onUpdateDetails,
  onSyncSubjects,
  onSyncClassSections,
  isLoading,
}: SubjectGroupFormDialogProps) {
  const isEdit = Boolean(group);
  const [tab, setTab] = useState<TabId>('details');
  const [subjectIds, setSubjectIds] = useState<number[]>([]);
  const [classSectionIds, setClassSectionIds] = useState<number[]>([]);
  const [classFilter, setClassFilter] = useState<string>('all');
  const [sectionFilter, setSectionFilter] = useState<string>('all');

  const activeSubjects = useMemo(
    () =>
      subjects.filter((s) => s.is_active === 'yes').sort((a, b) => a.name.localeCompare(b.name)),
    [subjects],
  );

  const activeClassSections = useMemo(
    () =>
      classSections
        .filter((cs) => cs.is_active === 'yes')
        .sort((a, b) =>
          `${a.class_name} ${a.section_name}`.localeCompare(`${b.class_name} ${b.section_name}`),
        ),
    [classSections],
  );

  const classFilterOptions = useMemo(() => {
    const classes = [...new Set(activeClassSections.map((cs) => cs.class_name).filter(Boolean))];
    classes.sort();
    return [
      { value: 'all', label: 'All Classes' },
      ...classes.map((c) => ({ value: c!, label: c! })),
    ];
  }, [activeClassSections]);

  const sectionFilterOptions = useMemo(() => {
    const sections = [...new Set(activeClassSections.map((cs) => cs.section_name).filter(Boolean))];
    sections.sort();
    return [
      { value: 'all', label: 'All Sections' },
      ...sections.map((s) => ({ value: s!, label: s! })),
    ];
  }, [activeClassSections]);

  const filteredClassSections = useMemo(() => {
    return activeClassSections.filter((cs) => {
      const matchClass = classFilter === 'all' || cs.class_name === classFilter;
      const matchSection = sectionFilter === 'all' || cs.section_name === sectionFilter;
      return matchClass && matchSection;
    });
  }, [activeClassSections, classFilter, sectionFilter]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SubjectGroupDetailsValues>({
    resolver: zodResolver(subjectGroupDetailsSchema),
    defaultValues: {
      name: '',
      description: '',
      session_id: defaultSessionId ?? 0,
    },
  });

  useEffect(() => {
    if (!open) return;
    setTab('details');
    setClassFilter('all');
    setSectionFilter('all');
    if (group) {
      reset(toDetailsValues(group, defaultSessionId));
      setSubjectIds(group.subject_ids ?? []);
      setClassSectionIds(group.class_section_ids ?? []);
      return;
    }
    reset({
      name: '',
      description: '',
      session_id: defaultSessionId ?? sessions[0]?.id ?? 0,
    });
    setSubjectIds([]);
    setClassSectionIds([]);
  }, [open, group, defaultSessionId, sessions, reset]);

  const tabs: { id: TabId; label: string; editOnly?: boolean }[] = [
    { id: 'details', label: 'Details' },
    { id: 'subjects', label: 'Subjects' },
    { id: 'class-sections', label: 'Class sections' },
  ];

  const visibleTabs = tabs.filter((t) => !t.editOnly || isEdit);

  const getTabIndex = (id: TabId) => tabs.findIndex((t) => t.id === id);
  const currentIdx = getTabIndex(tab);

  const toggleId = (ids: number[], id: number, checked: boolean) =>
    checked ? [...new Set([...ids, id])] : ids.filter((value) => value !== id);

  const handlePrimarySubmit = handleSubmit((values) => {
    if (!isEdit) {
      if (tab === 'details') {
        setTab('subjects');
        return;
      }
      if (tab === 'subjects') {
        setTab('class-sections');
        return;
      }
      onCreate({
        ...values,
        subject_ids: subjectIds,
        class_section_ids: classSectionIds,
      });
      return;
    }
    if (tab === 'details') {
      onUpdateDetails(values);
      return;
    }
    if (tab === 'subjects') {
      onSyncSubjects(subjectIds);
      return;
    }
    onSyncClassSections(classSectionIds);
  });

  const submitLabel = !isEdit
    ? tab === 'details' || tab === 'subjects'
      ? 'Next'
      : 'Create group'
    : tab === 'details'
      ? 'Save details'
      : tab === 'subjects'
        ? 'Save subjects'
        : 'Save class sections';

  return (
    <EntityFormDialog
      open={open}
      onOpenChange={onOpenChange}
      isEdit={isEdit}
      isLoading={isLoading}
      title={isEdit ? 'Edit Subject Group' : 'Add Subject Group'}
      description={
        isEdit
          ? 'Update group metadata and assign subjects to class sections for the selected session.'
          : 'Create a subject group for the selected academic session.'
      }
      submitLabel={submitLabel}
      onSubmit={handlePrimarySubmit}
      scrollable
      size="lg"
    >
      {visibleTabs.length > 1 ? (
        <div className="flex flex-wrap gap-2 border-b pb-3">
          {visibleTabs.map((item) => {
            const itemIdx = getTabIndex(item.id);
            const disabled = !isEdit && itemIdx > currentIdx;
            return (
              <Button
                key={item.id}
                type="button"
                size="sm"
                variant={tab === item.id ? 'default' : 'outline'}
                onClick={() => setTab(item.id)}
                disabled={disabled}
              >
                {item.label}
              </Button>
            );
          })}
        </div>
      ) : null}

      <FormErrorSummary errors={errors} />

      {tab === 'details' ? (
        <>
          <FormTextField
            control={control}
            name="name"
            label="Group name"
            placeholder="Science — Class 5"
            required
          />

          <FormField label="Description" htmlFor="description" error={errors.description?.message}>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Textarea
                  id="description"
                  className="min-h-[80px]"
                  placeholder="Optional notes about this group"
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />
          </FormField>

          <FormField
            label="Academic session"
            htmlFor="session_id"
            error={errors.session_id?.message}
            required
          >
            <Controller
              name="session_id"
              control={control}
              render={({ field }) => (
                <Select
                  id="session_id"
                  options={sessionOptions(sessions)}
                  placeholder="Select session"
                  disabled={isEdit}
                  value={field.value ? String(field.value) : ''}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  aria-invalid={Boolean(errors.session_id)}
                />
              )}
            />
          </FormField>
          {isEdit ? (
            <p className="text-xs text-muted-foreground">
              Session cannot be changed after creation. Create a new group for another session.
            </p>
          ) : null}
        </>
      ) : null}

      {tab === 'subjects' ? (
        <FormField
          label="Subjects"
          hint="Active subjects included in this group for timetables and exams."
        >
          {activeSubjects.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active subjects available.</p>
          ) : (
            <div className="max-h-56 space-y-2 overflow-y-auto rounded-md border p-3">
              {activeSubjects.map((subject) => {
                const checked = subjectIds.includes(subject.id);
                return (
                  <label
                    key={subject.id}
                    className={cn(
                      'flex cursor-pointer items-center gap-2 rounded px-1 py-0.5 text-sm',
                      checked && 'font-medium',
                    )}
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-input"
                      checked={checked}
                      onChange={(e) =>
                        setSubjectIds(toggleId(subjectIds, subject.id, e.target.checked))
                      }
                    />
                    <span>
                      {subject.name}{' '}
                      <code className="text-xs text-muted-foreground">{subject.code}</code>
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </FormField>
      ) : null}

      {tab === 'class-sections' ? (
        <FormField
          label="Class sections"
          hint="Which class–section combinations use this subject group."
        >
          {activeClassSections.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active class sections available.</p>
          ) : (
            <>
              <div className="mb-4 grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label
                    htmlFor="class-filter"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Filter by Class
                  </label>
                  <Select
                    id="class-filter"
                    options={classFilterOptions}
                    value={classFilter}
                    onChange={(e) => setClassFilter(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="section-filter"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Filter by Section
                  </label>
                  <Select
                    id="section-filter"
                    options={sectionFilterOptions}
                    value={sectionFilter}
                    onChange={(e) => setSectionFilter(e.target.value)}
                  />
                </div>
              </div>

              {filteredClassSections.length === 0 ? (
                <p className="rounded-md border border-dashed py-4 text-center text-sm text-muted-foreground">
                  No matching class sections found.
                </p>
              ) : (
                <div className="max-h-56 space-y-2 overflow-y-auto rounded-md border p-3">
                  {filteredClassSections.map((mapping) => {
                    const checked = classSectionIds.includes(mapping.id);
                    return (
                      <label
                        key={mapping.id}
                        className={cn(
                          'flex cursor-pointer items-center gap-2 rounded px-1 py-0.5 text-sm',
                          checked && 'font-medium',
                        )}
                      >
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-input"
                          checked={checked}
                          onChange={(e) =>
                            setClassSectionIds(
                              toggleId(classSectionIds, mapping.id, e.target.checked),
                            )
                          }
                        />
                        {mapping.class_name} — {mapping.section_name}
                      </label>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </FormField>
      ) : null}
    </EntityFormDialog>
  );
}
