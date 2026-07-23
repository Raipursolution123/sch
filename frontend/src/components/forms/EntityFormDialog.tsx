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
  /**
   * Keep header/footer fixed and scroll the body when content exceeds the viewport.
   * Defaults to true so dialogs never clip at the top/bottom of the screen.
   */
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
  scrollable = true,
}: EntityFormDialogProps) {
  const resolvedSubmit = submitLabel ?? (isEdit ? 'Save changes' : 'Create');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          sizeClassName[size],
          // Override DialogContent `grid` so header/body/footer can flex within max-height.
          scrollable && 'flex max-h-[90dvh] max-h-[90vh] flex-col gap-0 overflow-hidden',
          className,
        )}
      >
        <form
          onSubmit={onSubmit}
          noValidate
          className={scrollable ? 'flex min-h-0 flex-1 flex-col overflow-hidden' : undefined}
        >
          <DialogHeader className={scrollable ? 'shrink-0 pr-6' : undefined}>
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>

          <div
            className={
              scrollable
                ? 'min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain py-4 pr-1'
                : 'space-y-4 py-4'
            }
          >
            {children}
          </div>

          <DialogFooter className={scrollable ? 'shrink-0' : undefined}>
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
