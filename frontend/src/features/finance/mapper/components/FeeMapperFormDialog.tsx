import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormSelectField } from '@components/forms/fields';
import type { FeeHeadMapper, FeeHeadMapperPayload, Ledger } from '@app-types/finance';
import type { FeeType } from '@app-types/fees/fee-type';

const schema = z.object({
  head_id: z.string().min(1, 'Fee head required'),
  ledger_id: z.string().min(1, 'Ledger required'),
});

export type FeeMapperFormValues = z.infer<typeof schema>;

interface FeeMapperFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mapper?: FeeHeadMapper | null;
  feeTypes: FeeType[];
  ledgers: Ledger[];
  onSubmit: (payload: FeeHeadMapperPayload) => void;
  isLoading?: boolean;
}

export function FeeMapperFormDialog({
  open,
  onOpenChange,
  mapper,
  feeTypes,
  ledgers,
  onSubmit,
  isLoading,
}: FeeMapperFormDialogProps) {
  const isEdit = Boolean(mapper);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FeeMapperFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { head_id: '', ledger_id: '' },
  });

  useEffect(() => {
    if (!open) return;
    reset({
      head_id: mapper ? String(mapper.head_id) : '',
      ledger_id: mapper ? String(mapper.ledger_id) : '',
    });
  }, [open, mapper, reset]);

  const feeOptions = feeTypes.map((f) => ({
    value: String(f.id),
    label: f.code ? `${f.name} (${f.code})` : f.name,
  }));
  const ledgerOptions = ledgers.map((l) => ({
    value: String(l.id),
    label: l.code ? `${l.name} (${l.code})` : l.name,
  }));

  return (
    <EntityFormDialog
      open={open}
      onOpenChange={onOpenChange}
      isEdit={isEdit}
      isLoading={isLoading}
      title={isEdit ? 'Edit account mapper' : 'Add account mapper'}
      description="Map a fee head to an income ledger for automatic posting."
      submitLabel={isEdit ? 'Save changes' : 'Create mapping'}
      onSubmit={handleSubmit((values) =>
        onSubmit({
          head_id: Number(values.head_id),
          ledger_id: Number(values.ledger_id),
        }),
      )}
      size="sm"
    >
      <FormErrorSummary errors={errors} />
      <FormSelectField
        control={control}
        name="head_id"
        label="Fee head"
        options={feeOptions}
        placeholder="Select fee type"
        required
      />
      <FormSelectField
        control={control}
        name="ledger_id"
        label="Ledger"
        options={ledgerOptions}
        placeholder="Select ledger"
        required
      />
    </EntityFormDialog>
  );
}
