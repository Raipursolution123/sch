import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import {
  FormNumberField,
  FormSelectField,
  FormSwitchField,
  FormTextField,
  FormTextareaField,
} from '@components/forms/fields';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { StatusBadge } from '@components/feedback/StatusBadge';
import { Button, Input, Select } from '@components/ui';
import {
  useCreateCustomField,
  useCustomFields,
  useDeleteCustomField,
  useUpdateCustomField,
} from '@hooks/useAdvancedSettings';
import type { CustomField } from '@app-types/settings/advanced-settings';
import { formatDate } from '@utils/format';
import { ModuleListPack } from '@workflow-packs';

const BELONG_TO_OPTIONS = [
  { value: 'student', label: 'Student' },
  { value: 'staff', label: 'Staff' },
];

const FIELD_TYPE_OPTIONS = [
  { value: 'text', label: 'Text' },
  { value: 'textarea', label: 'Textarea' },
  { value: 'select', label: 'Select' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'radio', label: 'Radio' },
  { value: 'date', label: 'Date' },
  { value: 'file', label: 'File' },
];

const BELONG_TO_FILTER_OPTIONS = [{ value: '', label: 'All' }, ...BELONG_TO_OPTIONS];

const schema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  belong_to: z.string().trim().min(1, 'This is required'),
  type: z.string().trim().min(1, 'This is required'),
  field_values: z.string().trim(),
  show_table: z.string().trim(),
  weight: z.union([z.number(), z.literal('')]),
  bs_column: z.union([z.number(), z.literal('')]),
  validation: z.boolean(),
  visible_on_table: z.boolean(),
  is_active: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

const defaults: FormValues = {
  name: '',
  belong_to: 'student',
  type: 'text',
  field_values: '',
  show_table: '',
  weight: '',
  bs_column: '',
  validation: false,
  visible_on_table: false,
  is_active: true,
};

function toForm(row: CustomField): FormValues {
  return {
    name: row.name,
    belong_to: row.belong_to,
    type: row.type,
    field_values: row.field_values,
    show_table: row.show_table,
    weight: row.weight ?? '',
    bs_column: row.bs_column ?? '',
    validation: row.validation,
    visible_on_table: row.visible_on_table,
    is_active: row.is_active,
  };
}

function toPayload(values: FormValues) {
  return {
    name: values.name,
    belong_to: values.belong_to,
    type: values.type,
    field_values: values.field_values,
    show_table: values.show_table,
    weight: values.weight === '' ? null : values.weight,
    bs_column: values.bs_column === '' ? null : values.bs_column,
    validation: values.validation,
    visible_on_table: values.visible_on_table,
    is_active: values.is_active,
  };
}

export function CustomFieldsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [belongTo, setBelongTo] = useState('');
  const { data, isLoading, isError, error, refetch } = useCustomFields(page, query, belongTo);
  const rows = data?.results ?? [];
  const totalCount = data?.count ?? 0;
  const createMutation = useCreateCustomField();
  const updateMutation = useUpdateCustomField();
  const deleteMutation = useDeleteCustomField();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<CustomField | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CustomField | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: defaults });

  useEffect(() => {
    if (dialogOpen) reset(selected ? toForm(selected) : defaults);
  }, [dialogOpen, selected, reset]);

  const closeDialog = () => {
    setDialogOpen(false);
    setSelected(null);
  };

  const onSubmit = (values: FormValues) => {
    const payload = toPayload(values);
    if (selected) {
      updateMutation.mutate({ id: selected.id, payload }, { onSuccess: closeDialog });
      return;
    }
    createMutation.mutate(payload, { onSuccess: closeDialog });
  };

  const columns: DataTableColumn<CustomField>[] = [
    { id: 'name', header: 'Name', cellClassName: 'font-medium', cell: (r) => r.name },
    {
      id: 'belong_to',
      header: 'Belongs To',
      cell: (r) => <span className="capitalize">{r.belong_to}</span>,
    },
    { id: 'type', header: 'Type', cell: (r) => <span className="capitalize">{r.type}</span> },
    {
      id: 'visible',
      header: 'Visible on Table',
      cell: (r) => <StatusBadge isActive={r.visible_on_table ? 'yes' : 'no'} />,
    },
    {
      id: 'status',
      header: 'Status',
      cell: (r) => <StatusBadge isActive={r.is_active ? 'yes' : 'no'} />,
    },
    {
      id: 'created',
      header: 'Created',
      cellClassName: 'text-muted-foreground',
      cell: (r) => formatDate(r.created_at),
    },
  ];

  const addAction = (
    <PermissionButton
      permission="settings.manage"
      onClick={() => {
        setSelected(null);
        setDialogOpen(true);
      }}
      className="gap-1"
    >
      <Plus className="h-4 w-4" aria-hidden="true" />
      Add Field
    </PermissionButton>
  );

  return (
    <ModuleListPack
      title="Custom Fields"
      description="Add extra profile fields for students or staff that appear alongside system fields."
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={belongTo}
            onChange={(e) => {
              setPage(1);
              setBelongTo(e.target.value);
            }}
            options={BELONG_TO_FILTER_OPTIONS}
            className="w-36"
            aria-label="Filter by belongs to"
          />
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              setPage(1);
              setQuery(search);
            }}
          >
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search fields…"
              className="w-56"
            />
            <Button type="submit" variant="secondary">
              Search
            </Button>
          </form>
          {addAction}
        </div>
      }
      isLoading={isLoading}
      loadingMessage="Loading custom fields..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && rows.length === 0}
      emptyTitle="No custom fields configured"
      emptyDescription="Add custom fields to collect extra information on student or staff profiles."
      emptyAction={addAction}
      footer={
        <>
          <EntityFormDialog
            open={dialogOpen}
            onOpenChange={(open) => {
              if (!open) closeDialog();
              else setDialogOpen(true);
            }}
            isEdit={Boolean(selected)}
            isLoading={createMutation.isPending || updateMutation.isPending}
            title={selected ? 'Edit Custom Field' : 'Add Custom Field'}
            description="Configure the field label, ownership, and how it appears in forms and tables."
            submitLabel={selected ? 'Save changes' : 'Create field'}
            onSubmit={handleSubmit(onSubmit)}
            size="lg"
          >
            <FormErrorSummary errors={errors} />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormTextField control={control} name="name" label="Field name" required />
              <FormSelectField
                control={control}
                name="belong_to"
                label="Belongs to"
                options={BELONG_TO_OPTIONS}
                required
              />
              <FormSelectField
                control={control}
                name="type"
                label="Field type"
                options={FIELD_TYPE_OPTIONS}
                required
              />
              <FormTextField
                control={control}
                name="show_table"
                label="Table column key"
                hint="Internal column key used when showing this field in list tables."
                optional
              />
              <FormNumberField control={control} name="weight" label="Sort order" optional />
              <FormNumberField
                control={control}
                name="bs_column"
                label="Column width (1-12)"
                min={1}
                max={12}
                optional
              />
            </div>
            <FormTextareaField
              control={control}
              name="field_values"
              label="Field options"
              rows={3}
              hint="Comma-separated options, required for select/radio/checkbox field types."
            />
            <div className="grid gap-3 sm:grid-cols-3">
              <FormSwitchField control={control} name="validation" label="Required field" />
              <FormSwitchField control={control} name="visible_on_table" label="Visible on table" />
              <FormSwitchField control={control} name="is_active" label="Active" />
            </div>
          </EntityFormDialog>

          <ConfirmDialog
            open={Boolean(deleteTarget)}
            onOpenChange={(open) => {
              if (!open) setDeleteTarget(null);
            }}
            title="Delete custom field?"
            description={
              deleteTarget
                ? `Permanently delete "${deleteTarget.name}"? This cannot be undone.`
                : ''
            }
            confirmLabel="Delete"
            destructive
            onConfirm={() => {
              if (!deleteTarget) return;
              deleteMutation.mutate(deleteTarget.id, {
                onSuccess: () => setDeleteTarget(null),
              });
            }}
            isLoading={deleteMutation.isPending}
          />
        </>
      }
    >
      <DataTable
        data={rows}
        columns={columns}
        getRowKey={(row) => row.id}
        pagination={{ page, totalCount, pageSize: 20, onPageChange: setPage }}
        actions={(row) => (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelected(row);
                setDialogOpen(true);
              }}
              aria-label={`Edit ${row.name}`}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleteTarget(row)}
              aria-label={`Delete ${row.name}`}
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
