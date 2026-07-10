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
  onCreate: (values: SubjectGroupDetailsValues) => void;
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

  const activeSubjects = useMemo(
    () => subjects.filter((s) => s.is_active === 'yes').sort((a, b) => a.name.localeCompare(b.name)),
    [subjects],
  );

  const activeClassSections = useMemo(
    () =>
      classSections
        .filter((cs) => cs.is_active === 'yes')
        .sort((a, b) =>
          `${a.class_name} ${a.section_name}`.localeCompare(
            `${b.class_name} ${b.section_name}`,
          ),
        ),
    [classSections],
  );

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
    { id: 'subjects', label: 'Subjects', editOnly: true },
    { id: 'class-sections', label: 'Class sections', editOnly: true },
  ];

  const visibleTabs = tabs.filter((t) => !t.editOnly || isEdit);

  const toggleId = (ids: number[], id: number, checked: boolean) =>
    checked ? [...new Set([...ids, id])] : ids.filter((value) => value !== id);

  const handlePrimarySubmit = handleSubmit((values) => {
    if (!isEdit) {
      onCreate(values);
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
    ? 'Create group'
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
      {isEdit && visibleTabs.length > 1 ? (
        <div className="flex flex-wrap gap-2 border-b pb-3">
          {visibleTabs.map((item) => (
            <Button
              key={item.id}
              type="button"
              size="sm"
              variant={tab === item.id ? 'default' : 'outline'}
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </Button>
          ))}
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

      {tab === 'subjects' && isEdit ? (
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

      {tab === 'class-sections' && isEdit ? (
        <FormField
          label="Class sections"
          hint="Which class–section combinations use this subject group."
        >
          {activeClassSections.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active class sections available.</p>
          ) : (
            <div className="max-h-56 space-y-2 overflow-y-auto rounded-md border p-3">
              {activeClassSections.map((mapping) => {
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
        </FormField>
      ) : null}
    </EntityFormDialog>
  );
}
