import { cn } from '@utils/cn';

/** Shared control chrome for inputs, selects, and textareas. */
export const controlInputClassName = cn(
  'flex w-full rounded-sm border border-input bg-card px-3 text-sm transition-colors duration-fast',
  'placeholder:text-muted-foreground',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
  'disabled:cursor-not-allowed disabled:opacity-50',
  'read-only:cursor-default read-only:bg-muted/30',
  'aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:ring-destructive',
);

/** Prefer density tokens when present; fall back to 2.25rem. */
export const controlHeightClassName = 'h-9 min-h-[var(--control-height-md,2.25rem)] py-1';

export function fieldIds(name: string) {
  const base = name.replace(/[^a-zA-Z0-9_-]/g, '-');
  return {
    inputId: `${base}-field`,
    hintId: `${base}-hint`,
    errorId: `${base}-error`,
  };
}

export function describedBy(hintId?: string, errorId?: string, error?: string) {
  const ids: string[] = [];
  if (error && errorId) ids.push(errorId);
  else if (hintId) ids.push(hintId);
  return ids.length > 0 ? ids.join(' ') : undefined;
}
