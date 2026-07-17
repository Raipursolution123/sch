import * as React from 'react';
import { cn } from '@utils/cn';
import { controlHeightClassName, controlInputClassName } from '@utils/form-control';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  /** @deprecated Prefer FormField wrapper for labels */
  label?: string;
  error?: string;
  options?: { value: string; label: string }[];
  placeholder?: string;
  onValueChange?: (value: string) => void;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      error,
      id,
      options,
      placeholder,
      onValueChange,
      onChange,
      children,
      ...props
    },
    ref,
  ) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      onChange?.(e);
      onValueChange?.(e.target.value);
    };

    const selectElement = (
      <select
        id={id}
        ref={ref}
        onChange={handleChange}
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
        {options
          ? options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))
          : children}
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

// Polyfill exports for Shadcn UI API compatibility (renders native HTML tags)
export const SelectTrigger = React.forwardRef<
  HTMLOptGroupElement,
  React.HTMLAttributes<HTMLOptGroupElement>
>(({ children, ...props }, ref) => (
  <optgroup ref={ref} style={{ display: 'none' }} label="trigger" {...props}>
    {children}
  </optgroup>
));
SelectTrigger.displayName = 'SelectTrigger';

export const SelectValue = React.forwardRef<
  HTMLOptionElement,
  React.OptionHTMLAttributes<HTMLOptionElement> & { placeholder?: React.ReactNode }
>(({ placeholder, ...props }, ref) => (
  <option ref={ref} value="" disabled {...props}>
    {placeholder}
  </option>
));
SelectValue.displayName = 'SelectValue';

export const SelectContent = React.forwardRef<
  HTMLOptGroupElement,
  React.HTMLAttributes<HTMLOptGroupElement>
>(({ children, ...props }, ref) => <React.Fragment>{children}</React.Fragment>);
SelectContent.displayName = 'SelectContent';

export const SelectItem = React.forwardRef<
  HTMLOptionElement,
  React.OptionHTMLAttributes<HTMLOptionElement>
>(({ value, children, ...props }, ref) => (
  <option ref={ref} value={value} {...props}>
    {children}
  </option>
));
SelectItem.displayName = 'SelectItem';

export { Select };
