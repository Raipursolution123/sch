import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { z } from 'zod';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormNumberField, FormTextField, FormTextareaField } from '@components/forms/fields';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { PermissionButton } from '@components/rbac/PermissionButton';
import {
  useAlumniStudents,
  useCreateAlumniStudent,
  useDeleteAlumniStudent,
  useUpdateAlumniStudent,
} from '@hooks/useAlumni';
import type { AlumniStudent } from '@app-types/alumni';
import { ModuleListPack } from '@workflow-packs';

const schema = z.object({
  student_id: z.number().int().positive('Student ID is required'),
  current_email: z.string().optional(),
  current_phone: z.string().optional(),
  occupation: z.string().optional(),
  address: z.string().optional(),
  photo: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

const columns: DataTableColumn<AlumniStudent>[] = [
  {
    id: 'student_name',
    header: 'Student',
    cellClassName: 'font-medium',
    cell: (r) => r.student_name || `Student #${r.student_id}`,
  },
  { id: 'admission_no', header: 'Admission No', cell: (r) => r.admission_no || '—' },
  { id: 'current_email', header: 'Email', cell: (r) => r.current_email || '—' },
  { id: 'current_phone', header: 'Phone', cell: (r) => r.current_phone || '—' },
  { id: 'occupation', header: 'Occupation', cell: (r) => r.occupation || '—' },
];

export function AlumniListPage() {
  const { data = [], isLoading, isError, error, refetch } = useAlumniStudents();
  const createMutation = useCreateAlumniStudent();
  const updateMutation = useUpdateAlumniStudent();
  const deleteMutation = useDeleteAlumniStudent();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<AlumniStudent | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AlumniStudent | null>(null);
  const { control, handleSubmit, reset, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      student_id: 0,
      current_email: '',
      current_phone: '',
      occupation: '',
      address: '',
      photo: '',
    },
  });

  useEffect(() => {
    if (!open) return;
    reset(
      selected
        ? {
            student_id: selected.student_id,
            current_email: selected.current_email || '',
            current_phone: selected.current_phone || '',
            occupation: selected.occupation || '',
            address: selected.address || '',
            photo: selected.photo || '',
          }
        : {
            student_id: 0,
            current_email: '',
            current_phone: '',
            occupation: '',
            address: '',
            photo: '',
          },
    );
  }, [open, selected, reset]);

  const addAction = (
    <PermissionButton
      permission="alumni.manage.create"
      onClick={() => {
        setSelected(null);
        setOpen(true);
      }}
      className="gap-1"
    >
      <Plus className="h-4 w-4" />
      Add Alumni
    </PermissionButton>
  );

  return (
    <ModuleListPack
      title="Manage Alumni"
      description="Keep contact details for alumni students."
      actions={addAction}
      isLoading={isLoading}
      loadingMessage="Loading alumni..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && data.length === 0}
      emptyTitle="No alumni records"
      emptyDescription="Add an alumni record linked to a student ID."
      emptyAction={addAction}
    >
      <DataTable
        data={data}
        columns={columns}
        getRowKey={(r) => r.id}
        actions={(row) => (
          <>
            <PermissionButton
              permission="alumni.manage.edit"
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
              permission="alumni.manage.delete"
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
        title={selected ? 'Edit Alumni' : 'Add Alumni'}
        onSubmit={handleSubmit((values) => {
          const payload = {
            student_id: values.student_id,
            current_email: values.current_email?.trim() || '',
            current_phone: values.current_phone?.trim() || '',
            occupation: values.occupation?.trim() || '',
            address: values.address?.trim() || '',
            photo: values.photo?.trim() || null,
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
        <FormNumberField control={control} name="student_id" label="Student ID" required />
        <FormTextField control={control} name="current_email" label="Email" />
        <FormTextField control={control} name="current_phone" label="Phone" />
        <FormTextField control={control} name="occupation" label="Occupation" />
        <FormTextareaField control={control} name="address" label="Address" />
        <FormTextField control={control} name="photo" label="Photo URL" />
      </EntityFormDialog>
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete alumni record?"
        description={`Remove alumni for “${deleteTarget?.student_name ?? deleteTarget?.student_id ?? ''}”.`}
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
