import { useEffect, useMemo } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2 } from 'lucide-react';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormField } from '@components/forms/FormField';
import { FormSection } from '@components/forms/FormSection';
import { FormDateField, FormNumberField, FormSwitchField } from '@components/forms/fields';
import { Button } from '@components/ui/button';
import { Select } from '@components/ui/select';
import type { SchoolClass } from '@app-types/academics/class';
import type { FeeAssignment } from '@app-types/fees/fee-assignment';
import type { FeeGroup } from '@app-types/fees/fee-group';
import type { FeeType } from '@app-types/fees/fee-type';
import type { AcademicSession } from '@app-types/settings/session';
import {
  feeAssignmentFormSchema,
  type FeeAssignmentFormValues,
} from '@features/fees/assign/schemas/fee-assignment.schema';
import { formatAmount } from '@utils/format';

interface FeeAssignmentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classes: SchoolClass[];
  feeGroups: FeeGroup[];
  feeTypes: FeeType[];
  sessions: AcademicSession[];
  assignment?: FeeAssignment | null;
  onSubmit: (values: FeeAssignmentFormValues) => void;
  isLoading?: boolean;
}

const defaultLine = { feetype_id: 0, amount: 0, due_date: '' };

function toFormValues(assignment: FeeAssignment): FeeAssignmentFormValues {
  return {
    class_id: assignment.class_id,
    fee_group_id: assignment.fee_group_id,
    session_id: assignment.session_id,
    lines: assignment.lines.map((line) => ({
      feetype_id: line.feetype_id,
      amount: line.amount,
      due_date: line.due_date ?? '',
    })),
    is_active: assignment.is_active === 'yes',
  };
}

export function FeeAssignmentFormDialog({
  open,
  onOpenChange,
  classes,
  feeGroups,
  feeTypes,
  sessions,
  assignment,
  onSubmit,
  isLoading,
}: FeeAssignmentFormDialogProps) {
  const isEdit = Boolean(assignment);

  const activeClasses = useMemo(
    () => classes.filter((c) => c.is_active === 'yes').sort((a, b) => a.sort_order - b.sort_order),
    [classes],
  );
  const activeGroups = useMemo(
    () =>
      feeGroups.filter((g) => g.is_active === 'yes').sort((a, b) => a.name.localeCompare(b.name)),
    [feeGroups],
  );
  const activeFeeTypes = useMemo(
    () =>
      feeTypes.filter((f) => f.is_active === 'yes').sort((a, b) => a.name.localeCompare(b.name)),
    [feeTypes],
  );
  const sessionOptions = useMemo(
    () => sessions.map((s) => ({ value: String(s.id), label: s.session })),
    [sessions],
  );

  const classOptions = activeClasses.map((c) => ({ value: String(c.id), label: c.class_name }));
  const groupOptions = activeGroups.map((g) => ({ value: String(g.id), label: g.name }));
  const feeTypeOptions = activeFeeTypes.map((f) => ({
    value: String(f.id),
    label: `${f.code} — ${f.name}`,
  }));

  const hasOptions =
    classOptions.length > 0 &&
    groupOptions.length > 0 &&
    feeTypeOptions.length > 0 &&
    sessionOptions.length > 0;

  const defaultSessionId = sessions.find((s) => s.is_active === 'yes')?.id ?? sessions[0]?.id ?? 0;

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FeeAssignmentFormValues>({
    resolver: zodResolver(feeAssignmentFormSchema),
    defaultValues: {
      class_id: 0,
      fee_group_id: 0,
      session_id: defaultSessionId,
      lines: [{ ...defaultLine, feetype_id: activeFeeTypes[0]?.id ?? 0 }],
      is_active: true,
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'lines' });
  const watchedLines = watch('lines');

  const lineTotal = useMemo(
    () => watchedLines.reduce((sum, line) => sum + (Number(line.amount) || 0), 0),
    [watchedLines],
  );

  useEffect(() => {
    if (!open) return;
    if (isEdit && assignment) {
      reset(toFormValues(assignment));
      return;
    }
    reset({
      class_id: activeClasses[0]?.id ?? 0,
      fee_group_id: activeGroups[0]?.id ?? 0,
      session_id: defaultSessionId,
      lines: [{ feetype_id: activeFeeTypes[0]?.id ?? 0, amount: 0, due_date: '' }],
      is_active: true,
    });
  }, [
    open,
    isEdit,
    assignment,
    activeClasses,
    activeGroups,
    activeFeeTypes,
    defaultSessionId,
    reset,
  ]);

  return (
    <EntityFormDialog
      open={open}
      onOpenChange={onOpenChange}
      isEdit={isEdit}
      isLoading={isLoading}
      size="lg"
      scrollable
      title={isEdit ? 'Edit fee assignment' : 'Assign fees'}
      description="Link a fee group to a class for a session with line-item amounts."
      submitLabel={isEdit ? 'Save changes' : 'Assign fees'}
      submitDisabled={!hasOptions}
      onSubmit={handleSubmit(onSubmit)}
    >
      <FormErrorSummary errors={errors} />

      {!hasOptions && (
        <p className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
          Add active classes, fee groups, fee types, and sessions before assigning fees.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <FormField label="Class" htmlFor="class_id" error={errors.class_id?.message} required>
          <Controller
            name="class_id"
            control={control}
            render={({ field }) => (
              <Select
                id="class_id"
                placeholder="Select class"
                options={classOptions}
                value={field.value ? String(field.value) : ''}
                onChange={(e) => field.onChange(Number(e.target.value))}
                disabled={!hasOptions}
              />
            )}
          />
        </FormField>
        <FormField
          label="Fee group"
          htmlFor="fee_group_id"
          error={errors.fee_group_id?.message}
          required
        >
          <Controller
            name="fee_group_id"
            control={control}
            render={({ field }) => (
              <Select
                id="fee_group_id"
                placeholder="Select group"
                options={groupOptions}
                value={field.value ? String(field.value) : ''}
                onChange={(e) => field.onChange(Number(e.target.value))}
                disabled={!hasOptions}
              />
            )}
          />
        </FormField>
        <FormField label="Session" htmlFor="session_id" error={errors.session_id?.message} required>
          <Controller
            name="session_id"
            control={control}
            render={({ field }) => (
              <Select
                id="session_id"
                placeholder="Select session"
                options={sessionOptions}
                value={field.value ? String(field.value) : ''}
                onChange={(e) => field.onChange(Number(e.target.value))}
                disabled={!hasOptions}
              />
            )}
          />
        </FormField>
      </div>

      <FormSection
        title="Fee lines"
        description="Add one row per fee type with amount and optional due date."
      >
        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1"
            disabled={!hasOptions}
            onClick={() =>
              append({
                feetype_id: activeFeeTypes[0]?.id ?? 0,
                amount: 0,
                due_date: '',
              })
            }
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            Add line
          </Button>
        </div>

        {errors.lines?.message && (
          <p className="text-sm text-destructive" role="alert">
            {errors.lines.message}
          </p>
        )}

        <div className="space-y-3">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="grid gap-3 rounded-md border p-3 sm:grid-cols-[1fr_120px_140px_auto]"
            >
              <FormField
                label={index === 0 ? 'Fee type' : ''}
                htmlFor={`lines.${index}.feetype_id`}
                error={errors.lines?.[index]?.feetype_id?.message}
                required
              >
                <Controller
                  name={`lines.${index}.feetype_id`}
                  control={control}
                  render={({ field: lineField }) => (
                    <Select
                      id={`lines.${index}.feetype_id`}
                      placeholder="Select fee type"
                      options={feeTypeOptions}
                      value={lineField.value ? String(lineField.value) : ''}
                      onChange={(e) => lineField.onChange(Number(e.target.value))}
                      disabled={!hasOptions}
                    />
                  )}
                />
              </FormField>
              <FormNumberField
                control={control}
                name={`lines.${index}.amount`}
                label={index === 0 ? 'Amount' : ''}
                required
                min={0}
                step={0.01}
              />
              <FormDateField
                control={control}
                name={`lines.${index}.due_date`}
                label={index === 0 ? 'Due date' : ''}
                optional
              />
              <div className={index === 0 ? 'flex items-end pb-0.5' : 'flex items-center'}>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={fields.length <= 1}
                  onClick={() => remove(index)}
                  aria-label="Remove fee line"
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <p className="text-right text-sm font-medium text-foreground">
          Total: {formatAmount(lineTotal)}
        </p>
      </FormSection>

      <FormSwitchField
        control={control}
        name="is_active"
        label="Active assignment"
        onLabel="Yes"
        offLabel="No"
      />
    </EntityFormDialog>
  );
}
