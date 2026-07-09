import * as React from 'react';
import { cn } from '@utils/cn';
import { controlHeightClassName, controlInputClassName } from '@utils/form-control';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** @deprecated Prefer FormField wrapper for labels */
  label?: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, id, ...props }, ref) => {
    const inputElement = (
      <input
        type={type}
        id={id}
        className={cn(
          controlInputClassName,
          controlHeightClassName,
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
          error && 'border-destructive focus-visible:ring-destructive',
          className,
        )}
        ref={ref}
        aria-invalid={error ? true : props['aria-invalid']}
        {...props}
      />
    );

    if (!label) return inputElement;

    return (
      <div className="space-y-1">
        <label htmlFor={id} className="text-sm font-medium leading-none text-foreground">
          {label}
        </label>
        {inputElement}
        {error && (
          <p className="text-xs text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);
Input.displayName = 'Input';

export { Input };
