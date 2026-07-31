import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useAuthStore } from '@store/index';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import {
  FormSelectField,
  FormDateField,
  FormTextField,
  FormTextareaField,
} from '@components/forms/fields';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { Button } from '@components/ui/button';
import {
  useDailyAssignments,
  useCreateDailyAssignment,
  useUpdateDailyAssignment,
  useDeleteDailyAssignment,
} from '@hooks/useHomework';
import { useSubjects } from '@hooks/useSubjects';
import { useStaff } from '@hooks/useStaff';
import type { DailyAssignment } from '@app-types/index';
import { ModuleListPack } from '@workflow-packs';

const schema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  description: z.string().optional().nullable(),
  subject_group_subject_id: z.string().min(1, 'Subject is required'),
  date: z.string().min(1, 'Date is required'),
  remark: z.string().min(1, 'Remark is required'),
});

type FormValues = z.infer<typeof schema>;

export function DailyAssignmentPage() {
  const user = useAuthStore((s) => s.user);
  const { data, isLoading, isError, error, refetch } = useDailyAssignments();
  const { data: subjectsData } = useSubjects(1);
  const { data: staffData } = useStaff(1);

  const subjects = subjectsData?.results || [];
  const staff = staffData?.results || [];

  const createMutation = useCreateDailyAssignment();
  const updateMutation = useUpdateDailyAssignment();
  const deleteMutation = useDeleteDailyAssignment();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<DailyAssignment | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DailyAssignment | null>(null);

  const subjectName = (id: number) => subjects.find((s) => s.id === id)?.name ?? String(id);
  const staffName = (id: number | null) => {
    if (id == null) return '—';
    const member = staff.find((s) => s.id === id);
    return member ? `${member.name} ${member.surname || ''}`.trim() : String(id);
  };

  const columns: DataTableColumn<DailyAssignment>[] = [
    {
      id: 'title',
      header: 'Title',
      cellClassName: 'font-medium',
      cell: (r) => r.title ?? '—',
    },
    {
      id: 'subject',
      header: 'Subject',
      cell: (r) => subjectName(r.subject_group_subject_id),
    },
    {
      id: 'date',
      header: 'Assignment Date',
      cell: (r) => r.date ?? '—',
    },
    {
      id: 'evaluated_by',
      header: 'Evaluated By',
      cell: (r) => staffName(r.evaluated_by),
    },
    {
      id: 'remark',
      header: 'Remarks',
      cell: (r) => r.remark || '—',
    },
  ];

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      subject_group_subject_id: '',
      date: '',
      remark: '',
    },
  });

  const openCreate = () => {
    setSelected(null);
    reset({
      title: '',
      description: '',
      subject_group_subject_id: '',
      date: new Date().toISOString().split('T')[0],
      remark: '',
    });
    setDialogOpen(true);
  };

  const openEdit = (assignment: DailyAssignment) => {
    setSelected(assignment);
    reset({
      title: assignment.title ?? '',
      description: assignment.description ?? '',
      subject_group_subject_id: String(assignment.subject_group_subject_id),
      date: assignment.date ?? '',
      remark: assignment.remark,
    });
    setDialogOpen(true);
  };

  const onSubmit = (values: FormValues) => {
    const payload = {
      title: values.title,
      description: values.description || null,
      subject_group_subject_id: Number(values.subject_group_subject_id),
      date: values.date,
      remark: values.remark,
      student_session_id: 1, // Default or loaded student session
      evaluated_by: selected
        ? (selected.evaluated_by ?? user?.user_id ?? 291)
        : (user?.user_id ?? 291),
    };

    if (selected) {
      updateMutation.mutate(
        { id: selected.id, payload },
        { onSuccess: () => setDialogOpen(false) },
      );
      return;
    }
    createMutation.mutate(payload, { onSuccess: () => setDialogOpen(false) });
  };

  const addAction = (
    <Button onClick={openCreate} className="gap-1">
      <Plus className="h-4 w-4" aria-hidden="true" />
      Add Daily Assignment
    </Button>
  );

  const subjectOptions = subjects.map((sub) => ({ value: String(sub.id), label: sub.name }));

  return (
    <ModuleListPack
      title="Daily Assignments"
      description="Manage daily class assignments, topics and notes."
      actions={addAction}
      isLoading={isLoading}
      loadingMessage="Loading daily assignments..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && (data?.results?.length ?? 0) === 0}
      emptyTitle="No daily assignments"
      emptyDescription="Create a daily assignment to get started."
      emptyAction={addAction}
      footer={
        <>
          <EntityFormDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            title={selected ? 'Edit daily assignment' : 'Add daily assignment'}
            onSubmit={handleSubmit(onSubmit)}
            isLoading={createMutation.isPending || updateMutation.isPending}
            submitLabel={selected ? 'Save' : 'Create'}
          >
            <FormErrorSummary errors={errors} />
            <FormTextField control={control} name="title" label="Title" required />
            <FormSelectField
              control={control}
              name="subject_group_subject_id"
              label="Subject"
              options={subjectOptions}
              placeholder="Select Subject"
              required
            />
            <FormDateField control={control} name="date" label="Date" required />
            <FormTextareaField control={control} name="description" label="Description" optional />
            <FormTextareaField control={control} name="remark" label="Remark" required />
          </EntityFormDialog>
          <ConfirmDialog
            open={deleteTarget !== null}
            onOpenChange={(open) => {
              if (!open) setDeleteTarget(null);
            }}
            title="Delete daily assignment"
            description="Are you sure you want to delete this daily assignment? This action cannot be undone."
            confirmLabel="Delete"
            destructive
            isLoading={deleteMutation.isPending}
            onConfirm={() => {
              if (!deleteTarget) return;
              deleteMutation.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
            }}
          />
        </>
      }
    >
      <DataTable
        data={data?.results ?? []}
        columns={columns}
        getRowKey={(row) => row.id}
        actions={(row) => (
          <>
            <Button variant="ghost" size="sm" onClick={() => openEdit(row)} aria-label="Edit">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleteTarget(row)}
              aria-label="Delete"
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
      />
    </ModuleListPack>
  );
}
