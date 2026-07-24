import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { z } from 'zod';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import {
  FormNumberField,
  FormSelectField,
  FormTextField,
  FormTextareaField,
} from '@components/forms/fields';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { PermissionButton } from '@components/rbac/PermissionButton';
import {
  useCreateQuestion,
  useDeleteQuestion,
  useQuestions,
  useUpdateQuestion,
} from '@hooks/useOnlineExams';
import { useClasses } from '@hooks/useClasses';
import type { QuestionBankItem } from '@app-types/examinations/online-exams';
import { ModuleListPack } from '@workflow-packs';

const QUESTION_TYPES = [
  { value: 'singlechoice', label: 'Single choice' },
  { value: 'multichoice', label: 'Multi choice' },
  { value: 'true_false', label: 'True / False' },
  { value: 'descriptive', label: 'Descriptive' },
] as const;

const LEVELS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
] as const;

const schema = z.object({
  class_id: z.string().min(1, 'Class is required'),
  question_type: z.string().min(1, 'Question type is required'),
  level: z.string().min(1, 'Level is required'),
  question: z.string().trim().min(1, 'Question text is required'),
  opt_a: z.string().optional(),
  opt_b: z.string().optional(),
  opt_c: z.string().optional(),
  opt_d: z.string().optional(),
  opt_e: z.string().optional(),
  correct: z.string().optional(),
  qscore: z.number({ error: 'Score is required' }).min(0),
});
type FormValues = z.infer<typeof schema>;

const defaultValues: FormValues = {
  class_id: '',
  question_type: 'singlechoice',
  level: 'low',
  question: '',
  opt_a: '',
  opt_b: '',
  opt_c: '',
  opt_d: '',
  opt_e: '',
  correct: '',
  qscore: 1,
};

export function QuestionBankPage() {
  const { data = [], isLoading, isError, error, refetch } = useQuestions();
  const { data: classesData } = useClasses();
  const classes = classesData?.results || [];
  const createMutation = useCreateQuestion();
  const updateMutation = useUpdateQuestion();
  const deleteMutation = useDeleteQuestion();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<QuestionBankItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<QuestionBankItem | null>(null);
  const { control, handleSubmit, reset, formState, watch } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const questionType = watch('question_type');
  const showOptions = questionType !== 'descriptive';

  const activeClasses = useMemo(
    () => classes.filter((c) => c.is_active === 'yes').sort((a, b) => a.sort_order - b.sort_order),
    [classes],
  );

  const classOptions = useMemo(
    () => activeClasses.map((c) => ({ value: String(c.id), label: c.class_name })),
    [activeClasses],
  );

  const classLabel = useMemo(() => {
    const map = new Map(classes.map((c) => [c.id, c.class_name]));
    return (id: number) => map.get(id) || String(id);
  }, [classes]);

  const typeLabel = useMemo(() => {
    const map = new Map(QUESTION_TYPES.map((t) => [t.value, t.label]));
    return (value: string) => map.get(value as (typeof QUESTION_TYPES)[number]['value']) || value;
  }, []);

  const columns: DataTableColumn<QuestionBankItem>[] = useMemo(
    () => [
      {
        id: 'question',
        header: 'Question',
        cellClassName: 'font-medium max-w-md truncate',
        cell: (r) => r.question || '—',
      },
      {
        id: 'type',
        header: 'Type',
        cell: (r) => typeLabel(r.question_type),
      },
      {
        id: 'level',
        header: 'Level',
        cell: (r) => r.level || '—',
      },
      {
        id: 'class',
        header: 'Class',
        cell: (r) => classLabel(r.class_id),
      },
      {
        id: 'score',
        header: 'Score',
        cell: (r) => r.qscore ?? '—',
      },
    ],
    [classLabel, typeLabel],
  );

  useEffect(() => {
    if (!open) return;
    if (selected) {
      reset({
        class_id: String(selected.class_id),
        question_type: selected.question_type || 'singlechoice',
        level: selected.level || 'low',
        question: selected.question || '',
        opt_a: selected.opt_a || '',
        opt_b: selected.opt_b || '',
        opt_c: selected.opt_c || '',
        opt_d: selected.opt_d || '',
        opt_e: selected.opt_e || '',
        correct: selected.correct || '',
        qscore: selected.qscore ?? 1,
      });
      return;
    }
    reset({
      ...defaultValues,
      class_id: classOptions[0]?.value || '',
    });
  }, [open, selected, reset, classOptions]);

  const addAction = (
    <PermissionButton
      permission="onlineexams.question.create"
      onClick={() => {
        setSelected(null);
        setOpen(true);
      }}
      className="gap-1"
    >
      <Plus className="h-4 w-4" />
      Add Question
    </PermissionButton>
  );

  return (
    <>
      <ModuleListPack
        title="Question Bank"
        description="Build reusable questions for online examinations."
        actions={addAction}
        isLoading={isLoading}
        loadingMessage="Loading questions..."
        isError={isError}
        error={error}
        onRetry={() => void refetch()}
        isEmpty={!isLoading && !isError && data.length === 0}
        emptyTitle="No questions"
        emptyDescription="Create questions to attach to online exams."
        emptyAction={addAction}
      >
        <DataTable
          data={data}
          columns={columns}
          getRowKey={(r) => r.id}
          actions={(row) => (
            <>
              <PermissionButton
                permission="onlineexams.question.edit"
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
                permission="onlineexams.question.delete"
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
        title={selected ? 'Edit Question' : 'Add Question'}
        scrollable
        size="lg"
        onSubmit={handleSubmit((values) => {
          const payload = {
            class_id: Number(values.class_id),
            question_type: values.question_type,
            level: values.level,
            question: values.question,
            opt_a: values.opt_a || '',
            opt_b: values.opt_b || '',
            opt_c: values.opt_c || '',
            opt_d: values.opt_d || '',
            opt_e: values.opt_e || '',
            correct: values.correct || '',
            qscore: values.qscore,
          };
          if (selected) {
            updateMutation.mutate(
              { id: selected.id, payload },
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
          name="class_id"
          label="Class"
          options={classOptions}
          required
        />
        <FormSelectField
          control={control}
          name="question_type"
          label="Question type"
          options={[...QUESTION_TYPES]}
          required
        />
        <FormSelectField
          control={control}
          name="level"
          label="Level"
          options={[...LEVELS]}
          required
        />
        <FormTextareaField control={control} name="question" label="Question" required />
        {showOptions ? (
          <>
            <FormTextField control={control} name="opt_a" label="Option A" />
            <FormTextField control={control} name="opt_b" label="Option B" />
            <FormTextField control={control} name="opt_c" label="Option C" />
            <FormTextField control={control} name="opt_d" label="Option D" />
            <FormTextField control={control} name="opt_e" label="Option E" />
            <FormTextField
              control={control}
              name="correct"
              label="Correct answer"
              hint="e.g. opt_a, or comma-separated for multi-choice"
            />
          </>
        ) : null}
        <FormNumberField control={control} name="qscore" label="Score" min={0} />
      </EntityFormDialog>
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete question?"
        description="Remove this question from the bank."
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteMutation.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
        }}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}
