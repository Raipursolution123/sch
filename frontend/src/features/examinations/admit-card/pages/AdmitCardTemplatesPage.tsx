import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { z } from 'zod';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormSwitchField, FormTextField, FormTextareaField } from '@components/forms/fields';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { PermissionButton } from '@components/rbac/PermissionButton';
import {
  useAdmitCardTemplates,
  useCreateAdmitCardTemplate,
  useDeleteAdmitCardTemplate,
  useUpdateAdmitCardTemplate,
} from '@hooks/useExamTemplates';
import type { AdmitCardTemplate } from '@app-types/examinations/exam-templates';
import { ModuleListPack } from '@workflow-packs';

const schema = z.object({
  heading: z.string().optional(),
  title: z.string().optional(),
  exam_name: z.string().optional(),
  school_name: z.string().optional(),
  exam_center: z.string().optional(),
  content_footer: z.string().optional(),
  is_name: z.boolean(),
  is_father_name: z.boolean(),
  is_admission_no: z.boolean(),
  is_roll_no: z.boolean(),
  is_photo: z.boolean(),
  is_class: z.boolean(),
  is_section: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

const columns: DataTableColumn<AdmitCardTemplate>[] = [
  {
    id: 'heading',
    header: 'Heading',
    cellClassName: 'font-medium',
    cell: (r) => r.heading || r.title || '—',
  },
  { id: 'exam', header: 'Exam', cell: (r) => r.exam_name || '—' },
  { id: 'school', header: 'School', cell: (r) => r.school_name || '—' },
];

export function AdmitCardTemplatesPage() {
  const { data = [], isLoading, isError, error, refetch } = useAdmitCardTemplates();
  const createMutation = useCreateAdmitCardTemplate();
  const updateMutation = useUpdateAdmitCardTemplate();
  const deleteMutation = useDeleteAdmitCardTemplate();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<AdmitCardTemplate | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdmitCardTemplate | null>(null);
  const { control, handleSubmit, reset, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      heading: 'Admit Card',
      title: '',
      exam_name: '',
      school_name: '',
      exam_center: '',
      content_footer: '',
      is_name: true,
      is_father_name: true,
      is_admission_no: true,
      is_roll_no: true,
      is_photo: true,
      is_class: true,
      is_section: true,
    },
  });

  useEffect(() => {
    if (!open) return;
    reset(
      selected
        ? {
            heading: selected.heading,
            title: selected.title,
            exam_name: selected.exam_name,
            school_name: selected.school_name,
            exam_center: selected.exam_center,
            content_footer: selected.content_footer,
            is_name: selected.is_name === 1,
            is_father_name: selected.is_father_name === 1,
            is_admission_no: selected.is_admission_no === 1,
            is_roll_no: selected.is_roll_no === 1,
            is_photo: selected.is_photo === 1,
            is_class: selected.is_class === 1,
            is_section: selected.is_section === 1,
          }
        : {
            heading: 'Admit Card',
            title: '',
            exam_name: '',
            school_name: '',
            exam_center: '',
            content_footer: '',
            is_name: true,
            is_father_name: true,
            is_admission_no: true,
            is_roll_no: true,
            is_photo: true,
            is_class: true,
            is_section: true,
          },
    );
  }, [open, selected, reset]);

  const addAction = (
    <PermissionButton
      permission="exams.admit_card.create"
      onClick={() => {
        setSelected(null);
        setOpen(true);
      }}
      className="gap-1"
    >
      <Plus className="h-4 w-4" />
      Add template
    </PermissionButton>
  );

  return (
    <>
      <ModuleListPack
        title="Admit Card"
        description="Configure admit card layout templates for examinations."
        actions={addAction}
        isLoading={isLoading}
        loadingMessage="Loading admit card templates..."
        isError={isError}
        error={error}
        onRetry={() => void refetch()}
        isEmpty={!isLoading && !isError && data.length === 0}
        emptyTitle="No admit card templates"
        emptyDescription="Create a template to control which student fields appear on admit cards."
        emptyAction={addAction}
      >
        <DataTable
          data={data}
          columns={columns}
          getRowKey={(r) => r.id}
          actions={(row) => (
            <>
              <PermissionButton
                permission="exams.admit_card.edit"
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
                permission="exams.admit_card.delete"
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
        title={selected ? 'Edit admit card template' : 'Add admit card template'}
        onSubmit={handleSubmit((values) => {
          const payload = {
            template: 'default',
            heading: values.heading?.trim() || '',
            title: values.title?.trim() || '',
            exam_name: values.exam_name?.trim() || '',
            school_name: values.school_name?.trim() || '',
            exam_center: values.exam_center?.trim() || '',
            content_footer: values.content_footer?.trim() || '',
            is_letter_head: 0,
            is_name: values.is_name ? 1 : 0,
            is_father_name: values.is_father_name ? 1 : 0,
            is_mother_name: 1,
            is_dob: 1,
            is_admission_no: values.is_admission_no ? 1 : 0,
            is_roll_no: values.is_roll_no ? 1 : 0,
            is_address: 1,
            is_gender: 1,
            is_photo: values.is_photo ? 1 : 0,
            is_class: values.is_class ? 1 : 0,
            is_section: values.is_section ? 1 : 0,
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
        <FormTextField control={control} name="heading" label="Heading" />
        <FormTextField control={control} name="title" label="Title" />
        <FormTextField control={control} name="exam_name" label="Exam name" />
        <FormTextField control={control} name="school_name" label="School name" />
        <FormTextField control={control} name="exam_center" label="Exam center" />
        <FormTextareaField control={control} name="content_footer" label="Footer" />
        <FormSwitchField control={control} name="is_name" label="Show student name" />
        <FormSwitchField control={control} name="is_father_name" label="Show father name" />
        <FormSwitchField control={control} name="is_admission_no" label="Show admission no" />
        <FormSwitchField control={control} name="is_roll_no" label="Show roll no" />
        <FormSwitchField control={control} name="is_photo" label="Show photo" />
        <FormSwitchField control={control} name="is_class" label="Show class" />
        <FormSwitchField control={control} name="is_section" label="Show section" />
      </EntityFormDialog>
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete admit card template?"
        description={`Remove “${deleteTarget?.heading || deleteTarget?.title || ''}”.`}
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
