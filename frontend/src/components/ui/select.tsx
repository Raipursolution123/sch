import * as React from 'react';
import { cn } from '@utils/cn';
import { controlHeightClassName, controlInputClassName } from '@utils/form-control';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  /** @deprecated Prefer FormField wrapper for labels */
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, id, options, placeholder, ...props }, ref) => {
    const selectElement = (
      <select
        id={id}
        ref={ref}
        className={cn(
          controlInputClassName,
          controlHeightClassName,
          error && 'border-destructive focus-visible:ring-destructive',
          className,
        )}
        aria-invalid={error ? true : props['aria-invalid']}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );

    if (!label) return selectElement;

    return (
      <div className="space-y-1">
        <label htmlFor={id} className="text-sm font-medium leading-none text-foreground">
          {label}
        </label>
        {selectElement}
        {error && (
          <p className="text-xs text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);
Select.displayName = 'Select';

export { Select };
