import { useEffect, useMemo, useState } from 'react';
import { Plus, Settings2, Trash2 } from 'lucide-react';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormTextField } from '@components/forms/fields';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { FormField } from '@components/forms/FormField';
import { Input } from '@components/ui/input';
import { Select } from '@components/ui/select';
import { ModuleListPack } from '@workflow-packs';
import {
  useCreateFeeScheme,
  useDeleteFeeScheme,
  useFeeSchemes,
  useSaveSchemeConfig,
  useSchemeConfig,
} from '@hooks/useSchemeScholarship';
import { useFeeTypes } from '@hooks/useFeeTypes';
import { useClasses } from '@hooks/useClasses';
import type { FeeScheme, SchemeValue } from '@services/api/scheme-scholarship.service';
import { useForm } from 'react-hook-form';

const emptyValue = (): SchemeValue => ({
  fee_concession_type: 'percentage',
  fee_concession: 0,
  applicable_class: null,
  is_active: true,
});

export function SchemeScholarshipPage() {
  const { data: schemes = [], isLoading, isError, error, refetch } = useFeeSchemes();
  const { data: feeTypes = [] } = useFeeTypes();
  const { data: classesData } = useClasses();
  const classes = classesData?.results || [];
  const createMutation = useCreateFeeScheme();
  const deleteMutation = useDeleteFeeScheme();
  const saveConfigMutation = useSaveSchemeConfig();

  const [open, setOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FeeScheme | null>(null);
  const [configTarget, setConfigTarget] = useState<FeeScheme | null>(null);
  const [values, setValues] = useState<SchemeValue[]>([]);
  const [feetypeIds, setFeetypeIds] = useState<number[]>([]);

  const { control, handleSubmit, reset } = useForm({ defaultValues: { ss_name: '' } });
  const { data: config, isLoading: configLoading } = useSchemeConfig(configTarget?.id ?? null);

  useEffect(() => {
    if (!config) return;
    setValues(config.values.length > 0 ? config.values : [emptyValue()]);
    setFeetypeIds(config.feetype_ids);
  }, [config]);

  const columns: DataTableColumn<FeeScheme>[] = [
    { id: 'name', header: 'Scheme Name', cellClassName: 'font-medium', cell: (r) => r.ss_name },
    { id: 'type', header: 'Type', cell: (r) => r.ss_type },
    { id: 'applicable', header: 'Applicable On', cell: (r) => r.ss_applicable_on },
    { id: 'values', header: 'Values', cell: (r) => r.value_count },
    {
      id: 'status',
      header: 'Status',
      cell: (r) => (r.is_active ? 'Active' : 'Inactive'),
    },
  ];

  const classOptions = useMemo(
    () => [
      { value: '', label: 'All classes' },
      ...classes.map((c) => ({ value: String(c.id), label: c.class_name })),
    ],
    [classes],
  );

  const toggleFeetype = (id: number) => {
    setFeetypeIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  return (
    <>
      <ModuleListPack
        title="Scheme & Scholarship Setup"
        description="Configure fee concession schemes, mapped fee types, and concession values."
        actions={
          <button
            onClick={() => {
              reset({ ss_name: '' });
              setOpen(true);
            }}
            className="inline-flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground"
          >
            <Plus className="h-4 w-4" />
            Add Scheme
          </button>
        }
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={() => void refetch()}
        isEmpty={!isLoading && schemes.length === 0}
        emptyTitle="No schemes"
        emptyDescription="Create a scheme to start applying scholarships."
      >
        <DataTable
          data={schemes}
          columns={columns}
          getRowKey={(r) => r.id}
          actions={(row) => (
            <div className="flex items-center gap-2">
              <button
                title="Configure"
                onClick={() => {
                  setConfigTarget(row);
                  setValues([emptyValue()]);
                  setFeetypeIds([]);
                }}
                className="text-primary hover:text-primary/80"
              >
                <Settings2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setDeleteTarget(row)}
                className="text-destructive hover:text-destructive/80"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        />
      </ModuleListPack>

      <EntityFormDialog
        open={open}
        onOpenChange={setOpen}
        title="Add Scheme"
        onSubmit={handleSubmit((formValues) => {
          createMutation.mutate(
            { ss_name: formValues.ss_name, ss_type: 'scholarship', ss_applicable_on: 'fee' },
            { onSuccess: () => setOpen(false) },
          );
        })}
        isLoading={createMutation.isPending}
      >
        <FormTextField control={control} name="ss_name" label="Scheme Name" required />
      </EntityFormDialog>

      <EntityFormDialog
        open={configTarget !== null}
        onOpenChange={(v) => {
          if (!v) setConfigTarget(null);
        }}
        title={configTarget ? `Configure ${configTarget.ss_name}` : 'Configure Scheme'}
        onSubmit={() => {
          if (!configTarget) return;
          saveConfigMutation.mutate(
            {
              id: configTarget.id,
              payload: {
                values: values.filter((v) => v.fee_concession_type && v.fee_concession > 0),
                feetype_ids: feetypeIds,
              },
            },
            { onSuccess: () => setConfigTarget(null) },
          );
        }}
        isLoading={saveConfigMutation.isPending || configLoading}
        submitLabel="Save Configuration"
      >
        <div className="space-y-6">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-sm font-semibold">Concession Values</h4>
              <button
                type="button"
                onClick={() => setValues((prev) => [...prev, emptyValue()])}
                className="text-xs text-primary"
              >
                + Add value
              </button>
            </div>
            <div className="space-y-3">
              {values.map((value, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 gap-2 rounded border p-3 md:grid-cols-4"
                >
                  <FormField label="Type">
                    <Select
                      value={value.fee_concession_type}
                      onChange={(e) =>
                        setValues((prev) =>
                          prev.map((row, i) =>
                            i === index ? { ...row, fee_concession_type: e.target.value } : row,
                          ),
                        )
                      }
                      options={[
                        { value: 'percentage', label: 'Percentage' },
                        { value: 'fix_amount', label: 'Fixed Amount' },
                      ]}
                    />
                  </FormField>
                  <FormField label="Concession">
                    <Input
                      type="number"
                      value={value.fee_concession || ''}
                      onChange={(e) =>
                        setValues((prev) =>
                          prev.map((row, i) =>
                            i === index ? { ...row, fee_concession: Number(e.target.value) } : row,
                          ),
                        )
                      }
                    />
                  </FormField>
                  <FormField label="Applicable Class">
                    <Select
                      value={value.applicable_class ? String(value.applicable_class) : ''}
                      onChange={(e) =>
                        setValues((prev) =>
                          prev.map((row, i) =>
                            i === index
                              ? {
                                  ...row,
                                  applicable_class: e.target.value ? Number(e.target.value) : null,
                                }
                              : row,
                          ),
                        )
                      }
                      options={classOptions}
                    />
                  </FormField>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => setValues((prev) => prev.filter((_, i) => i !== index))}
                      className="text-xs text-destructive"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-2 text-sm font-semibold">Applicable Fee Types</h4>
            <div className="grid max-h-48 grid-cols-1 gap-2 overflow-y-auto rounded border p-3 md:grid-cols-2">
              {feeTypes.map((ft) => (
                <label key={ft.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={feetypeIds.includes(ft.id)}
                    onChange={() => toggleFeetype(ft.id)}
                  />
                  {ft.name}
                </label>
              ))}
            </div>
          </div>
        </div>
      </EntityFormDialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(v) => {
          if (!v) setDeleteTarget(null);
        }}
        title="Delete scheme"
        description={deleteTarget ? `Delete "${deleteTarget.ss_name}"?` : ''}
        confirmLabel="Delete"
        destructive
        isLoading={deleteMutation.isPending}
        onConfirm={() => {
          if (deleteTarget) {
            deleteMutation.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
          }
        }}
      />
    </>
  );
}
