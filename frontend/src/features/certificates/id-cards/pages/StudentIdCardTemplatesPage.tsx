import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { z } from 'zod';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormCheckboxField, FormTextField } from '@components/forms/fields';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { PermissionButton } from '@components/rbac/PermissionButton';
import {
  useCreateStudentIdCard,
  useDeleteStudentIdCard,
  useStudentIdCardTemplates,
  useUpdateStudentIdCard,
} from '@hooks/useIdCards';
import { DEFAULT_ID_CARD_HEADER_COLOR } from '@constants/id-cards';
import type { StudentIdCardTemplate } from '@app-types/id-cards';
import { ModuleListPack } from '@workflow-packs';

const schema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  school_name: z.string().optional(),
  school_address: z.string().optional(),
  header_color: z.string().optional(),
  enable_vertical_card: z.boolean(),
  enable_admission_no: z.boolean(),
  enable_student_name: z.boolean(),
  enable_class: z.boolean(),
  enable_fathers_name: z.boolean(),
  enable_mothers_name: z.boolean(),
  enable_address: z.boolean(),
  enable_phone: z.boolean(),
  enable_dob: z.boolean(),
  enable_blood_group: z.boolean(),
  enable_student_barcode: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

const defaults: FormValues = {
  title: '',
  school_name: '',
  school_address: '',
  header_color: DEFAULT_ID_CARD_HEADER_COLOR,
  enable_vertical_card: false,
  enable_admission_no: true,
  enable_student_name: true,
  enable_class: true,
  enable_fathers_name: true,
  enable_mothers_name: false,
  enable_address: true,
  enable_phone: true,
  enable_dob: true,
  enable_blood_group: false,
  enable_student_barcode: true,
};

const columns: DataTableColumn<StudentIdCardTemplate>[] = [
  { id: 'title', header: 'Title', cellClassName: 'font-medium', cell: (r) => r.title },
  { id: 'school', header: 'School', cell: (r) => r.school_name || '—' },
  {
    id: 'status',
    header: 'Status',
    cell: (r) => (r.status === 1 ? 'Active' : 'Inactive'),
  },
];

function toPayload(values: FormValues) {
  return {
    title: values.title,
    school_name: values.school_name || '',
    school_address: values.school_address || '',
    background: '',
    logo: '',
    sign_image: '',
    header_color: values.header_color || DEFAULT_ID_CARD_HEADER_COLOR,
    enable_vertical_card: values.enable_vertical_card ? 1 : 0,
    enable_admission_no: values.enable_admission_no ? 1 : 0,
    enable_student_name: values.enable_student_name ? 1 : 0,
    enable_class: values.enable_class ? 1 : 0,
    enable_fathers_name: values.enable_fathers_name ? 1 : 0,
    enable_mothers_name: values.enable_mothers_name ? 1 : 0,
    enable_address: values.enable_address ? 1 : 0,
    enable_phone: values.enable_phone ? 1 : 0,
    enable_dob: values.enable_dob ? 1 : 0,
    enable_blood_group: values.enable_blood_group ? 1 : 0,
    enable_student_barcode: values.enable_student_barcode ? 1 : 0,
    status: 1,
  };
}

export function StudentIdCardTemplatesPage() {
  const { data = [], isLoading, isError, error, refetch } = useStudentIdCardTemplates();
  const createMutation = useCreateStudentIdCard();
  const updateMutation = useUpdateStudentIdCard();
  const deleteMutation = useDeleteStudentIdCard();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<StudentIdCardTemplate | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StudentIdCardTemplate | null>(null);
  const { control, handleSubmit, reset, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  });

  useEffect(() => {
    if (!open) return;
    reset(
      selected
        ? {
            title: selected.title,
            school_name: selected.school_name || '',
            school_address: selected.school_address || '',
            header_color: selected.header_color || DEFAULT_ID_CARD_HEADER_COLOR,
            enable_vertical_card: selected.enable_vertical_card === 1,
            enable_admission_no: selected.enable_admission_no === 1,
            enable_student_name: selected.enable_student_name === 1,
            enable_class: selected.enable_class === 1,
            enable_fathers_name: selected.enable_fathers_name === 1,
            enable_mothers_name: selected.enable_mothers_name === 1,
            enable_address: selected.enable_address === 1,
            enable_phone: selected.enable_phone === 1,
            enable_dob: selected.enable_dob === 1,
            enable_blood_group: selected.enable_blood_group === 1,
            enable_student_barcode: selected.enable_student_barcode === 1,
          }
        : defaults,
    );
  }, [open, selected, reset]);

  const addAction = (
    <PermissionButton
      permission="idcards.student.create"
      onClick={() => {
        setSelected(null);
        setOpen(true);
      }}
      className="gap-1"
    >
      <Plus className="h-4 w-4" />
      Add Template
    </PermissionButton>
  );

  return (
    <ModuleListPack
      title="Student ID Cards"
      description="Design templates for student identity cards."
      actions={addAction}
      isLoading={isLoading}
      loadingMessage="Loading templates..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && data.length === 0}
      emptyTitle="No student ID templates"
      emptyDescription="Create a template to start generating student ID cards."
      emptyAction={addAction}
    >
      <DataTable
        data={data}
        columns={columns}
        getRowKey={(r) => r.id}
        actions={(row) => (
          <>
            <PermissionButton
              permission="idcards.student.edit"
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
              permission="idcards.student.delete"
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
      <EntityFormDialog
        open={open}
        onOpenChange={setOpen}
        title={selected ? 'Edit Student ID Template' : 'Add Student ID Template'}
        size="lg"
        onSubmit={handleSubmit((values) => {
          const payload = toPayload(values);
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
        <FormTextField control={control} name="title" label="Title" required />
        <FormTextField control={control} name="school_name" label="School name" />
        <FormTextField control={control} name="school_address" label="School address" />
        <FormTextField control={control} name="header_color" label="Header color" />
        <div className="grid gap-2 sm:grid-cols-2">
          <FormCheckboxField control={control} name="enable_vertical_card" label="Vertical card" />
          <FormCheckboxField control={control} name="enable_admission_no" label="Admission no" />
          <FormCheckboxField control={control} name="enable_student_name" label="Student name" />
          <FormCheckboxField control={control} name="enable_class" label="Class" />
          <FormCheckboxField control={control} name="enable_fathers_name" label="Father name" />
          <FormCheckboxField control={control} name="enable_mothers_name" label="Mother name" />
          <FormCheckboxField control={control} name="enable_address" label="Address" />
          <FormCheckboxField control={control} name="enable_phone" label="Phone" />
          <FormCheckboxField control={control} name="enable_dob" label="Date of birth" />
          <FormCheckboxField control={control} name="enable_blood_group" label="Blood group" />
          <FormCheckboxField control={control} name="enable_student_barcode" label="Barcode" />
        </div>
      </EntityFormDialog>
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete template?"
        description={`Remove “${deleteTarget?.title ?? ''}”.`}
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteMutation.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
        }}
        isLoading={deleteMutation.isPending}
      />
    </ModuleListPack>
  );
}
