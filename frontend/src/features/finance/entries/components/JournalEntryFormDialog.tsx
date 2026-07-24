import { useEffect, useMemo } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2 } from 'lucide-react';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import {
  FormDateField,
  FormSelectField,
  FormTextField,
  FormTextareaField,
} from '@components/forms/fields';
import { Button } from '@components/ui/button';
import { FormField } from '@components/forms/FormField';
import { Input } from '@components/ui/input';
import { Select } from '@components/ui/select';
import { Controller } from 'react-hook-form';
import type { EntryType, JournalEntryCreatePayload, Ledger } from '@app-types/finance';
import { todayIsoDate } from '@utils/student';

const lineSchema = z.object({
  ledger_id: z.string().min(1, 'Ledger required'),
  amount: z.string().min(1, 'Amount required'),
  dc: z.enum(['dr', 'cr']),
  narration: z.string().optional(),
});

const formSchema = z.object({
  entrytype_id: z.string().min(1, 'Entry type required'),
  date: z.string().min(1, 'Date required'),
  notes: z.string().optional(),
  items: z.array(lineSchema).min(2, 'At least two lines are required'),
});

export type JournalEntryFormValues = z.infer<typeof formSchema>;

interface JournalEntryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entryTypes: EntryType[];
  ledgers: Ledger[];
  onSubmit: (payload: JournalEntryCreatePayload) => void;
  isLoading?: boolean;
}

function toPayload(values: JournalEntryFormValues): JournalEntryCreatePayload {
  return {
    entrytype_id: Number(values.entrytype_id),
    date: values.date,
    notes: values.notes?.trim() || '',
    items: values.items.map((line) => ({
      ledger_id: Number(line.ledger_id),
      amount: Number(line.amount),
      dc: line.dc,
      narration: line.narration?.trim() || '',
    })),
  };
}

export function JournalEntryFormDialog({
  open,
  onOpenChange,
  entryTypes,
  ledgers,
  onSubmit,
  isLoading,
}: JournalEntryFormDialogProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<JournalEntryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      entrytype_id: '',
      date: todayIsoDate(),
      notes: '',
      items: [
        { ledger_id: '', amount: '', dc: 'dr', narration: '' },
        { ledger_id: '', amount: '', dc: 'cr', narration: '' },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const watchedItems = useWatch({ control, name: 'items' });

  const { drTotal, crTotal, balanced } = useMemo(() => {
    let dr = 0;
    let cr = 0;
    for (const line of watchedItems ?? []) {
      const amt = Number(line.amount) || 0;
      if (line.dc === 'dr') dr += amt;
      if (line.dc === 'cr') cr += amt;
    }
    return {
      drTotal: dr,
      crTotal: cr,
      balanced: Math.abs(dr - cr) < 0.005 && dr > 0,
    };
  }, [watchedItems]);

  useEffect(() => {
    if (!open) return;
    const firstType = entryTypes[0];
    reset({
      entrytype_id: firstType ? String(firstType.id) : '',
      date: todayIsoDate(),
      notes: '',
      items: [
        { ledger_id: '', amount: '', dc: 'dr', narration: '' },
        { ledger_id: '', amount: '', dc: 'cr', narration: '' },
      ],
    });
  }, [open, entryTypes, reset]);

  const entryTypeOptions = entryTypes.map((t) => ({
    value: String(t.id),
    label: t.name || t.label,
  }));
  const ledgerOptions = ledgers.map((l) => ({
    value: String(l.id),
    label: l.code ? `${l.name} (${l.code})` : l.name,
  }));

  return (
    <EntityFormDialog
      open={open}
      onOpenChange={onOpenChange}
      isLoading={isLoading}
      title="New journal entry"
      description="Debits and credits must balance. Add at least one debit and one credit line."
      submitLabel="Post entry"
      submitDisabled={!balanced}
      onSubmit={handleSubmit((values) => onSubmit(toPayload(values)))}
      size="lg"
      scrollable
      className="sm:max-w-3xl"
    >
      <FormErrorSummary errors={errors} />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormSelectField
          control={control}
          name="entrytype_id"
          label="Entry type"
          options={entryTypeOptions}
          required
        />
        <FormDateField control={control} name="date" label="Date" required />
      </div>
      <FormTextareaField control={control} name="notes" label="Notes" />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Lines</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => append({ ledger_id: '', amount: '', dc: 'dr', narration: '' })}
          >
            <Plus className="h-4 w-4" />
            Add line
          </Button>
        </div>

        {fields.map((field, index) => (
          <div
            key={field.id}
            className="grid gap-2 rounded-md border p-3 sm:grid-cols-[1fr_100px_110px_1fr_auto]"
          >
            <FormSelectField
              control={control}
              name={`items.${index}.ledger_id`}
              label={index === 0 ? 'Ledger' : ''}
              options={ledgerOptions}
              placeholder="Ledger"
              required
            />
            <FormField label={index === 0 ? 'Dr/Cr' : ''} htmlFor={`items.${index}.dc`}>
              <Controller
                control={control}
                name={`items.${index}.dc`}
                render={({ field: f }) => (
                  <Select
                    id={`items.${index}.dc`}
                    options={[
                      { value: 'dr', label: 'Debit' },
                      { value: 'cr', label: 'Credit' },
                    ]}
                    value={f.value}
                    onChange={f.onChange}
                  />
                )}
              />
            </FormField>
            <FormField
              label={index === 0 ? 'Amount' : ''}
              htmlFor={`items.${index}.amount`}
              error={errors.items?.[index]?.amount?.message}
            >
              <Controller
                control={control}
                name={`items.${index}.amount`}
                render={({ field: f }) => (
                  <Input id={`items.${index}.amount`} type="number" step="0.01" min="0" {...f} />
                )}
              />
            </FormField>
            <FormTextField
              control={control}
              name={`items.${index}.narration`}
              label={index === 0 ? 'Narration' : ''}
            />
            <div className={index === 0 ? 'pt-7' : 'pt-1'}>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={fields.length <= 2}
                onClick={() => remove(index)}
                aria-label={`Remove line ${index + 1}`}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}

        <p className="text-sm text-muted-foreground">
          Totals — Dr {drTotal.toFixed(2)} / Cr {crTotal.toFixed(2)}
          {balanced ? ' (balanced)' : ' (must balance)'}
        </p>
      </div>
    </EntityFormDialog>
  );
}
