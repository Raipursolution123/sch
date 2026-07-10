import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormDateField, FormSelectField } from '@components/forms/fields';
import type { StudentFeeLine } from '@app-types/students/student-fees';

const collectFeeSchema = z.object({
  date: z.string().min(1, 'Payment date is required'),
  payment_mode: z.string().min(1, 'Payment mode is required'),
});

type CollectFeeFormValues = z.infer<typeof collectFeeSchema>;

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
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CollectFeeFormValues>({
    resolver: zodResolver(collectFeeSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      payment_mode: 'Cash',
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        date: new Date().toISOString().split('T')[0],
        payment_mode: 'Cash',
      });
    }
  }, [open, reset]);

  const handleFormSubmit = (values: CollectFeeFormValues) => {
    if (!feeLine) return;

    onSubmit({
      amount: feeLine.balance,
      feetype_id: feeLine.feetype_id,
      date: values.date,
      payment_mode: values.payment_mode,
      description: `Paid ${feeLine.feetype_name}`,
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
      submitDisabled={!feeLine}
      onSubmit={handleSubmit(handleFormSubmit)}
      size="sm"
    >
      <FormErrorSummary errors={errors} />

      <div className="grid gap-2">
        <p className="text-sm font-medium">Amount to pay</p>
        <p className="text-2xl font-bold tracking-tight">
          ₹{feeLine?.balance?.toFixed(2) ?? '0.00'}
        </p>
      </div>

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
