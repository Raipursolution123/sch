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
  useCreateMarksheetTemplate,
  useDeleteMarksheetTemplate,
  useMarksheetTemplates,
  useUpdateMarksheetTemplate,
} from '@hooks/useExamTemplates';
import type { MarksheetTemplate } from '@app-types/examinations/exam-templates';
import { ModuleListPack } from '@workflow-packs';

const schema = z.object({
  heading: z.string().optional(),
  title: z.string().optional(),
  exam_name: z.string().optional(),
  school_name: z.string().optional(),
  exam_center: z.string().optional(),
  content: z.string().optional(),
  content_footer: z.string().optional(),
  is_name: z.boolean(),
  is_roll_no: z.boolean(),
  is_division: z.boolean(),
  is_rank: z.boolean(),
  is_class: z.boolean(),
  is_section: z.boolean(),
  is_teacher_remark: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

const columns: DataTableColumn<MarksheetTemplate>[] = [
  {
    id: 'heading',
    header: 'Heading',
    cellClassName: 'font-medium',
    cell: (r) => r.heading || r.title || '—',
  },
  { id: 'exam', header: 'Exam', cell: (r) => r.exam_name || '—' },
  { id: 'school', header: 'School', cell: (r) => r.school_name || '—' },
];

export function MarksheetTemplatesPage() {
  const { data = [], isLoading, isError, error, refetch } = useMarksheetTemplates();
  const createMutation = useCreateMarksheetTemplate();
  const updateMutation = useUpdateMarksheetTemplate();
  const deleteMutation = useDeleteMarksheetTemplate();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<MarksheetTemplate | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MarksheetTemplate | null>(null);
  const { control, handleSubmit, reset, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      heading: 'Marksheet',
      title: '',
      exam_name: '',
      school_name: '',
      exam_center: '',
      content: '',
      content_footer: '',
      is_name: true,
      is_roll_no: true,
      is_division: true,
      is_rank: false,
      is_class: true,
      is_section: true,
      is_teacher_remark: true,
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
            content: selected.content,
            content_footer: selected.content_footer,
            is_name: selected.is_name === 1,
            is_roll_no: selected.is_roll_no === 1,
            is_division: selected.is_division === 1,
            is_rank: selected.is_rank === 1,
            is_class: selected.is_class === 1,
            is_section: selected.is_section === 1,
            is_teacher_remark: selected.is_teacher_remark === 1,
          }
        : {
            heading: 'Marksheet',
            title: '',
            exam_name: '',
            school_name: '',
            exam_center: '',
            content: '',
            content_footer: '',
            is_name: true,
            is_roll_no: true,
            is_division: true,
            is_rank: false,
            is_class: true,
            is_section: true,
            is_teacher_remark: true,
          },
    );
  }, [open, selected, reset]);

  const addAction = (
    <PermissionButton
      permission="exams.marksheet.create"
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
        title="Marksheet"
        description="Configure marksheet layout templates for examination results."
        actions={addAction}
        isLoading={isLoading}
        loadingMessage="Loading marksheet templates..."
        isError={isError}
        error={error}
        onRetry={() => void refetch()}
        isEmpty={!isLoading && !isError && data.length === 0}
        emptyTitle="No marksheet templates"
        emptyDescription="Create a template to control which result fields appear on marksheets."
        emptyAction={addAction}
      >
        <DataTable
          data={data}
          columns={columns}
          getRowKey={(r) => r.id}
          actions={(row) => (
            <>
              <PermissionButton
                permission="exams.marksheet.edit"
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
                permission="exams.marksheet.delete"
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
        title={selected ? 'Edit marksheet template' : 'Add marksheet template'}
        onSubmit={handleSubmit((values) => {
          const payload = {
            template: 'default',
            heading: values.heading?.trim() || '',
            title: values.title?.trim() || '',
            exam_name: values.exam_name?.trim() || '',
            school_name: values.school_name?.trim() || '',
            exam_center: values.exam_center?.trim() || '',
            content: values.content?.trim() || '',
            content_footer: values.content_footer?.trim() || '',
            exam_session: 1,
            is_name: values.is_name ? 1 : 0,
            is_father_name: 1,
            is_mother_name: 1,
            is_dob: 1,
            is_admission_no: 1,
            is_roll_no: values.is_roll_no ? 1 : 0,
            is_photo: 1,
            is_division: values.is_division ? 1 : 0,
            is_rank: values.is_rank ? 1 : 0,
            is_customfield: 0,
            is_class: values.is_class ? 1 : 0,
            is_teacher_remark: values.is_teacher_remark ? 1 : 0,
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
        <FormTextareaField control={control} name="content" label="Body content" />
        <FormTextareaField control={control} name="content_footer" label="Footer" />
        <FormSwitchField control={control} name="is_name" label="Show student name" />
        <FormSwitchField control={control} name="is_roll_no" label="Show roll no" />
        <FormSwitchField control={control} name="is_division" label="Show division" />
        <FormSwitchField control={control} name="is_rank" label="Show rank" />
        <FormSwitchField control={control} name="is_class" label="Show class" />
        <FormSwitchField control={control} name="is_section" label="Show section" />
        <FormSwitchField control={control} name="is_teacher_remark" label="Show teacher remark" />
      </EntityFormDialog>
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete marksheet template?"
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
