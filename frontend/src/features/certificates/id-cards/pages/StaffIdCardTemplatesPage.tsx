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
  useCreateStaffIdCard,
  useDeleteStaffIdCard,
  useStaffIdCardTemplates,
  useUpdateStaffIdCard,
} from '@hooks/useIdCards';
import type { StaffIdCardTemplate } from '@app-types/id-cards';
import { ModuleListPack } from '@workflow-packs';

const schema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  school_name: z.string().optional(),
  school_address: z.string().optional(),
  header_color: z.string().optional(),
  enable_vertical_card: z.boolean(),
  enable_staff_role: z.boolean(),
  enable_staff_id: z.boolean(),
  enable_staff_department: z.boolean(),
  enable_designation: z.boolean(),
  enable_name: z.boolean(),
  enable_fathers_name: z.boolean(),
  enable_mothers_name: z.boolean(),
  enable_date_of_joining: z.boolean(),
  enable_permanent_address: z.boolean(),
  enable_staff_dob: z.boolean(),
  enable_staff_phone: z.boolean(),
  enable_staff_barcode: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

const defaults: FormValues = {
  title: '',
  school_name: '',
  school_address: '',
  header_color: '#0d6efd',
  enable_vertical_card: false,
  enable_staff_role: true,
  enable_staff_id: true,
  enable_staff_department: true,
  enable_designation: true,
  enable_name: true,
  enable_fathers_name: false,
  enable_mothers_name: false,
  enable_date_of_joining: true,
  enable_permanent_address: true,
  enable_staff_dob: true,
  enable_staff_phone: true,
  enable_staff_barcode: true,
};

const columns: DataTableColumn<StaffIdCardTemplate>[] = [
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
    header_color: values.header_color || '#0d6efd',
    enable_vertical_card: values.enable_vertical_card ? 1 : 0,
    enable_staff_role: values.enable_staff_role ? 1 : 0,
    enable_staff_id: values.enable_staff_id ? 1 : 0,
    enable_staff_department: values.enable_staff_department ? 1 : 0,
    enable_designation: values.enable_designation ? 1 : 0,
    enable_name: values.enable_name ? 1 : 0,
    enable_fathers_name: values.enable_fathers_name ? 1 : 0,
    enable_mothers_name: values.enable_mothers_name ? 1 : 0,
    enable_date_of_joining: values.enable_date_of_joining ? 1 : 0,
    enable_permanent_address: values.enable_permanent_address ? 1 : 0,
    enable_staff_dob: values.enable_staff_dob ? 1 : 0,
    enable_staff_phone: values.enable_staff_phone ? 1 : 0,
    enable_staff_barcode: values.enable_staff_barcode ? 1 : 0,
    status: 1,
  };
}

export function StaffIdCardTemplatesPage() {
  const { data = [], isLoading, isError, error, refetch } = useStaffIdCardTemplates();
  const createMutation = useCreateStaffIdCard();
  const updateMutation = useUpdateStaffIdCard();
  const deleteMutation = useDeleteStaffIdCard();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<StaffIdCardTemplate | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StaffIdCardTemplate | null>(null);
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
            header_color: selected.header_color || '#0d6efd',
            enable_vertical_card: selected.enable_vertical_card === 1,
            enable_staff_role: selected.enable_staff_role === 1,
            enable_staff_id: selected.enable_staff_id === 1,
            enable_staff_department: selected.enable_staff_department === 1,
            enable_designation: selected.enable_designation === 1,
            enable_name: selected.enable_name === 1,
            enable_fathers_name: selected.enable_fathers_name === 1,
            enable_mothers_name: selected.enable_mothers_name === 1,
            enable_date_of_joining: selected.enable_date_of_joining === 1,
            enable_permanent_address: selected.enable_permanent_address === 1,
            enable_staff_dob: selected.enable_staff_dob === 1,
            enable_staff_phone: selected.enable_staff_phone === 1,
            enable_staff_barcode: selected.enable_staff_barcode === 1,
          }
        : defaults,
    );
  }, [open, selected, reset]);

  const addAction = (
    <PermissionButton
      permission="idcards.staff.create"
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
      title="Staff ID Cards"
      description="Design templates for staff identity cards."
      actions={addAction}
      isLoading={isLoading}
      loadingMessage="Loading templates..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && data.length === 0}
      emptyTitle="No staff ID templates"
      emptyDescription="Create a template to start generating staff ID cards."
      emptyAction={addAction}
    >
      <DataTable
        data={data}
        columns={columns}
        getRowKey={(r) => r.id}
        actions={(row) => (
          <>
            <PermissionButton
              permission="idcards.staff.edit"
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
              permission="idcards.staff.delete"
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
        title={selected ? 'Edit Staff ID Template' : 'Add Staff ID Template'}
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
          <FormCheckboxField control={control} name="enable_staff_id" label="Employee ID" />
          <FormCheckboxField control={control} name="enable_name" label="Name" />
          <FormCheckboxField control={control} name="enable_staff_role" label="Role" />
          <FormCheckboxField control={control} name="enable_staff_department" label="Department" />
          <FormCheckboxField control={control} name="enable_designation" label="Designation" />
          <FormCheckboxField control={control} name="enable_fathers_name" label="Father name" />
          <FormCheckboxField control={control} name="enable_mothers_name" label="Mother name" />
          <FormCheckboxField
            control={control}
            name="enable_date_of_joining"
            label="Date of joining"
          />
          <FormCheckboxField
            control={control}
            name="enable_permanent_address"
            label="Permanent address"
          />
          <FormCheckboxField control={control} name="enable_staff_dob" label="Date of birth" />
          <FormCheckboxField control={control} name="enable_staff_phone" label="Phone" />
          <FormCheckboxField control={control} name="enable_staff_barcode" label="Barcode" />
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
