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
  FormNumberField,
  FormTextareaField,
} from '@components/forms/fields';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { Button } from '@components/ui/button';
import {
  useHomeworkList,
  useCreateHomework,
  useUpdateHomework,
  useDeleteHomework,
} from '@hooks/useHomework';
import { useClasses } from '@hooks/useClasses';
import { useSections } from '@hooks/useSections';
import { useSubjects } from '@hooks/useSubjects';
import { useStaff } from '@hooks/useStaff';
import { useActiveSession } from '@hooks/useSessions';
import type { Homework } from '@app-types/index';
import { ModuleListPack } from '@workflow-packs';

const schema = z.object({
  class_id: z.string().min(1, 'Class is required'),
  section_id: z.string().min(1, 'Section is required'),
  subject_id: z.string().min(1, 'Subject is required'),
  staff_id: z.string().min(1, 'Staff/Teacher is required'),
  homework_date: z.string().min(1, 'Homework Date is required'),
  submit_date: z.string().min(1, 'Submit Date is required'),
  marks: z.number().optional().nullable(),
  description: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof schema>;

export function HomeworkPage() {
  const user = useAuthStore((s) => s.user);
  const { data: activeSession } = useActiveSession();
  const { data, isLoading, isError, error, refetch } = useHomeworkList();

  const { data: classesData } = useClasses(1);
  const { data: sectionsData } = useSections(1);
  const { data: subjectsData } = useSubjects(1);
  const { data: staffData } = useStaff(1);

  const classes = classesData?.results || [];
  const sections = sectionsData?.results || [];
  const subjects = subjectsData?.results || [];
  const staff = staffData?.results || [];

  const createMutation = useCreateHomework();
  const updateMutation = useUpdateHomework();
  const deleteMutation = useDeleteHomework();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<Homework | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Homework | null>(null);

  const className = (id: number) => classes.find((c) => c.id === id)?.class_name ?? String(id);
  const sectionName = (id: number) => sections.find((s) => s.id === id)?.section_name ?? String(id);
  const subjectName = (id: number | null) =>
    id != null ? (subjects.find((s) => s.id === id)?.name ?? String(id)) : '—';
  const staffName = (id: number) => {
    const member = staff.find((s) => s.id === id);
    return member ? `${member.name} ${member.surname || ''}`.trim() : String(id);
  };

  const columns: DataTableColumn<Homework>[] = [
    {
      id: 'class_section',
      header: 'Class (Section)',
      cellClassName: 'font-medium',
      cell: (r) => `${className(r.class_id)} (${sectionName(r.section_id)})`,
    },
    {
      id: 'subject',
      header: 'Subject',
      cell: (r) => subjectName(r.subject_id),
    },
    {
      id: 'teacher',
      header: 'Teacher',
      cell: (r) => staffName(r.staff_id),
    },
    {
      id: 'homework_date',
      header: 'Homework Date',
      cell: (r) => r.homework_date,
    },
    {
      id: 'submit_date',
      header: 'Submit Date',
      cell: (r) => r.submit_date,
    },
    {
      id: 'marks',
      header: 'Marks',
      cell: (r) => r.marks ?? '—',
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
      class_id: '',
      section_id: '',
      subject_id: '',
      staff_id: '',
      homework_date: '',
      submit_date: '',
      marks: null,
      description: '',
    },
  });

  const openCreate = () => {
    setSelected(null);
    reset({
      class_id: '',
      section_id: '',
      subject_id: '',
      staff_id: '',
      homework_date: new Date().toISOString().split('T')[0],
      submit_date: new Date().toISOString().split('T')[0],
      marks: null,
      description: '',
    });
    setDialogOpen(true);
  };

  const openEdit = (hw: Homework) => {
    setSelected(hw);
    reset({
      class_id: String(hw.class_id),
      section_id: String(hw.section_id),
      subject_id: String(hw.subject_id ?? ''),
      staff_id: String(hw.staff_id),
      homework_date: hw.homework_date,
      submit_date: hw.submit_date,
      marks: hw.marks,
      description: hw.description ?? '',
    });
    setDialogOpen(true);
  };

  const onSubmit = (values: FormValues) => {
    const payload = {
      class_id: Number(values.class_id),
      section_id: Number(values.section_id),
      subject_id: Number(values.subject_id),
      staff_id: Number(values.staff_id),
      homework_date: values.homework_date,
      submit_date: values.submit_date,
      marks: values.marks ?? null,
      description: values.description || null,
      session_id: activeSession?.id ?? 1,
      created_by: hwCreatedBy(),
      create_date: selected?.create_date || new Date().toISOString().split('T')[0],
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

  const hwCreatedBy = () => {
    return user?.user_id ?? 291;
  };

  const addAction = (
    <Button onClick={openCreate} className="gap-1">
      <Plus className="h-4 w-4" aria-hidden="true" />
      Add Homework
    </Button>
  );

  const classOptions = classes.map((c) => ({ value: String(c.id), label: c.class_name }));
  const sectionOptions = sections.map((s) => ({ value: String(s.id), label: s.section_name }));
  const subjectOptions = subjects.map((sub) => ({ value: String(sub.id), label: sub.name }));
  const staffOptions = staff.map((st) => ({
    value: String(st.id),
    label: `${st.name} ${st.surname || ''}`.trim(),
  }));

  return (
    <ModuleListPack
      title="Homework"
      description="Manage homework assignments, submit dates, and marks."
      actions={addAction}
      isLoading={isLoading}
      loadingMessage="Loading homework..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && (data?.length ?? 0) === 0}
      emptyTitle="No homework"
      emptyDescription="Add homework assignments for your classes."
      emptyAction={addAction}
      footer={
        <>
          <EntityFormDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            title={selected ? 'Edit homework' : 'Add homework'}
            onSubmit={handleSubmit(onSubmit)}
            isLoading={createMutation.isPending || updateMutation.isPending}
            submitLabel={selected ? 'Save' : 'Create'}
          >
            <FormErrorSummary errors={errors} />
            <div className="grid grid-cols-2 gap-4">
              <FormSelectField
                control={control}
                name="class_id"
                label="Class"
                options={classOptions}
                placeholder="Select Class"
                required
              />
              <FormSelectField
                control={control}
                name="section_id"
                label="Section"
                options={sectionOptions}
                placeholder="Select Section"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormSelectField
                control={control}
                name="subject_id"
                label="Subject"
                options={subjectOptions}
                placeholder="Select Subject"
                required
              />
              <FormSelectField
                control={control}
                name="staff_id"
                label="Teacher"
                options={staffOptions}
                placeholder="Select Teacher"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormDateField control={control} name="homework_date" label="Homework Date" required />
              <FormDateField control={control} name="submit_date" label="Submit Date" required />
            </div>
            <FormNumberField control={control} name="marks" label="Max Marks" optional />
            <FormTextareaField control={control} name="description" label="Description" optional />
          </EntityFormDialog>
          <ConfirmDialog
            open={deleteTarget !== null}
            onOpenChange={(open) => {
              if (!open) setDeleteTarget(null);
            }}
            title="Delete homework"
            description="Are you sure you want to delete this homework? This action cannot be undone."
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
        data={data ?? []}
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
