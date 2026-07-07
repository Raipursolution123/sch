import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog';
import { FormField } from '@components/forms/FormField';
import { Select } from '@components/ui/select';
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <DialogHeader>
            <DialogTitle>Collect Fee</DialogTitle>
            <DialogDescription>Record a payment for {feeLine?.feetype_name}.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <p className="text-sm font-medium">Amount to pay</p>
              <p className="text-2xl font-bold tracking-tight">
                ₹{feeLine?.balance?.toFixed(2) ?? '0.00'}
              </p>
            </div>

            <FormField label="Date of Payment" htmlFor="date" error={errors.date?.message} required>
              <Controller
                name="date"
                control={control}
                render={({ field }) => (
                  <Input type="date" id="date" {...field} value={field.value || ''} />
                )}
              />
            </FormField>

            <FormField
              label="Payment Mode"
              htmlFor="payment_mode"
              error={errors.payment_mode?.message}
              required
            >
              <Controller
                name="payment_mode"
                control={control}
                render={({ field }) => (
                  <Select
                    id="payment_mode"
                    placeholder="Select mode"
                    options={PAYMENT_MODES}
                    value={field.value || ''}
                    onChange={field.onChange}
                  />
                )}
              />
            </FormField>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !feeLine}>
              {isLoading ? 'Processing...' : 'Confirm Payment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
