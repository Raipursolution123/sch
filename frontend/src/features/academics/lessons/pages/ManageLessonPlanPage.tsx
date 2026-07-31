import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { z } from 'zod';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormTextField, FormTextareaField, FormSelectField } from '@components/forms/fields';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { ModuleListPack } from '@workflow-packs';
import {
  useSyllabusList,
  useCreateSyllabus,
  useUpdateSyllabus,
  useDeleteSyllabus,
} from '@hooks/useSyllabus';
import { useTopicList } from '@hooks/useTopics';
import type { SubjectSyllabus } from '@app-types/academics/syllabus';

const schema = z.object({
  topic_id: z.string().min(1, 'Topic is required'),
  date: z.string().min(1, 'Date is required'),
  time_from: z.string().min(1, 'Start time is required'),
  time_to: z.string().min(1, 'End time is required'),
  presentation: z.string().optional(),
  lacture_youtube_url: z.string().optional(),
  lacture_video: z.string().optional(),
  sub_topic: z.string().optional(),
  teaching_method: z.string().optional(),
  general_objectives: z.string().optional(),
  previous_knowledge: z.string().optional(),
  comprehensive_questions: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export function ManageLessonPlanPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error, refetch } = useSyllabusList({ page });
  const { data: topicsData } = useTopicList({ page: 1, limit: 100 });
  const topics = topicsData?.results || [];

  const createMutation = useCreateSyllabus();
  const updateMutation = useUpdateSyllabus();
  const deleteMutation = useDeleteSyllabus();

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<SubjectSyllabus | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SubjectSyllabus | null>(null);

  const { control, handleSubmit, reset, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      topic_id: '',
      date: '',
      time_from: '',
      time_to: '',
      presentation: '',
      lacture_youtube_url: '',
      lacture_video: '',
      sub_topic: '',
      teaching_method: '',
      general_objectives: '',
      previous_knowledge: '',
      comprehensive_questions: '',
    },
  });

  useEffect(() => {
    if (!open) return;
    if (selected) {
      reset({
        topic_id: String(selected.topic_id),
        date: selected.date || '',
        time_from: selected.time_from || '',
        time_to: selected.time_to || '',
        presentation: selected.presentation || '',
        lacture_youtube_url: selected.lacture_youtube_url || '',
        lacture_video: selected.lacture_video || '',
        sub_topic: selected.sub_topic || '',
        teaching_method: selected.teaching_method || '',
        general_objectives: selected.general_objectives || '',
        previous_knowledge: selected.previous_knowledge || '',
        comprehensive_questions: selected.comprehensive_questions || '',
      });
    } else {
      reset({
        topic_id: '',
        date: '',
        time_from: '',
        time_to: '',
        presentation: '',
        lacture_youtube_url: '',
        lacture_video: '',
        sub_topic: '',
        teaching_method: '',
        general_objectives: '',
        previous_knowledge: '',
        comprehensive_questions: '',
      });
    }
  }, [open, selected, reset]);

  const addAction = (
    <PermissionButton
      permission="manage_lesson_plan.create"
      onClick={() => {
        setSelected(null);
        setOpen(true);
      }}
      className="gap-1"
    >
      <Plus className="h-4 w-4" />
      Add Log
    </PermissionButton>
  );

  const columns: DataTableColumn<SubjectSyllabus>[] = [
    {
      id: 'topic',
      header: 'Topic',
      cellClassName: 'font-medium',
      cell: (r) => {
        const topicObj = topics.find((t) => t.id === r.topic_id);
        return topicObj ? topicObj.name : `Topic ID: ${r.topic_id}`;
      },
    },
    {
      id: 'sub_topic',
      header: 'Sub Topic',
      cell: (r) => r.sub_topic || '—',
    },
    {
      id: 'date',
      header: 'Date',
      cell: (r) => r.date,
    },
    {
      id: 'time',
      header: 'Time Window',
      cell: (r) => `${r.time_from} - ${r.time_to}`,
    },
  ];

  const listData = data?.results || [];
  const count = data?.count || 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Manage Lesson Plan</h1>
        <p className="text-sm text-muted-foreground">
          Log daily syllabus execution progress, teaching methods, and lesson objectives.
        </p>
      </div>

      <ModuleListPack
        title=""
        description=""
        actions={addAction}
        isLoading={isLoading}
        loadingMessage="Loading syllabus logs..."
        isError={isError}
        error={error}
        onRetry={() => void refetch()}
        isEmpty={!isLoading && !isError && listData.length === 0}
        emptyTitle="No syllabus logs"
        emptyDescription="Create a syllabus progress log to record what was taught."
        emptyAction={addAction}
      >
        <DataTable
          data={listData}
          columns={columns}
          getRowKey={(r) => r.id}
          pagination={{
            page,
            pageSize: 10,
            totalCount: count,
            onPageChange: setPage,
          }}
          actions={(row) => (
            <>
              <PermissionButton
                permission="manage_lesson_plan.edit"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelected(row);
                  setOpen(true);
                }}
              >
                <Pencil className="h-4 w-4" />
              </PermissionButton>
              <PermissionButton
                permission="manage_lesson_plan.delete"
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => setDeleteTarget(row)}
              >
                <Trash2 className="h-4 w-4" />
              </PermissionButton>
            </>
          )}
        />
      </ModuleListPack>

      <EntityFormDialog
        open={open}
        onOpenChange={setOpen}
        title={selected ? 'Edit Syllabus Log' : 'Add Syllabus Log'}
        onSubmit={handleSubmit((values) => {
          const payload = {
            topic_id: Number(values.topic_id),
            date: values.date,
            time_from: values.time_from,
            time_to: values.time_to,
            presentation: values.presentation?.trim() || '',
            lacture_youtube_url: values.lacture_youtube_url?.trim() || '',
            lacture_video: values.lacture_video?.trim() || '',
            sub_topic: values.sub_topic?.trim() || '',
            teaching_method: values.teaching_method?.trim() || '',
            general_objectives: values.general_objectives?.trim() || '',
            previous_knowledge: values.previous_knowledge?.trim() || '',
            comprehensive_questions: values.comprehensive_questions?.trim() || '',
          };
          if (selected) {
            updateMutation.mutate(
              { id: selected.id, data: payload },
              { onSuccess: () => setOpen(false) },
            );
            return;
          }
          createMutation.mutate(payload, { onSuccess: () => setOpen(false) });
        })}
        isLoading={createMutation.isPending || updateMutation.isPending}
      >
        <FormErrorSummary errors={formState.errors} />
        <FormSelectField
          control={control}
          name="topic_id"
          label="Topic"
          required
          options={topics.map((t) => ({ label: t.name, value: String(t.id) }))}
        />
        <FormTextField control={control} name="date" label="Date" type="date" required />
        <div className="grid grid-cols-2 gap-4">
          <FormTextField
            control={control}
            name="time_from"
            label="Time From (e.g. 10:00 AM)"
            required
          />
          <FormTextField
            control={control}
            name="time_to"
            label="Time To (e.g. 11:00 AM)"
            required
          />
        </div>
        <FormTextField control={control} name="sub_topic" label="Sub Topic" />
        <FormTextareaField control={control} name="presentation" label="Presentation" />
        <FormTextareaField control={control} name="teaching_method" label="Teaching Method" />
        <FormTextareaField control={control} name="general_objectives" label="General Objectives" />
        <FormTextareaField control={control} name="previous_knowledge" label="Previous Knowledge" />
        <FormTextareaField
          control={control}
          name="comprehensive_questions"
          label="Comprehensive Questions"
        />
        <div className="grid grid-cols-2 gap-4">
          <FormTextField control={control} name="lacture_youtube_url" label="YouTube URL" />
          <FormTextField control={control} name="lacture_video" label="Video File Name / Path" />
        </div>
      </EntityFormDialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete Syllabus Log?"
        description={`Remove syllabus log for topic ID “${deleteTarget?.topic_id || ''}” on ${deleteTarget?.date || ''}.`}
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteMutation.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
        }}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
