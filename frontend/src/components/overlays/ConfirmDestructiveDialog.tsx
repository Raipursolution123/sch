import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@components/ui/alert-dialog';
import { Button } from '@components/ui/button';
import { FormField } from '@components/forms/FormField';
import { Textarea } from '@components/ui/textarea';

interface ConfirmDestructiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: (reason?: string) => void;
  isLoading?: boolean;
  requireReason?: boolean;
  reasonLabel?: string;
  reasonPlaceholder?: string;
}

/** Destructive confirmation with optional reason capture (reject, delete, waive). */
export function ConfirmDestructiveDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  isLoading,
  requireReason = false,
  reasonLabel = 'Reason',
  reasonPlaceholder = 'Explain why this action is needed…',
}: ConfirmDestructiveDialogProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setReason('');
      setError('');
    }
    onOpenChange(next);
  };

  const handleConfirm = () => {
    const trimmed = reason.trim();
    if (requireReason && !trimmed) {
      setError('A reason is required');
      return;
    }
    onConfirm(requireReason ? trimmed : undefined);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        {requireReason && (
          <FormField
            label={reasonLabel}
            htmlFor="destructive-reason"
            error={error}
            required
            className="py-2"
          >
            <Textarea
              id="destructive-reason"
              rows={3}
              value={reason}
              onChange={(event) => {
                setReason(event.target.value);
                setError('');
              }}
              placeholder={reasonPlaceholder}
              aria-invalid={Boolean(error)}
            />
          </FormField>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>{cancelLabel}</AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            disabled={isLoading}
            isLoading={isLoading}
            onClick={handleConfirm}
          >
            {confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
