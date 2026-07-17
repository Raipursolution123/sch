import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormNumberField, FormTextField, FormTextareaField } from '@components/forms/fields';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { useCbseExams, useCreateCbseExam } from '@hooks/useCbseExams';
import type { CbseExam } from '@app-types/examinations/cbse-exam';
import { ModuleListPack } from '@workflow-packs';

const schema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  session_id: z.number({ error: 'Select a session' }).int().positive('Select a session'),
  exam_code: z.string().optional(),
  description: z.string().optional(),
  total_working_days: z.number().optional(),
});

type FormValues = z.infer<typeof schema>;

const columns: DataTableColumn<CbseExam>[] = [
  { id: 'name', header: 'Name', cellClassName: 'font-medium', cell: (r) => r.name },
  { id: 'code', header: 'Code', cell: (r) => r.exam_code ?? '—' },
  {
    id: 'session',
    header: 'Session ID',
    cellClassName: 'tabular-nums',
    cell: (r) => r.session_id,
  },
  {
    id: 'active',
    header: 'Active',
    cell: (r) => (r.is_active ? 'Yes' : 'No'),
  },
  {
    id: 'publish',
    header: 'Published',
    cell: (r) => (r.is_publish ? 'Yes' : 'No'),
  },
];

export function CbseExamsPage() {
  const { data, isLoading, isError, error, refetch } = useCbseExams();
  const createMutation = useCreateCbseExam();
  const [dialogOpen, setDialogOpen] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      session_id: 0,
      exam_code: '',
      description: '',
      total_working_days: 0,
    },
  });

  const openCreate = () => {
    reset({
      name: '',
      session_id: 0,
      exam_code: '',
      description: '',
      total_working_days: 0,
    });
    setDialogOpen(true);
  };

  const onSubmit = (values: FormValues) => {
    createMutation.mutate(
      {
        name: values.name,
        session_id: values.session_id,
        exam_code: values.exam_code || null,
        description: values.description || null,
        total_working_days: values.total_working_days ?? 0,
        is_active: 1,
        is_publish: 0,
      },
      { onSuccess: () => setDialogOpen(false) },
    );
  };

  const addAction = (
    <PermissionButton permission="exams.create" onClick={openCreate} className="gap-1">
      <Plus className="h-4 w-4" aria-hidden="true" />
      Add CBSE Exam
    </PermissionButton>
  );

  return (
    <ModuleListPack
      title="CBSE Exams"
      description="List and create CBSE examination definitions."
      actions={addAction}
      isLoading={isLoading}
      loadingMessage="Loading CBSE exams..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && (data?.length ?? 0) === 0}
      emptyTitle="No CBSE exams"
      emptyDescription="Create a CBSE exam to begin assessment setup."
      emptyAction={addAction}
      footer={
        <EntityFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          title="Add CBSE exam"
          onSubmit={handleSubmit(onSubmit)}
          isLoading={createMutation.isPending}
          submitLabel="Create"
        >
          <FormErrorSummary errors={errors} />
          <FormTextField control={control} name="name" label="Name" />
          <FormNumberField control={control} name="session_id" label="Session ID" />
          <FormTextField control={control} name="exam_code" label="Exam code" optional />
          <FormNumberField
            control={control}
            name="total_working_days"
            label="Working days"
            optional
          />
          <FormTextareaField control={control} name="description" label="Description" optional />
        </EntityFormDialog>
      }
    >
      <DataTable data={data ?? []} columns={columns} getRowKey={(row) => row.id} />
    </ModuleListPack>
  );
}
