import { cn } from '@utils/cn';

interface FormAutosaveIndicatorProps {
  status: 'idle' | 'saving' | 'saved' | 'error';
  className?: string;
}

export function FormAutosaveIndicator({ status, className }: FormAutosaveIndicatorProps) {
  if (status === 'idle') return null;

  const label =
    status === 'saving'
      ? 'Saving…'
      : status === 'saved'
        ? 'All changes saved'
        : 'Could not save changes';

  return (
    <p
      className={cn(
        'text-xs font-medium',
        status === 'error' ? 'text-destructive' : 'text-muted-foreground',
        className,
      )}
      role="status"
      aria-live="polite"
    >
      {label}
    </p>
  );
}
