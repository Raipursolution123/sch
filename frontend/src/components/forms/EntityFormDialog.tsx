import type { FormEventHandler, ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog';
import { Button } from '@components/ui/button';
import { cn } from '@utils/cn';

interface EntityFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  onSubmit: FormEventHandler<HTMLFormElement>;
  isLoading?: boolean;
  isEdit?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  submitDisabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  /** Scrollable body for long multi-section forms (e.g. staff profile). */
  scrollable?: boolean;
}

const sizeClassName = {
  sm: 'sm:max-w-md',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
} as const;

/** Standard create/edit dialog shell for entity CRUD forms. */
export function EntityFormDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  onSubmit,
  isLoading,
  isEdit,
  submitLabel,
  cancelLabel = 'Cancel',
  submitDisabled,
  size = 'md',
  className,
  scrollable,
}: EntityFormDialogProps) {
  const resolvedSubmit = submitLabel ?? (isEdit ? 'Save changes' : 'Create');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(sizeClassName[size], scrollable && 'flex max-h-[90vh] flex-col', className)}
      >
        <form
          onSubmit={onSubmit}
          noValidate
          className={scrollable ? 'flex min-h-0 flex-1 flex-col' : undefined}
        >
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>

          <div
            className={
              scrollable
                ? 'min-h-0 flex-1 space-y-6 overflow-y-auto py-4 pr-1'
                : 'space-y-4 py-4'
            }
          >
            {children}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {cancelLabel}
            </Button>
            <Button type="submit" isLoading={isLoading} disabled={submitDisabled}>
              {resolvedSubmit}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
