import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormSelectField, FormNumberField, FormTextField, FormTextareaField } from '@components/forms/fields';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { ConfirmDialog } from '@components/index';
import { useCbseExams, useCreateCbseExam, useUpdateCbseExam, useDeleteCbseExam } from '@hooks/useCbseExams';
import { useSessions } from '@hooks/useSessions';
import type { CbseExam } from '@app-types/examinations/cbse-exam';
import { ModuleListPack } from '@workflow-packs';

const schema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  session_id: z.coerce.number({ error: 'Select a session' }).int().positive('Select a session'),
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
  const { data: sessionsData } = useSessions();
  const createMutation = useCreateCbseExam();
  const updateMutation = useUpdateCbseExam();
  const deleteMutation = useDeleteCbseExam();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<CbseExam | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CbseExam | null>(null);

  const sessionOptions = sessionsData?.results?.map(s => ({
    label: s.session,
    value: String(s.id),
  })) || [];

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
    setSelectedExam(null);
    reset({
      name: '',
      session_id: 0,
      exam_code: '',
      description: '',
      total_working_days: 0,
    });
    setDialogOpen(true);
  };

  const openEdit = (exam: CbseExam) => {
    setSelectedExam(exam);
    reset({
      name: exam.name,
      session_id: exam.session_id,
      exam_code: exam.exam_code || '',
      description: exam.description || '',
      total_working_days: exam.total_working_days || 0,
    });
    setDialogOpen(true);
  };

  const onSubmit = (values: FormValues) => {
    const payload = {
      name: values.name,
      session_id: values.session_id,
      exam_code: values.exam_code || null,
      description: values.description || null,
      total_working_days: values.total_working_days ?? 0,
      is_active: selectedExam ? selectedExam.is_active : 1,
      is_publish: selectedExam ? selectedExam.is_publish : 0,
    };
    
    if (selectedExam) {
      updateMutation.mutate(
        { id: selectedExam.id, payload },
        { onSuccess: () => setDialogOpen(false) },
      );
    } else {
      createMutation.mutate(payload, { onSuccess: () => setDialogOpen(false) });
    }
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
        <>
          <EntityFormDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            title={selectedExam ? "Edit CBSE exam" : "Add CBSE exam"}
            onSubmit={handleSubmit(onSubmit)}
            isLoading={selectedExam ? updateMutation.isPending : createMutation.isPending}
            submitLabel={selectedExam ? "Save Changes" : "Create"}
          >
            <FormErrorSummary errors={errors} />
            <FormTextField control={control} name="name" label="Name" />
            <FormSelectField 
              control={control} 
              name="session_id" 
              label="Session" 
              options={sessionOptions}
              placeholder="Select a session"
              required
            />
            <FormTextField control={control} name="exam_code" label="Exam code" optional />
            <FormNumberField
              control={control}
              name="total_working_days"
              label="Working days"
              optional
            />
            <FormTextareaField control={control} name="description" label="Description" optional />
          </EntityFormDialog>
          <ConfirmDialog
            open={!!deleteTarget}
            onOpenChange={(open) => !open && setDeleteTarget(null)}
            title="Delete CBSE Exam"
            description={
              deleteTarget
                ? `Are you sure you want to delete "${deleteTarget.name}"? This action cannot be undone.`
                : ''
            }
            confirmLabel="Delete Exam"
            isDestructive
            isLoading={deleteMutation.isPending}
            onConfirm={() => {
              if (deleteTarget) {
                deleteMutation.mutate(deleteTarget.id, {
                  onSuccess: () => setDeleteTarget(null),
                });
              }
            }}
          />
        </>
      }
    >
      <DataTable 
        data={data ?? []} 
        columns={columns} 
        getRowKey={(row) => row.id} 
        actions={(exam) => (
          <>
            <PermissionButton
              permission="exams.edit"
              variant="ghost"
              size="sm"
              onClick={() => openEdit(exam)}
              aria-label={`Edit ${exam.name}`}
            >
              <Pencil className="h-4 w-4" />
            </PermissionButton>
            <PermissionButton
              permission="exams.delete"
              variant="ghost"
              size="sm"
              onClick={() => setDeleteTarget(exam)}
              aria-label={`Delete ${exam.name}`}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </PermissionButton>
          </>
        )}
      />
    </ModuleListPack>
  );
}
