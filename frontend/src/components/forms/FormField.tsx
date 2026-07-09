import type { ReactNode } from 'react';
import { cn } from '@utils/cn';
import { describedBy, fieldIds } from '@utils/form-control';

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  name?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  optional?: boolean;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
}

export function FormField({
  label,
  htmlFor,
  name,
  error,
  hint,
  required,
  optional,
  disabled,
  className,
  children,
}: FormFieldProps) {
  const ids = fieldIds(htmlFor ?? name ?? label);
  const inputId = htmlFor ?? ids.inputId;

  return (
    <div className={cn('space-y-1.5', disabled && 'opacity-60', className)}>
      <div className="flex items-baseline gap-2">
        <label htmlFor={inputId} className="text-sm font-medium leading-none text-foreground">
          {label}
          {required && (
            <span className="ml-0.5 text-destructive" aria-hidden="true">
              *
            </span>
          )}
        </label>
        {optional && !required && (
          <span className="text-xs text-muted-foreground">(optional)</span>
        )}
      </div>
      {children}
      {hint && !error && (
        <p id={ids.hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p id={ids.errorId} className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function getFormFieldA11yProps(
  htmlFor: string,
  options?: { hint?: string; error?: string },
) {
  const ids = fieldIds(htmlFor);
  return {
    inputId: htmlFor,
    hintId: ids.hintId,
    errorId: ids.errorId,
    'aria-invalid': options?.error ? true : undefined,
    'aria-describedby': describedBy(ids.hintId, ids.errorId, options?.error),
  } as const;
}
