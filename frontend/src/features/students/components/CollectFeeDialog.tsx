import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormDateField, FormNumberField, FormSelectField } from '@components/forms/fields';
import type { StudentFeeLine } from '@app-types/students/student-fees';
import { formatAmount } from '@utils/format';

function createCollectFeeSchema(maxBalance: number) {
  return z.object({
    amount: z
      .number({ message: 'Amount is required' })
      .min(0.01, 'Amount must be at least 0.01')
      .max(maxBalance, `Amount cannot exceed balance of ${formatAmount(maxBalance)}`),
    date: z.string().min(1, 'Payment date is required'),
    payment_mode: z.string().min(1, 'Payment mode is required'),
  });
}

type CollectFeeFormValues = z.infer<ReturnType<typeof createCollectFeeSchema>>;

interface CollectFeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feeLine: StudentFeeLine | null;
  onSubmit: (payload: {
    amount: number;
    feetype_id: number;
    date: string;
    payment_mode: string;
    description: string;
  }) => void;
  isLoading?: boolean;
}

const PAYMENT_MODES = [
  { value: 'Cash', label: 'Cash' },
  { value: 'Cheque', label: 'Cheque' },
  { value: 'Bank Transfer', label: 'Bank Transfer' },
  { value: 'Online', label: 'Online' },
];

export function CollectFeeDialog({
  open,
  onOpenChange,
  feeLine,
  onSubmit,
  isLoading,
}: CollectFeeDialogProps) {
  const maxBalance = feeLine?.balance ?? 0;
  const schema = useMemo(() => createCollectFeeSchema(maxBalance), [maxBalance]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CollectFeeFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: maxBalance,
      date: new Date().toISOString().split('T')[0],
      payment_mode: 'Cash',
    },
  });

  useEffect(() => {
    if (open && feeLine) {
      reset({
        amount: feeLine.balance,
        date: new Date().toISOString().split('T')[0],
        payment_mode: 'Cash',
      });
    }
  }, [open, feeLine, reset]);

  const handleFormSubmit = (values: CollectFeeFormValues) => {
    if (!feeLine) return;

    const isFullPayment = values.amount >= feeLine.balance;
    onSubmit({
      amount: values.amount,
      feetype_id: feeLine.feetype_id,
      date: values.date,
      payment_mode: values.payment_mode,
      description: isFullPayment
        ? `Paid ${feeLine.feetype_name}`
        : `Partial payment for ${feeLine.feetype_name}`,
    });
  };

  return (
    <EntityFormDialog
      open={open}
      onOpenChange={onOpenChange}
      isLoading={isLoading}
      title="Collect Fee"
      description={feeLine ? `Record a payment for ${feeLine.feetype_name}.` : undefined}
      submitLabel="Confirm Payment"
      submitDisabled={!feeLine || maxBalance <= 0}
      onSubmit={handleSubmit(handleFormSubmit)}
      size="sm"
    >
      <FormErrorSummary errors={errors} />

      {feeLine && (
        <p className="text-sm text-muted-foreground">
          Outstanding balance:{' '}
          <span className="font-medium text-foreground">{formatAmount(feeLine.balance)}</span>
        </p>
      )}

      <FormNumberField
        control={control}
        name="amount"
        label="Amount"
        min={0.01}
        max={maxBalance > 0 ? maxBalance : undefined}
        step={0.01}
        required
        disabled={!feeLine || maxBalance <= 0}
      />

      <FormDateField control={control} name="date" label="Date of Payment" required />
      <FormSelectField
        control={control}
        name="payment_mode"
        label="Payment Mode"
        placeholder="Select mode"
        options={PAYMENT_MODES}
        required
      />
    </EntityFormDialog>
  );
}
